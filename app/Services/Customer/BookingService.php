<?php

namespace App\Services\Customer;

use App\Models\Booking;
use App\Models\CustomerDiscount;
use App\Models\Discount;
use App\Models\DiscountApplicable;
use App\Models\DiscountUsage;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;

class BookingService
{
    public function createBooking(array $data, User $customer): Booking
    {
        return DB::transaction(function () use ($data, $customer) {
            $service = Service::findOrFail($data['service_id']);

            $barberService = DB::table('barber_services')
                ->where('barber_id', $data['barber_id'])
                ->where('service_id', $data['service_id'])
                ->where('is_available', true)
                ->first();

            if (!$barberService) {
                throw new \Exception('Barber does not offer this service');
            }

            $startTime = Carbon::parse($data['start_time']);
            $endTime = $startTime->copy()->addMinutes($service->duration);

            $this->checkSlotConflict($data['barber_id'], $data['booking_date'], $data['start_time'], $endTime->format('H:i'));

            $originalPrice = $barberService->custom_price ?? $service->base_price;

            $discountResult = $this->applyDiscount(
                $data['discount_code'] ?? null,
                $data['service_id'],
                $data['barber_id'],
                $originalPrice,
                $customer
            );

            $booking = Booking::create([
                'customer_id' => $customer->id,
                'barber_id' => $data['barber_id'],
                'service_id' => $data['service_id'],
                'booking_date' => $data['booking_date'],
                'start_time' => $data['start_time'],
                'end_time' => $endTime->format('H:i:s'),
                'original_price' => $originalPrice,
                'discount_id' => $discountResult['discount_id'] ?? null,
                'discount_amount' => $discountResult['discount_amount'] ?? 0,
                'total_price' => $discountResult['total_price'] ?? $originalPrice,
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'notes' => $data['notes'] ?? null,
            ]);

            if ($discountResult['discount_id'] ?? null) {
                $this->recordDiscountUsage(
                    $discountResult['discount_id'],
                    $booking->id,
                    $originalPrice,
                    $discountResult['discount_amount'],
                    $discountResult['total_price'],
                    $customer
                );
            }

            return $booking;
        });
    }

    protected function checkSlotConflict(int $barberId, string $date, string $startTime, string $endTime): void
    {
        $conflict = Booking::where('barber_id', $barberId)
            ->where('booking_date', $date)
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($startTime, $endTime) {
                $q->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime]);
            })
            ->exists();

        if ($conflict) {
            throw new \Exception('This time slot is not available');
        }
    }

    protected function applyDiscount(?string $code, int $serviceId, int $barberId, int $originalPrice, User $customer): array
    {
        if (!$code) {
            return ['discount_amount' => 0, 'total_price' => $originalPrice];
        }

        $discount = Discount::where('code', $code)->first();

        if (!$discount) {
            throw new \Exception('Discount code not found');
        }

        if (!$discount->is_active) {
            throw new \Exception('Discount is not active');
        }

        $now = Carbon::now();
        if ($now->lt($discount->start_date) || $now->gt($discount->end_date)) {
            throw new \Exception('Discount is not valid at this time');
        }

        if ($discount->usage_limit && $discount->used_count >= $discount->usage_limit) {
            throw new \Exception('Discount limit exceeded');
        }

        if ($discount->min_order_amount && $originalPrice < $discount->min_order_amount) {
            throw new \Exception('Discount minimum order amount is ' . $discount->min_order_amount);
        }

        $service = Service::find($serviceId);
        $barber = User::find($barberId);

        if (!$service || !$barber) {
            throw new \Exception('Invalid service or barber');
        }

        if ($discount->applies_to === 'specific') {
            $isApplicable = DiscountApplicable::where('discount_id', $discount->id)
                ->where(function ($q) use ($service, $barber) {
                    $q->where(function ($sub) use ($service) {
                        $sub->where('applicable_type', 'service')->where('applicable_id', $service->id);
                    })->orWhere(function ($sub) use ($service) {
                        $sub->where('applicable_type', 'category')->where('applicable_id', $service->category_id);
                    })->orWhere(function ($sub) use ($barber) {
                        $sub->where('applicable_type', 'barber')->where('applicable_id', $barber->id);
                    });
                })
                ->exists();

            if (!$isApplicable) {
                throw new \Exception('Discount is not applicable to selected service or barber');
            }
        }

        if ($discount->customer_usage_limit) {
            $usageCount = DiscountUsage::where('discount_id', $discount->id)
                ->where('customer_id', $customer->id)
                ->count();

            if ($usageCount >= $discount->customer_usage_limit) {
                throw new \Exception('You have reached the usage limit for this discount');
            }
        }

        $discountAmount = $discount->discount_type === 'percentage'
            ? $originalPrice * ($discount->discount_value / 100)
            : $discount->discount_value;

        if ($discount->max_discount_amount && $discountAmount > $discount->max_discount_amount) {
            $discountAmount = $discount->max_discount_amount;
        }

        return [
            'discount_id' => $discount->id,
            'discount_amount' => $discountAmount,
            'total_price' => $originalPrice - $discountAmount,
        ];
    }

    protected function recordDiscountUsage(int $discountId, int $bookingId, int $original, int $discountAmount, int $final, User $customer): void
    {
        DiscountUsage::create([
            'discount_id' => $discountId,
            'customer_id' => $customer->id,
            'booking_id' => $bookingId,
            'original_amount' => $original,
            'discount_amount' => $discountAmount,
            'final_amount' => $final,
            'used_at' => Carbon::now(),
        ]);

        Discount::where('id', $discountId)->increment('used_count');

        $customerDiscount = CustomerDiscount::where('customer_id', $customer->id)
            ->where('discount_id', $discountId)
            ->first();

        if ($customerDiscount) {
            $customerDiscount->increment('used_count');
        } else {
            CustomerDiscount::create([
                'customer_id' => $customer->id,
                'discount_id' => $discountId,
                'used_count' => 1,
            ]);
        }
    }

    public function generateSnapToken(Booking $booking, User $user): string
    {
        if ($booking->payment_status !== 'unpaid' || in_array($booking->status, ['cancelled', 'completed'])) {
            return back()->withErrors(['error' => 'Booking cannot be paid']);
        }

        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;

        $booking->loadMissing(['barber.barberProfile', 'service']);

        $params = [
            'transaction_details' => [
                'order_id' => 'BOOKING-' . $booking->id,
                'gross_amount' => (int)$booking->total_price,
            ],
            'item_details' => [[
                'id' => $booking->service_id,
                'price' => (int)$booking->total_price,
                'quantity' => 1,
                'name' => $booking->service->name . ' with ' . $booking->barber->name,
            ]],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '08123456789',
            ],
            'expiry' => [
                'start_time' => now()->addMinutes(1)->format('Y-m-d H:i:s O'),
                'unit' => 'hour',
                'duration' => 1,
            ],
        ];

        $snapToken = Snap::getSnapToken($params);

        return $snapToken;
    }
}

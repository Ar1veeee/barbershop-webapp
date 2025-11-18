<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Booking;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DiscountController extends Controller
{
    /**
     * Menampilkan list diskon yang tersedia untuk customer
     */
    public function index(Request $request)
    {
        $query = Discount::where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->with(['discountApplicables', 'customerDiscounts' => function ($q) {
                $q->where('customer_id', auth()->id());
            }]);

        // Filter berdasarkan type diskon
        if ($request->type && $request->type !== 'all') {
            $query->where('discount_type', $request->type);
        }

        // Filter berdasarkan applies_to
        if ($request->applies_to && $request->applies_to !== 'all') {
            $query->where('applies_to', $request->applies_to);
        }

        // Filter diskon yang masih memiliki kuota
        if ($request->has_quota) {
            $query->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereRaw('usage_limit > used_count');
            });
        }

        // Filter berdasarkan search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        $discounts = $query->orderBy('created_at', 'desc')
            ->paginate(12)
            ->through(function ($discount) {
                return [
                    'id' => $discount->id,
                    'name' => $discount->name,
                    'code' => $discount->code,
                    'description' => $discount->description,
                    'discount_type' => $discount->discount_type,
                    'discount_value' => $discount->discount_value,
                    'max_discount_amount' => $discount->max_discount_amount,
                    'min_order_amount' => $discount->min_order_amount,
                    'start_date' => $discount->start_date,
                    'end_date' => $discount->end_date,
                    'usage_limit' => $discount->usage_limit,
                    'used_count' => $discount->used_count,
                    'customer_usage_limit' => $discount->customer_usage_limit,
                    'applies_to' => $discount->applies_to,
                    'remaining_quota' => $discount->usage_limit ? $discount->usage_limit - $discount->used_count : null,
                    'is_available' => $this->checkDiscountAvailability($discount),
                    'customer_usage' => $discount->customerDiscounts->first(),
                    'applicables' => $discount->discountApplicables->map(function ($applicable) {
                        return [
                            'type' => $applicable->applicable_type,
                            'id' => $applicable->applicable_id
                        ];
                    })
                ];
            });

        return Inertia::render('Customer/Discounts/Index', [
            'discounts' => $discounts,
            'filters' => $request->only(['type', 'applies_to', 'has_quota', 'search']),
        ]);
    }

    /**
     * Get detail diskon
     */
    public function show(Discount $discount)
    {
        $discount->load(['discountApplicables.applicable', 'customerDiscounts' => function ($q) {
            $q->where('customer_id', auth()->id());
        }]);

        $isAvailable = $this->checkDiscountAvailability($discount);

        return Inertia::render('Customer/Discounts/Show', [
            'discount' => [
                'id' => $discount->id,
                'name' => $discount->name,
                'code' => $discount->code,
                'description' => $discount->description,
                'discount_type' => $discount->discount_type,
                'discount_value' => $discount->discount_value,
                'max_discount_amount' => $discount->max_discount_amount,
                'min_order_amount' => $discount->min_order_amount,
                'start_date' => $discount->start_date,
                'end_date' => $discount->end_date,
                'usage_limit' => $discount->usage_limit,
                'used_count' => $discount->used_count,
                'customer_usage_limit' => $discount->customer_usage_limit,
                'applies_to' => $discount->applies_to,
                'is_available' => $isAvailable,
                'customer_usage' => $discount->customerDiscounts->first(),
                'applicables' => $discount->discountApplicables->map(function ($applicable) {
                    return [
                        'type' => $applicable->applicable_type,
                        'name' => $applicable->applicable->name ?? null,
                    ];
                })
            ]
        ]);
    }

    public function recommendations(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'barber_id' => 'required|exists:users,id',
            'original_price' => 'required|numeric',
        ]);

        $serviceId = $request->service_id;
        $barberId = $request->barber_id;
        $originalPrice = $request->original_price;
        $userId = auth()->id();

        $discounts = Discount::where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->with(['discountApplicables', 'customerDiscounts' => function ($q) use ($userId) {
                $q->where('customer_id', $userId);
            }])
            ->get();

        $recommendations = [];

        foreach ($discounts as $discount) {
            if (!$this->checkDiscountAvailability($discount)) {
                continue;
            }

            if (!$this->validateDiscountApplicability($discount, $serviceId, $barberId)) {
                continue;
            }

            $isEligible = true;
            $message = null;

            if ($discount->min_order_amount && $originalPrice < $discount->min_order_amount) {
                $isEligible = false;
                $message = "Min. order Rp " . number_format($discount->min_order_amount);
                continue;
            }

            $discountAmount = $this->calculateDiscountAmount($discount, $originalPrice);

            $recommendations[] = [
                'id' => $discount->id,
                'name' => $discount->name,
                'code' => $discount->code,
                'description' => $discount->description,
                'discount_type' => $discount->discount_type,
                'discount_value' => $discount->discount_value,
                'min_order_amount' => $discount->min_order_amount,
                'discount_amount' => $discountAmount,
                'final_price' => $originalPrice - $discountAmount,
                'is_eligible' => $isEligible,
                'eligibility_message' => $message,
            ];
        }

        usort($recommendations, function ($a, $b) {
            return $b['discount_amount'] <=> $a['discount_amount'];
        });

        return response()->json([
            'success' => true,
            'recommendations' => $recommendations
        ]);
    }

    public function usageHistory(Request $request)
    {
        $query = DiscountUsage::where('customer_id', auth()->id())
            ->with(['discount', 'booking.service', 'booking.barber']);

        // Filter berdasarkan tanggal
        if ($request->date_from) {
            $query->whereDate('used_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('used_at', '<=', $request->date_to);
        }

        $usages = $query->orderBy('used_at', 'desc')
            ->paginate(15)
            ->through(function ($usage) {
                return [
                    'id' => $usage->id,
                    'discount_name' => $usage->discount->name,
                    'discount_code' => $usage->discount->code,
                    'service_name' => $usage->booking->service->name,
                    'barber_name' => $usage->booking->barber->name,
                    'original_amount' => $usage->original_amount,
                    'discount_amount' => $usage->discount_amount,
                    'final_amount' => $usage->final_amount,
                    'used_at' => $usage->used_at,
                    'booking_date' => $usage->booking->booking_date,
                ];
            });

        return Inertia::render('Customer/Discounts/UsageHistory', [
            'usages' => $usages,
            'filters' => $request->only(['date_from', 'date_to']),
        ]);
    }

    /**
     * Validasi dan apply diskon saat booking
     */
    public function validateDiscount(Request $request)
    {
        $request->validate([
            'discount_code' => 'required|string',
            'service_id' => 'required|exists:services,id',
            'barber_id' => 'required|exists:users,id',
            'original_price' => 'required|numeric|min:0',
        ]);

        $discount = Discount::where('code', $request->discount_code)
            ->where('is_active', true)
            ->first();

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Kode diskon tidak valid atau tidak ditemukan.'
            ], 404);
        }

        // Validasi periode diskon
        if (now()->lt($discount->start_date) || now()->gt($discount->end_date)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode diskon sudah tidak berlaku.'
            ], 400);
        }

        // Validasi kuota penggunaan
        if ($discount->usage_limit && $discount->used_count >= $discount->usage_limit) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota diskon sudah habis.'
            ], 400);
        }

        // Validasi minimum order amount
        if ($discount->min_order_amount && $request->original_price < $discount->min_order_amount) {
            return response()->json([
                'success' => false,
                'message' => 'Minimum order untuk diskon ini adalah ' . number_format($discount->min_order_amount, 0, ',', '.')
            ], 400);
        }

        // Validasi penggunaan per customer
        $customerUsage = $discount->customerDiscounts()
            ->where('customer_id', auth()->id())
            ->first();

        if ($discount->customer_usage_limit) {
            $usageCount = DiscountUsage::where('discount_id', $discount->id)
                ->where('customer_id', auth()->id())
                ->count();

            if ($usageCount >= $discount->customer_usage_limit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah mencapai batas penggunaan diskon ini.'
                ], 400);
            }
        }

        // Validasi customer-specific discount
        if ($customerUsage) {
            if ($customerUsage->max_usage && $customerUsage->used_count >= $customerUsage->max_usage) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah mencapai batas penggunaan diskon ini.'
                ], 400);
            }

            if ($customerUsage->expires_at && now()->gt($customerUsage->expires_at)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Masa berlaku diskon khusus Anda sudah habis.'
                ], 400);
            }
        }

        // Validasi applies_to
        if (!$this->validateDiscountApplicability($discount, $request->service_id, $request->barber_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode diskon tidak berlaku untuk layanan atau barber yang dipilih.'
            ], 400);
        }

        // Hitung discount amount
        $discountAmount = $this->calculateDiscountAmount($discount, $request->original_price);

        return response()->json([
            'success' => true,
            'discount' => [
                'id' => $discount->id,
                'name' => $discount->name,
                'code' => $discount->code,
                'discount_type' => $discount->discount_type,
                'discount_value' => $discount->discount_value,
                'discount_amount' => $discountAmount,
                'final_price' => $request->original_price - $discountAmount,
            ],
            'message' => 'Diskon berhasil diterapkan.'
        ]);
    }

    private function validateDiscountApplicability(Discount $discount, $serviceId, $barberId)
    {
        if ($discount->applies_to === 'all') {
            return true;
        }

        $service = Service::with('category')->find($serviceId);

        $applicables = $discount->discountApplicables;

        foreach ($applicables as $applicable) {
            switch ($applicable->applicable_type) {
                case 'service':
                    if ($applicable->applicable_id == $serviceId) {
                        return true;
                    }
                    break;

                case 'category':
                    if ($applicable->applicable_id == $service->category_id) {
                        return true;
                    }
                    break;

                case 'barber':
                    if ($applicable->applicable_id == $barberId) {
                        return true;
                    }
                    break;
            }
        }

        return false;
    }

    /**
     * Hitung jumlah diskon
     */
    private function calculateDiscountAmount(Discount $discount, $originalPrice)
    {
        $discountAmount = 0;

        if ($discount->discount_type === 'percentage') {
            $discountAmount = ($originalPrice * $discount->discount_value) / 100;

            // Apply max discount amount if exists
            if ($discount->max_discount_amount && $discountAmount > $discount->max_discount_amount) {
                $discountAmount = $discount->max_discount_amount;
            }
        } else {
            $discountAmount = $discount->discount_value;
        }

        // Ensure discount doesn't exceed original price
        return min($discountAmount, $originalPrice);
    }

    /**
     * Check availability diskon untuk customer
     */
    private function checkDiscountAvailability(Discount $discount)
    {
        // Check period
        if (now()->lt($discount->start_date) || now()->gt($discount->end_date)) {
            return false;
        }

        // Check usage limit
        if ($discount->usage_limit && $discount->used_count >= $discount->usage_limit) {
            return false;
        }

        // Check customer usage limit
        if ($discount->customer_usage_limit) {
            $customerUsageCount = DiscountUsage::where('discount_id', $discount->id)
                ->where('customer_id', auth()->id())
                ->count();

            if ($customerUsageCount >= $discount->customer_usage_limit) {
                return false;
            }
        }

        // Check customer-specific discount
        $customerDiscount = $discount->customerDiscounts()
            ->where('customer_id', auth()->id())
            ->first();

        if ($customerDiscount) {
            if ($customerDiscount->max_usage && $customerDiscount->used_count >= $customerDiscount->max_usage) {
                return false;
            }

            if ($customerDiscount->expires_at && now()->gt($customerDiscount->expires_at)) {
                return false;
            }
        }

        return true;
    }
}

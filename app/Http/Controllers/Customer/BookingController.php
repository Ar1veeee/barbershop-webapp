<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\BarberProfile;
use App\Models\Booking;
use App\Models\CustomerDiscount;
use App\Models\Discount;
use App\Models\DiscountApplicable;
use App\Models\DiscountUsage;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BookingController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $user = auth()->user();

        $baseQuery = Booking::where('customer_id', $user->id);

        $counts = [
            'all' => (clone $baseQuery)->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'confirmed' => (clone $baseQuery)->where('status', 'confirmed')->count(),
            'in_progress' => (clone $baseQuery)->where('status', 'in_progress')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'cancelled' => (clone $baseQuery)->where('status', 'cancelled')->count(),
        ];

        $query = Booking::with(['barber.barberProfile', 'service'])
            ->where('customer_id', $user->id);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customer/Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->only('status'),
            'counts' => $counts,
        ]);
    }

    public function create(Request $request)
    {
        $barbers = User::with(['barberProfile.services' => function ($query) {
            $query->withPivot('custom_price', 'is_available');
        }])
            ->barbers()
            ->active()
            ->whereHas('barberProfile', function ($q) {
                $q->where('is_available', true);
            })
            ->get();

        $services = Service::with('category')->active()->get();

        return Inertia::render('Customer/Bookings/Create', [
            'barbers' => $barbers,
            'services' => $services,
            'selected_barber_id' => $request->query('barber_id') ? (int)$request->query('barber_id') : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'barber_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:500',
            'discount_code' => 'nullable|exists:discounts,code',
        ]);

        // Get service details
        $service = Service::findOrFail($validated['service_id']);

        // Check if barber offers this service
        $barberService = DB::table('barber_services')
            ->where('barber_id', $validated['barber_id'])
            ->where('service_id', $validated['service_id'])
            ->where('is_available', true)
            ->first();

        if (!$barberService) {
            return back()->withErrors(['service_id' => 'Barber does not offer this service']);
        }

        // Calculate end time
        $startTime = Carbon::parse($validated['start_time']);
        $endTime = $startTime->copy()->addMinutes($service->duration);

        // Check for conflicts
        $conflict = Booking::where('barber_id', $validated['barber_id'])
            ->where('booking_date', $validated['booking_date'])
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) use ($validated, $endTime) {
                $q->whereBetween('start_time', [$validated['start_time'], $endTime->format('H:i')])
                    ->orWhereBetween('end_time', [$validated['start_time'], $endTime->format('H:i')]);
            })
            ->exists();

        if ($conflict) {
            return back()->withErrors(['start_time' => 'This time slot is not available']);
        }


        $original_price = $barberService->custom_price ?? $service->base_price;
        $discount_amount = 0;
        $total_price = $original_price;
        $discount_id = null;

        if (!empty($validated['discount_code'])) {
            $discount_validation = $this->validateAndCalculateDiscount(
                $validated['discount_code'],
                $validated['service_id'],
                $validated['barber_id'],
                $original_price,
            );

            if ($discount_validation['success']) {
                $discount_amount = $discount_validation['discount_amount'];
                $total_price = $discount_validation['total_price'];
                $discount_id = $discount_validation['discount_id'];
            } else {
                return back()->withErrors(['discount_code' => $discount_validation['message']]);
            }
        }

        $booking = Booking::create([
            'customer_id' => auth()->id(),
            'barber_id' => $validated['barber_id'],
            'service_id' => $validated['service_id'],
            'booking_date' => $validated['booking_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $endTime->format('H:i:s'),
            'original_price' => $original_price,
            'discount_id' => $discount_id,
            'discount_amount' => $discount_amount,
            'total_price' => $total_price,
            'status' => 'pending',
            'payment_status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        if ($discount_id) {
            $this->createDiscountUsage($discount_id, $booking->id, $original_price, $discount_amount, $total_price);
        }

        return redirect()->route('customer.bookings.show', $booking)
            ->with('success', 'Bookings created successfully! Waiting for barber confirmation.');
    }

    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);

        $booking->load(['barber.barberProfile', 'service.category', 'review', 'discount']);

        return inertia('Customer/Bookings/Show', [
            'booking' => $booking
        ]);
    }

    public function cancel(Booking $booking)
    {
        $this->authorize('cancel', $booking);

        if (!$booking->canBeCancelled()) {
            return back()->withErrors(['error' => 'This booking cannot be cancelled']);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_by' => auth()->id(),
            'cancellation_reason' => request('reason'),
        ]);

        return redirect()->route('customer.bookings.index')
            ->with('success', 'Bookings cancelled successfully');
    }

    private function validateAndCalculateDiscount($discount_code, $service_id, $barber_id, $original_price)
    {
        try {
            $discount = Discount::where('code', $discount_code)->first();

            if (!$discount) {
                return [
                    'success' => false,
                    'message' => 'Discount code not found'
                ];
            }

            // Check Active Status
            if (!$discount->is_active) {
                return [
                    'success' => false,
                    'message' => 'Discount is not active'
                ];
            }

            // Check Expired
            $now = Carbon::now();
            if ($now->lt($discount->start_date) || $now->gt($discount->end_date)) {
                return [
                    'success' => false,
                    'message' => 'Discount is not valid at this time'
                ];
            }

            // Check Limit
            if ($discount->usage_limit && $discount->used_count >= $discount->usage_limit) {
                return [
                    'success' => false,
                    'message' => 'Discount limit exceeded'
                ];
            }

            if ($discount->min_order_amount && $original_price < $discount->min_order_amount) {
                return [
                    'success' => false,
                    'message' => 'Discount minimum order amount is ' . $discount->min_order_amount
                ];
            }

            $service = Service::find($service_id);
            $barber = User::find($barber_id);

            if (!$service || !$barber) {
                return [
                    'success' => false,
                    'message' => 'Invalid service or barber'
                ];
            }

            if ($discount->applies_to === 'specific') {
                $is_applicable = DiscountApplicable::where('discount_id', $discount->id)
                    ->where(function ($query) use ($service, $barber) {
                        $query->where(function ($q) use ($service) {
                            $q->where('applicable_type', 'service')
                                ->where('applicable_id', $service->id);
                        })->orWhere(function ($q) use ($service) {
                            $q->where('applicable_type', 'category')
                                ->where('applicable_id', $service->category_id);
                        })->orWhere(function ($q) use ($barber) {
                            $q->where('applicable_type', 'barber')
                                ->where('applicable_id', $barber->id);
                        });
                    })
                    ->exists();

                if (!$is_applicable) {
                    return [
                        'success' => false,
                        'message' => 'Discount is not applicable to selected service or barber'
                    ];
                }

            }

            if ($discount->customer_usage_limit) {
                $customer_usage_count = DiscountUsage::where('discount_id', $discount->id)
                    ->where('customer_id', auth()->id())
                    ->count();

                if ($customer_usage_count >= $discount->customer_usage_limit) {
                    return [
                        'success' => false,
                        'message' => 'You have reached the usage limit for this discount'
                    ];
                }
            }

            $discount_amount = 0;
            if ($discount->discount_type === 'percentage') {
                $discount_amount = $original_price * ($discount->discount_value / 100);

                if ($discount->max_discount_amount && $discount_amount > $discount->max_discount_amount) {
                    $discount_amount = $discount->max_discount_amount;
                }
            } else {
                $discount_amount = $discount->discount_value;

                if ($discount->max_discount_amount && $discount_amount > $discount->max_discount_amount) {
                    $discount_amount = $discount->max_discount_amount;
                }
            }

            $total_price = $original_price - $discount_amount;

            return [
                'success' => true,
                'discount_id' => $discount->id,
                'discount_amount' => $discount_amount,
                'total_price' => $total_price,
                'discount_type' => $discount->discount_type,
                'discount_value' => $discount->discount_value
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    private function createDiscountUsage($discount_id, $booking_id, $original_amount, $discount_amount, $final_amount)
    {
        DB::transaction(function () use ($discount_id, $booking_id, $original_amount, $discount_amount, $final_amount) {
            DiscountUsage::create([
                'discount_id' => $discount_id,
                'customer_id' => auth()->id(),
                'booking_id' => $booking_id,
                'original_amount' => $original_amount,
                'discount_amount' => $discount_amount,
                'final_amount' => $final_amount,
                'used_at' => Carbon::now(),
            ]);

            Discount::where('id', $discount_id)->increment('used_count');

            $customer_discount  = CustomerDiscount::where('customer_id', auth()->id())
                ->where('discount_id', $discount_id)
                ->first();

            if ($customer_discount) {
                $customer_discount->increment('used_count');
            } else {
                CustomerDiscount::create([
                    'customer_id' => auth()->id(),
                    'discount_id' => $discount_id,
                    'used_count' => 1,
                ]);
            }
        });
    }
}

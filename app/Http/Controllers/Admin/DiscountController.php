<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\User;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $query = Discount::with([
            'creator',
            'discountApplicables' => function ($query) {
                $query->with(['applicable' => function ($morphTo) {
                    $morphTo->morphWith([
                        Service::class => [],
                        ServiceCategory::class => [],
                        User::class => [],
                    ]);
                }]);
            }
        ]);

        // Filter berdasarkan status aktif
        if ($request->status && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
            } elseif ($request->status === 'upcoming') {
                $query->where('is_active', true)
                    ->where('start_date', '>', now());
            } elseif ($request->status === 'expired') {
                $query->where('end_date', '<', now());
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        // Filter berdasarkan type diskon
        if ($request->discount_type && $request->discount_type !== 'all') {
            $query->where('discount_type', $request->discount_type);
        }

        // Filter berdasarkan applies_to
        if ($request->applies_to && $request->applies_to !== 'all') {
            $query->where('applies_to', $request->applies_to);
        }

        // Filter berdasarkan search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        $discounts = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($discount) {
                $status = 'expired';
                $now = now();

                if ($discount->end_date < $now) {
                    $status = 'expired';
                } elseif ($discount->start_date > $now) {
                    $status = 'upcoming';
                } elseif ($discount->is_active) {
                    $status = 'active';
                } else {
                    $status = 'inactive';
                }

                $applicables = $discount->discountApplicables->map(function ($applicable) {
                    $name = null;

                    try {
                        if ($applicable->applicable) {
                            $name = $applicable->applicable->name ?? null;
                        }
                    } catch (\Exception $e) {
                        $name = null;
                    }

                    // Fallback manual lookup
                    if (!$name) {
                        switch ($applicable->applicable_type) {
                            case 'service':
                                $service = Service::find($applicable->applicable_id);
                                $name = $service->name ?? 'Service #' . $applicable->applicable_id;
                                break;
                            case 'category':
                                $category = ServiceCategory::find($applicable->applicable_id);
                                $name = $category->name ?? 'Category #' . $applicable->applicable_id;
                                break;
                            case 'barber':
                                $barber = User::find($applicable->applicable_id);
                                $name = $barber->name ?? 'Barber #' . $applicable->applicable_id;
                                break;
                            default:
                                $name = 'Unknown';
                        }
                    }

                    return [
                        'type' => $applicable->applicable_type,
                        'id' => $applicable->applicable_id,
                        'name' => $name,
                    ];
                });

                return [
                    'id' => $discount->id,
                    'name' => $discount->name,
                    'code' => $discount->code,
                    'description' => $discount->description,
                    'discount_type' => $discount->discount_type,
                    'discount_value' => (float)$discount->discount_value,
                    'max_discount_amount' => $discount->max_discount_amount ? (float)$discount->max_discount_amount : null,
                    'min_order_amount' => $discount->min_order_amount ? (float)$discount->min_order_amount : null,
                    'start_date' => $discount->start_date->toISOString(),
                    'end_date' => $discount->end_date->toISOString(),
                    'usage_limit' => $discount->usage_limit,
                    'used_count' => $discount->used_count,
                    'customer_usage_limit' => $discount->customer_usage_limit,
                    'is_active' => $discount->is_active,
                    'applies_to' => $discount->applies_to,
                    'status' => $status,
                    'remaining_quota' => $discount->usage_limit ? $discount->usage_limit - $discount->used_count : null,
                    'usage_percentage' => $discount->usage_limit ? round(($discount->used_count / $discount->usage_limit) * 100, 2) : null,
                    'created_by_name' => $discount->creator->name ?? 'System',
                    'created_at' => $discount->created_at->toISOString(),
                    'applicables' => $applicables
                ];
            });

        return Inertia::render('Admin/Discounts/Index', [
            'discounts' => $discounts,
            'filters' => $request->only(['search', 'status', 'discount_type', 'applies_to']),
        ]);
    }

    public function create()
    {
        $services = Service::where('is_active', true)->get(['id', 'name', 'base_price']);
        $categories = ServiceCategory::all(['id', 'name']);
        $barbers = User::where('role', 'barber')->where('status', 'active')->get(['id', 'name']);

        return Inertia::render('Admin/Discounts/Create', [
            'services' => $services,
            'categories' => $categories,
            'barbers' => $barbers,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:discounts,code',
            'description' => 'nullable|string|max:500',
            'discount_type' => 'required|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0.01',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after:start_date',
            'usage_limit' => 'nullable|integer|min:1',
            'customer_usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'applies_to' => 'required|in:all,specific',
            'applicables' => 'required_if:applies_to,specific|array',
            'applicables.*.type' => 'required_if:applies_to,specific|in:service,category,barber',
            'applicables.*.id' => 'required_if:applies_to,specific|integer',
        ]);

        // Generate code jika tidak diisi
        $code = $request->code;
        if (empty($code)) {
            $code = Str::upper(Str::random(8));
            // Pastikan code unik
            while (Discount::where('code', $code)->exists()) {
                $code = Str::upper(Str::random(8));
            }
        }

        // Create discount
        $discount = Discount::create([
            'name' => $request->name,
            'code' => $code,
            'description' => $request->description,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'max_discount_amount' => $request->max_discount_amount,
            'min_order_amount' => $request->min_order_amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'usage_limit' => $request->usage_limit,
            'customer_usage_limit' => $request->customer_usage_limit,
            'is_active' => $request->is_active ?? true,
            'applies_to' => $request->applies_to,
            'created_by' => auth()->id(),
        ]);

        // Create discount applicables jika applies_to adalah specific
        if ($request->applies_to === 'specific' && !empty($request->applicables)) {
            foreach ($request->applicables as $applicable) {
                $discount->discountApplicables()->create([
                    'applicable_type' => $applicable['type'],
                    'applicable_id' => $applicable['id'],
                ]);
            }
        }

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Diskon berhasil dibuat.');
    }

    public function show(Discount $discount)
    {
        $discount->load([
            'creator',
            'discountApplicables.applicable',
            'customerDiscounts.customer',
            'discountUsages.booking.service',
            'discountUsages.booking.customer',
            'discountUsages.booking.barber'
        ]);

        $usageStats = [
            'total_used' => $discount->used_count,
            'remaining_quota' => $discount->usage_limit ? $discount->usage_limit - $discount->used_count : null,
            'usage_percentage' => $discount->usage_limit ? round(($discount->used_count / $discount->usage_limit) * 100, 2) : 0,
            'total_revenue' => $discount->discountUsages->sum('final_amount'),
            'total_discount_given' => $discount->discountUsages->sum('discount_amount'),
        ];

        return Inertia::render('Admin/Discounts/Show', [
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
                'is_active' => $discount->is_active,
                'applies_to' => $discount->applies_to,
                'created_by_name' => $discount->creator->name ?? 'System',
                'created_at' => $discount->created_at,
                'applicables' => $discount->discountApplicables->map(function ($applicable) {
                    return [
                        'type' => $applicable->applicable_type,
                        'id' => $applicable->applicable_id,
                        'name' => $applicable->applicable->name ?? null,
                    ];
                }),
                'customer_discounts' => $discount->customerDiscounts->map(function ($cd) {
                    return [
                        'customer_name' => $cd->customer->name ?? 'Deleted Customer',
                        'used_count' => $cd->used_count,
                        'max_usage' => $cd->max_usage,
                        'expires_at' => $cd->expires_at,
                    ];
                })
            ],
            'usage_stats' => $usageStats,
        ]);
    }

    /**
     * Menampilkan form edit diskon
     */
    public function edit(Discount $discount)
    {
        $discount->load([
            'discountApplicables' => function ($query) {
                $query->with(['applicable' => function ($morphTo) {
                    $morphTo->morphWith([
                        Service::class => [],
                        ServiceCategory::class => [],
                        User::class => [],
                    ]);
                }]);
            }
        ]);

        $services = Service::where('is_active', true)->get(['id', 'name', 'base_price']);
        $categories = ServiceCategory::all(['id', 'name']);
        $barbers = User::where('role', 'barber')->where('status', 'active')->get(['id', 'name']);

        return Inertia::render('Admin/Discounts/Edit', [
            'discount' => [
                'id' => $discount->id,
                'name' => $discount->name,
                'code' => $discount->code,
                'description' => $discount->description,
                'discount_type' => $discount->discount_type,
                'discount_value' => $discount->discount_value,
                'max_discount_amount' => $discount->max_discount_amount,
                'min_order_amount' => $discount->min_order_amount,
                'start_date' => $discount->start_date->format('Y-m-d'),
                'end_date' => $discount->end_date->format('Y-m-d'),
                'usage_limit' => $discount->usage_limit,
                'customer_usage_limit' => $discount->customer_usage_limit,
                'is_active' => $discount->is_active,
                'applies_to' => $discount->applies_to,
                'applicables' => $discount->discountApplicables->map(function ($applicable) {
                    return [
                        'type' => $applicable->applicable_type,
                        'id' => $applicable->applicable_id,
                    ];
                })
            ],
            'services' => $services,
            'categories' => $categories,
            'barbers' => $barbers,
        ]);
    }

    /**
     * Update diskon
     */
    public function update(Request $request, Discount $discount)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:discounts,code,' . $discount->id,
            'description' => 'nullable|string|max:500',
            'discount_type' => 'required|in:percentage,fixed_amount',
            'discount_value' => 'required|numeric|min:0.01',
            'max_discount_amount' => 'nullable|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'usage_limit' => 'nullable|integer|min:1',
            'customer_usage_limit' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
            'applies_to' => 'required|in:all,specific',
            'applicables' => 'required_if:applies_to,specific|array',
            'applicables.*.type' => 'required_if:applies_to,specific|in:service,category,barber',
            'applicables.*.id' => 'required_if:applies_to,specific|integer',
        ]);

        // Update discount
        $discount->update([
            'name' => $request->name,
            'code' => $request->code,
            'description' => $request->description,
            'discount_type' => $request->discount_type,
            'discount_value' => $request->discount_value,
            'max_discount_amount' => $request->max_discount_amount,
            'min_order_amount' => $request->min_order_amount,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'usage_limit' => $request->usage_limit,
            'customer_usage_limit' => $request->customer_usage_limit,
            'is_active' => $request->is_active ?? $discount->is_active,
            'applies_to' => $request->applies_to,
        ]);

        // Update discount applicables
        $discount->discountApplicables()->delete();

        if ($request->applies_to === 'specific' && !empty($request->applicables)) {
            foreach ($request->applicables as $applicable) {
                $discount->discountApplicables()->create([
                    'applicable_type' => $applicable['type'],
                    'applicable_id' => $applicable['id'],
                ]);
            }
        }

        return redirect()->route('admin.discounts.show', $discount)
            ->with('success', 'Diskon berhasil diperbarui.');
    }

    /**
     * Menghapus diskon
     */
    public function destroy(Discount $discount)
    {
        // Cek apakah diskon sudah digunakan
        if ($discount->used_count > 0) {
            return back()->with('error', 'Tidak dapat menghapus diskon yang sudah digunakan.');
        }

        $discount->discountApplicables()->delete();
        $discount->customerDiscounts()->delete();
        $discount->delete();

        return redirect()->route('admin.discounts.index')
            ->with('success', 'Diskon berhasil dihapus.');
    }

    /**
     * Mengaktifkan/menonaktifkan diskon
     */
    public function toggleStatus(Discount $discount)
    {
        $discount->update([
            'is_active' => !$discount->is_active
        ]);

        $status = $discount->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Diskon berhasil $status.");
    }

    /**
     * Menampilkan riwayat penggunaan diskon
     */
    public function usageHistory(Request $request, Discount $discount = null)
    {
        $query = DiscountUsage::with([
            'discount',
            'customer',
            'booking.service',
            'booking.barber'
        ]);

        // Filter berdasarkan diskon tertentu
        if ($discount) {
            $query->where('discount_id', $discount->id);
        }

        // Filter berdasarkan tanggal
        if ($request->date_from) {
            $query->whereDate('used_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('used_at', '<=', $request->date_to);
        }

        // Filter berdasarkan customer
        if ($request->customer_id) {
            $query->where('customer_id', $request->customer_id);
        }

        $usages = $query->orderBy('used_at', 'desc')
            ->paginate(15)
            ->through(function ($usage) {
                return [
                    'id' => $usage->id,
                    'discount_name' => $usage->discount->name,
                    'discount_code' => $usage->discount->code,
                    'customer_name' => $usage->customer->name,
                    'service_name' => $usage->booking->service->name,
                    'barber_name' => $usage->booking->barber->name,
                    'original_amount' => $usage->original_amount,
                    'discount_amount' => $usage->discount_amount,
                    'final_amount' => $usage->final_amount,
                    'used_at' => $usage->used_at,
                    'booking_date' => $usage->booking->booking_date,
                ];
            });

        $customers = User::where('role', 'customer')->get(['id', 'name']);
        $discounts = Discount::all(['id', 'name', 'code']);

        return Inertia::render('Admin/Discounts/UsageHistory', [
            'usages' => $usages,
            'discount' => $discount ? [
                'id' => $discount->id,
                'name' => $discount->name,
                'code' => $discount->code,
            ] : null,
            'customers' => $customers,
            'discounts' => $discounts,
            'filters' => $request->only(['date_from', 'date_to', 'customer_id']),
        ]);
    }

    /**
     * Menambahkan diskon khusus untuk customer
     */
    public function assignToCustomer(Request $request, Discount $discount)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,id',
            'max_usage' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $customerDiscount = $discount->customerDiscounts()->updateOrCreate(
            [
                'customer_id' => $request->customer_id,
            ],
            [
                'max_usage' => $request->max_usage,
                'expires_at' => $request->expires_at,
            ]
        );

        return back()->with('success', 'Diskon berhasil ditambahkan untuk customer.');
    }

    /**
     * Menghapus diskon khusus customer
     */
    public function removeFromCustomer(Discount $discount, $customerId)
    {
        $discount->customerDiscounts()
            ->where('customer_id', $customerId)
            ->delete();

        return back()->with('success', 'Diskon berhasil dihapus dari customer.');
    }
}

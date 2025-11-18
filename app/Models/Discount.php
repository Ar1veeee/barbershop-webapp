<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'discount_type',
        'discount_value',
        'max_discount_amount',
        'min_order_amount',
        'start_date',
        'end_date',
        'usage_limit',
        'used_count',
        'customer_usage_limit',
        'is_active',
        'applies_to',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'discount_value' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'discount_id');
    }

    public function discountApplicables(): HasMany
    {
        return $this->hasMany(DiscountApplicable::class);
    }

    public function customerDiscounts(): HasMany
    {
        return $this->hasMany(CustomerDiscount::class);
    }

    public function discountUsages(): HasMany
    {
        return $this->hasMany(DiscountUsage::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'discount_applicables', 'discount_id', 'applicable_id')
            ->where('discount_applicables.applicable_type', 'service')
            ->withTimestamps();
    }

    public function serviceCategory(): BelongsToMany
    {
        return $this->belongsToMany(ServiceCategory::class, 'discount_applicables', 'discount_id', 'applicable_id')
            ->where('discount_applicables.applicable_type', 'category')
            ->withTimestamps();
    }

    public function barbers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discount_applicables', 'discount_id', 'applicable_id')
            ->where('discount_applicables.applicable_type', 'barber')
            ->where('users.role', 'barber')
            ->withTimestamps();
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    public function scopeValid($query)
    {
        return $query->active()
            ->where(function ($q) {
                $q->whereNull('usage_limit')
                    ->orWhereRaw('used_count < usage_limit');
            });
    }

    // Methods
    public function isActive(): bool
    {
        return $this->is_active &&
            $this->start_date <= now() &&
            $this->end_date >= now();
    }

    public function isExhausted(): bool
    {
        return $this->usage_limit && $this->used_count >= $this->usage_limit;
    }

    public function isValid(): bool
    {
        return $this->isActive() && !$this->isExhausted();
    }

    public function calculateDiscountAmount(float $originalAmount): float
    {
        if ($this->discount_type === 'percentage') {
            $discount = $originalAmount * ($this->discount_value / 100);

            if ($this->max_discount_amount && $discount > $this->max_discount_amount) {
                return $this->max_discount_amount;
            }

            return $discount;
        }

        // fixed_amount
        return min($this->discount_value, $originalAmount);
    }

    public function canApplyToOrder(float $orderAmount): bool
    {
        if (!$this->min_order_amount) {
            return true;
        }

        return $orderAmount >= $this->min_order_amount;
    }

    public function canApplyToCustomer(User $customer): bool
    {
        $customerDiscount = $this->customerDiscounts()
            ->where('customer_id', $customer->id)
            ->first();

        if (!$customerDiscount) {
            return $this->applies_to === 'all';
        }

        if ($customerDiscount->expires_at && $customerDiscount->expires_at < now()) {
            return false;
        }

        if ($customerDiscount->max_usage && $customerDiscount->used_count >= $customerDiscount->max_usage) {
            return false;
        }

        return true;
    }

    public function canApplyToService(Service $service, User $barber): bool
    {
        if ($this->applies_to === 'all') {
            return true;
        }

        // Check if discount applies to specific service, category, or barber
        return $this->applicables()
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
    }

    public function incrementUsage()
    {
        $this->increment('used_count');
    }
}

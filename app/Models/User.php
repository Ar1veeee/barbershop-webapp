<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'google_id',
        'role',
        'status',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'phone' => 'encrypted',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'avatar_url'
    ];

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar && filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }

        if ($this->avatar && !filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            $folder = $this->role === 'customer' ? 'customer' : 'barber';
            $localPath = $folder . '/' . $this->avatar;

            if (Storage::disk('public')->exists($localPath)) {
                $url = asset('storage/' . $localPath);
                return $url;
            }

            $publicPath = "storage/{$folder}/{$this->avatar}";
            if (file_exists(public_path($publicPath))) {
                $url = asset($publicPath);
                return $url;
            }
        }

        if ($this->google_id) {
            return $this->googleAvatarUrl() ?? $this->getDefaultAvatar();
        }

        return $this->getDefaultAvatar();
    }

    protected function getDefaultAvatar(): string
    {
        $name = urlencode($this->name ?? 'User');
        return "https://ui-avatars.com/api/?name={$name}&size=128&background=1f2937&color=fff&bold=true";
    }

    protected function googleAvatarUrl(): string
    {
        if ($this->avatar && filter_var($this->avatar, FILTER_VALIDATE_URL)) {
            return $this->avatar;
        }

        return $this->getDefaultAvatar();
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function barberProfile()
    {
        return $this->hasOne(BarberProfile::class, 'user_id');
    }

    public function barberServices()
    {
        return $this->belongsToMany(Service::class, 'barber_services', 'barber_id', 'service_id')
            ->withPivot('custom_price', 'is_available')
            ->withTimestamps();
    }

    public function customerBookings()
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    public function barberBookings()
    {
        return $this->hasMany(Booking::class, 'barber_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'customer_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'barber_id');
    }

    public function createdDiscounts()
    {
        return $this->hasMany(Discount::class, 'created_by');
    }

    public function customerDiscounts()
    {
        return $this->hasMany(CustomerDiscount::class, 'customer_id');
    }

    public function availableDiscounts()
    {
        return $this->belongsToMany(Discount::class, 'customer_discounts', 'customer_id', 'discount_id')
            ->withPivot('used_count', 'max_usage', 'expires_at')
            ->withTimestamps();
    }

    public function discountUsages()
    {
        return $this->hasMany(DiscountUsage::class, 'customer_id');
    }

    // Scopes
    public function scopeBarbers($query)
    {
        return $query->where('role', 'barber');
    }

    public function scopeCustomers($query)
    {
        return $query->where('role', 'customer');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAvailableBarbersWithServices($query)
    {
        return $query->barbers()
            ->active()
            ->with([
                'barberProfile.services' => function ($q) {
                    $q->withPivot('custom_price', 'is_available');
                }
            ])
            ->whereHas('barberProfile', function ($q) {
                $q->where('is_available', true);
            });
    }

    // Helper methods
    public function isBarber(): bool
    {
        return $this->role === 'barber';
    }

    public function isCustomer(): bool
    {
        return $this->role === 'customer';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function canCreateDiscounts(): bool
    {
        return $this->isAdmin();
    }

    public function canManageDiscounts(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Get available discounts for customer
     */
    public function getAvailableDiscounts()
    {
        if (!$this->isCustomer()) {
            return collect();
        }

        // Global active discounts
        $globalDiscounts = Discount::valid()
            ->where('applies_to', 'all')
            ->get();

        // Customer-specific discounts
        $specificDiscounts = $this->availableDiscounts()
            ->where(function ($query) {
                $query->whereNull('customer_discounts.expires_at')
                    ->orWhere('customer_discounts.expires_at', '>', now());
            })
            ->where(function ($query) {
                $query->whereNull('customer_discounts.max_usage')
                    ->orWhereRaw('customer_discounts.used_count < customer_discounts.max_usage');
            })
            ->get();

        return $globalDiscounts->merge($specificDiscounts)->unique('id');
    }

    /**
     * Check if customer can use a specific discount
     */
    public function canUseDiscount(Discount $discount): bool
    {
        if (!$this->isCustomer()) {
            return false;
        }

        // Check global discount eligibility
        if ($discount->applies_to === 'all') {
            return $discount->canApplyToCustomer($this);
        }

        // Check customer-specific discount
        $customerDiscount = $this->customerDiscounts()
            ->where('discount_id', $discount->id)
            ->first();

        if ($customerDiscount) {
            return $customerDiscount->canUse();
        }

        return false;
    }

    /**
     * Get discount usage count for this customer
     */
    public function getDiscountUsageCount(Discount $discount): int
    {
        if (!$this->isCustomer()) {
            return 0;
        }

        $customerDiscount = $this->customerDiscounts()
            ->where('discount_id', $discount->id)
            ->first();

        return $customerDiscount ? $customerDiscount->used_count : 0;
    }

    /**
     * Get total savings from discounts
     */
    public function getTotalDiscountSavings(): float
    {
        if (!$this->isCustomer()) {
            return 0;
        }

        return $this->discountUsages()->sum('discount_amount');
    }

    /**
     * Get recent discount usages
     */
    public function getRecentDiscountUsages($limit = 5)
    {
        if (!$this->isCustomer()) {
            return collect();
        }

        return $this->discountUsages()
            ->with(['discount', 'booking.service'])
            ->latest('used_at')
            ->limit($limit)
            ->get();
    }
}

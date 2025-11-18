<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'barber_id',
        'service_id',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'original_price',
        'discount_id',
        'discount_amount',
        'total_price',
        'payment_status',
        'payment_method',
        'notes',
        'cancelled_by',
        'cancellation_reason',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'total_price' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function barber()
    {
        return $this->belongsTo(User::class, 'barber_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function discount()
    {
        return $this->belongsTo(Discount::class);
    }

    public function discountUsage()
    {
        return $this->hasOne(DiscountUsage::class);
    }

    // Update existing methods if needed
    public function calculateTotalPrice()
    {
        $this->total_price = $this->original_price - $this->discount_amount;
        return $this->total_price;
    }

    public function cancelledBy()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', now()->toDateString())
            ->whereIn('status', ['pending', 'confirmed']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeToday($query)
    {
        return $query->where('booking_date', now()->toDateString());
    }

    public function canBeCancelled(): bool
    {
        if (!in_array($this->status, ['pending', 'confirmed'])) {
            return false;
        }

        try {
            $date = Carbon::parse($this->booking_date)->format('Y-m-d');

            $dateTimeString = $date . ' ' . $this->start_time;

            $startTime = Carbon::parse($dateTimeString);

            $minutesUntilBooking = now()->diffInMinutes($startTime, false);

            return $minutesUntilBooking >= 30;

        } catch (\Exception $e) {
            return false;
        }
    }

    public function canBeReviewed(): bool
    {
        return $this->status === 'completed' && !$this->review;
    }
}

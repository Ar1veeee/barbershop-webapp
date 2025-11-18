<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarberService extends Model
{
    use HasFactory;

    protected $table = 'barber_services';
    protected $fillable = [
        'barber_id',
        'service_id',
        'custom_price',
        'is_available',
    ];

    protected $casts = [
        'custom_price' => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function barber()
    {
        return $this->belongsTo(User::class, 'barber_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function getFinalPrice(): float
    {
        return $this->custom_price ?? $this->service->base_price;
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
            ->whereHas('service', function ($q) {
                $q->where('is_active', true);
            });
    }
}

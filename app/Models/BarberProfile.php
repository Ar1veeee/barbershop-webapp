<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarberProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'specialization',
        'experience_years',
        'rating_average',
        'total_reviews',
        'bank_account',
        'commission_rate',
        'is_available',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'rating_average' => 'decimal:2',
        'commission_rate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function services()
    {
        return $this->belongsToMany(
            Service::class,
            'barber_services',
            'barber_id',
            'service_id',
            'user_id',
            'id'
        );
    }

    public function schedules()
    {
        return $this->hasMany(BarberSchedule::class, 'barber_id', 'user_id');
    }

    public function timeOff()
    {
        return $this->hasMany(BarberTimeOff::class, 'barber_id', 'user_id');
    }
}

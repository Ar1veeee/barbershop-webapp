<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BarberTimeOff extends Model
{
    use HasFactory;

    protected $table = 'barber_time_off';

    protected $fillable = [
        'barber_id',
        'start_date',
        'end_date',
        'reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function barber()
    {
        return $this->belongsTo(User::class, 'barber_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DiscountApplicable extends Model
{
    use HasFactory;

    protected $fillable = [
        'discount_id',
        'applicable_type',
        'applicable_id',
    ];

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }

    public function applicable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('applicable_type', $type);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $connection = 'pgsql_public';
    protected $table = 'bookings';

    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $casts = [
        'created_at' => 'datetime',
        'check_in' => 'date',
        'check_out' => 'date',
        'unit_price_lkr' => 'decimal:2',
        'total_amount_lkr' => 'decimal:2',
        'commission_rate' => 'decimal:6',
        'commission_amount_lkr' => 'decimal:2',
        'cancelled_at' => 'datetime',
        'commission_earned_at' => 'datetime',
    ];

    protected $guarded = [];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'guest_id');
    }
}

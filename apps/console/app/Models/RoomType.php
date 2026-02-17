<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomType extends Model
{
    protected $connection = 'pgsql_public';
    protected $table = 'room_types';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'max_guests' => 'int',
        'bathroom_count' => 'int',
        'room_count' => 'int',
        'smoking_allowed' => 'bool',
        'amenities' => 'array',
        'price_per_night' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $guarded = [];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    protected $connection = 'pgsql_public';
    protected $table = 'properties';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'amenities' => 'array',
        'breakfast_types' => 'array',
        'languages' => 'array',
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'location_lat' => 'float',
        'location_lng' => 'float',
        'location_pin_confirmed' => 'bool',
        'wizard_step' => 'int',
        'villa_guest_count' => 'int',
        'villa_bathrooms' => 'int',
        'villa_price_per_night' => 'decimal:2',
        'villa_size' => 'decimal:2',
    ];

    protected $guarded = [];

    public function photos(): HasMany
    {
        return $this->hasMany(PropertyPhoto::class, 'property_id');
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(Profile::class, 'host_id');
    }
}

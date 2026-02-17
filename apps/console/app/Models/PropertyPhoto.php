<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyPhoto extends Model
{
    protected $connection = 'pgsql_public';
    protected $table = 'property_photos';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'sort_order' => 'int',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $guarded = [];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}

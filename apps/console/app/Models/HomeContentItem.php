<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeContentItem extends Model
{
    protected $connection = 'pgsql_public';
    protected $table = 'home_content_items';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'payload' => 'array',
        'is_active' => 'bool',
        'priority' => 'int',
        'schema_version' => 'int',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $guarded = [];
}

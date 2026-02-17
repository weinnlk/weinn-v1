<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Profile extends Model
{
    protected $connection = 'pgsql_public';
    protected $table = 'profiles';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_active' => 'bool',
        'is_guest' => 'bool',
        'is_host' => 'bool',
        'is_admin' => 'bool',
        'onboarded_at' => 'datetime',
    ];

    protected $guarded = [];

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class, 'host_id');
    }
}

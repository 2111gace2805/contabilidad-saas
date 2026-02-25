<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'code', 'name', 'nit', 'address',
        'phone', 'email', 'credit_days', 'active',
    ];

    protected $appends = ['rfc'];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function payments()
    {
        return $this->hasMany(SupplierPayment::class);
    }

    public function getRfcAttribute()
    {
        return $this->attributes['nit'] ?? null;
    }

    public function setRfcAttribute($value)
    {
        $this->attributes['nit'] = $value;
    }
}

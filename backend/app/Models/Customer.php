<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'code', 'name', 'rfc', 'address',
        'phone', 'email', 'credit_limit', 'credit_days', 'active',
        'customer_type_id', 'economic_activity_id', 'depa_id', 'municipality_id', 'district_id',
        'contact_name', 'email1', 'email2', 'email3', 'nit', 'nrc', 'dui',
        'is_gran_contribuyente', 'is_exento_iva', 'is_no_sujeto_iva', 'profile_type', 'business_name',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function customerType()
    {
        return $this->belongsTo(CustomerType::class, 'customer_type_id');
    }

    public function economicActivity()
    {
        return $this->belongsTo(EconomicActivity::class, 'economic_activity_id', 'id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(CustomerPayment::class);
    }
}

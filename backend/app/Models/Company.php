<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'rfc', 'nrc', 'nit', 'taxpayer_type', 'is_withholding_agent',
        'address', 'address_line2', 'municipality', 'department', 'city',
        'postal_code', 'country', 'employer_registration', 'phone',
        'business_activity', 'fiscal_year_start', 'currency', 'max_users', 'active',
    ];

    protected function casts(): array
    {
        return [
            'is_withholding_agent' => 'boolean',
            'active' => 'boolean',
            'max_users' => 'integer',
        ];
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'company_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function accountTypes()
    {
        return $this->hasMany(AccountType::class);
    }

    public function accountingSegments()
    {
        return $this->hasMany(AccountingSegment::class);
    }

    public function accountingPeriods()
    {
        return $this->hasMany(AccountingPeriod::class);
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }

    public function suppliers()
    {
        return $this->hasMany(Supplier::class);
    }

    public function inventoryItems()
    {
        return $this->hasMany(InventoryItem::class);
    }

    public function bankAccounts()
    {
        return $this->hasMany(BankAccount::class);
    }
}

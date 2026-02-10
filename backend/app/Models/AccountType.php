<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountType extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'company_id', 'code', 'name', 'nature',
        'affects_balance', 'affects_results', 'sort_order',
    ];

    // Append computed attribute to API responses
    protected $appends = ['normal_balance'];

    protected function casts(): array
    {
        return [
            'affects_balance' => 'boolean',
            'affects_results' => 'boolean',
        ];
    }

    // Computed attribute to return frontend-friendly value
    public function getNormalBalanceAttribute()
    {
        return $this->nature === 'deudora' ? 'debit' : 'credit';
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
}

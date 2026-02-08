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

    protected function casts(): array
    {
        return [
            'affects_balance' => 'boolean',
            'affects_results' => 'boolean',
        ];
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

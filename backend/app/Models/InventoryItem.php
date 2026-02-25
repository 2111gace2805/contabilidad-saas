<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'item_code', 'name', 'description',
        'item_type',
        'unit_of_measure', 'cost_method', 'current_quantity',
        'average_cost', 'inventory_account_id', 'cogs_account_id', 'active',
    ];

    protected function casts(): array
    {
        return [
            'current_quantity' => 'decimal:4',
            'average_cost' => 'decimal:4',
            'active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function inventoryAccount()
    {
        return $this->belongsTo(Account::class, 'inventory_account_id');
    }

    public function cogsAccount()
    {
        return $this->belongsTo(Account::class, 'cogs_account_id');
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'item_id');
    }
}

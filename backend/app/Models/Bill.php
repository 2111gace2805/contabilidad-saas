<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'supplier_id', 'bill_number', 'bill_date',
        'due_date', 'subtotal', 'tax', 'total', 'balance', 'status',
        'journal_entry_id',
    ];

    protected function casts(): array
    {
        return [
            'bill_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
            'balance' => 'decimal:2',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function payments()
    {
        return $this->belongsToMany(SupplierPayment::class, 'bill_payment_applications', 'bill_id', 'payment_id')
            ->withPivot('amount')
            ->withTimestamps();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'customer_id', 'invoice_number', 'invoice_date',
        'due_date', 'subtotal', 'tax', 'total', 'balance', 'status',
        'journal_entry_id',
    ];

    protected function casts(): array
    {
        return [
            'invoice_date' => 'date',
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

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function payments()
    {
        return $this->belongsToMany(CustomerPayment::class, 'payment_applications', 'invoice_id', 'payment_id')
            ->withPivot('amount')
            ->withTimestamps();
    }
}

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
        'journal_entry_id', 'notes', 'tipo_dte', 'dte_version', 'dte_ambiente',
        'dte_numero_control', 'dte_codigo_generacion', 'dte_fec_emi', 'dte_hor_emi',
        'dte_sello_recibido', 'dte_firma_electronica', 'dte_emisor', 'dte_receptor',
        'dte_cuerpo_documento', 'dte_resumen', 'dte_apendice', 'dte_raw_json',
        'supplier_name_snapshot', 'supplier_tax_id_snapshot', 'supplier_phone_snapshot',
        'supplier_email_snapshot', 'supplier_address_snapshot', 'is_fiscal_credit',
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
            'dte_fec_emi' => 'date',
            'dte_emisor' => 'array',
            'dte_receptor' => 'array',
            'dte_cuerpo_documento' => 'array',
            'dte_resumen' => 'array',
            'dte_apendice' => 'array',
            'is_fiscal_credit' => 'boolean',
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

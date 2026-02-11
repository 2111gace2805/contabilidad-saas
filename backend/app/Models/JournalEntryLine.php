<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntryLine extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'journal_entry_id',
        'account_id',
        'debit',
        'credit',
        'description',
        'line_number',
    ];

    public function journalEntry()
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public static function boot()
    {
        parent::boot();

        static::saving(function ($line) {
            // Allow 0/0 for drafts or incomplete lines
            // Only validate if at least one is > 0 to prevent both > 0
            if ($line->debit > 0 && $line->credit > 0) {
                throw new \Exception('Una partida no puede tener valores tanto en debe como en haber.');
            }

            if ($line->account && !$line->account->is_detail) {
                throw new \Exception('La cuenta seleccionada no es una cuenta de detalle.');
            }
        });
    }
}

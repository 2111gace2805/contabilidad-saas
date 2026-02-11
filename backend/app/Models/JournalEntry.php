<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    use HasFactory;

    const STATUS_DRAFT = 'draft';
    const STATUS_POSTED = 'posted';
    const STATUS_PENDING_VOID = 'pending_void';
    const STATUS_VOIDED = 'void';

    protected $fillable = [
        'company_id',
        'entry_date',
        'entry_number',
        'sequence_number',
        'type_number',
        'entry_type',
        'description',
        'status',
        'created_by',
        'void_reason',
        'void_requested_by',
        'void_requested_at',
        'void_authorized_by',
        'void_authorized_at',
    ];

    public function lines()
    {
        return $this->hasMany(JournalEntryLine::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function voidRequestedBy()
    {
        return $this->belongsTo(User::class, 'void_requested_by');
    }

    public function voidAuthorizedBy()
    {
        return $this->belongsTo(User::class, 'void_authorized_by');
    }

    public static function boot()
    {
        parent::boot();

        static::updating(function ($journalEntry) {
            if (in_array(strtoupper($journalEntry->getOriginal('status')), ['POSTED', 'VOIDED'])) {
                throw new \Exception('No se puede modificar una póliza que ya ha sido contabilizada o anulada.');
            }
        });
    }

    public function validateOpenPeriod()
    {
        $openPeriods = Period::where('company_id', $this->company_id)->where('status', 'OPEN')->get();
        $isInOpenPeriod = $openPeriods->contains(function ($period) {
            return $this->entry_date >= $period->start_date && $this->entry_date <= $period->end_date;
        });

        if (!$isInOpenPeriod) {
            throw new \Exception('La fecha de la póliza no se encuentra dentro de un periodo abierto.');
        }
    }
}

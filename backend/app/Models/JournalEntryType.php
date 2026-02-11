<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalEntryType extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'code', 'name', 'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function entries()
    {
        return $this->hasMany(JournalEntry::class, 'entry_type', 'code');
    }
}

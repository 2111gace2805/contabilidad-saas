<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountingSegment extends Model
{
    use HasFactory;

    public $timestamps = false;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'company_id', 'code', 'name', 'description',
        'parent_segment_id', 'level', 'digit_length', 'sequence', 'active',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function parent()
    {
        return $this->belongsTo(AccountingSegment::class, 'parent_segment_id');
    }

    public function children()
    {
        return $this->hasMany(AccountingSegment::class, 'parent_segment_id');
    }
}

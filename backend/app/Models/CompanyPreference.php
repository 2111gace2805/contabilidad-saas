<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'primary_color',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}

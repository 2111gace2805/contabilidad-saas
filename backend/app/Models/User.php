<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'active',
        'is_super_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
            'is_super_admin' => 'boolean',
        ];
    }

    // Helper methods for role checking
    public function isSuperAdmin(): bool
    {
        return $this->is_super_admin === true;
    }

    public function isAdminOfCompany(int $companyId): bool
    {
        return $this->companies()
            ->wherePivot('company_id', $companyId)
            ->wherePivot('role', 'admin')
            ->exists();
    }

    public function hasAccessToCompany(int $companyId): bool
    {
        return $this->companies()->where('company_id', $companyId)->exists();
    }

    public function companies()
    {
        return $this->belongsToMany(Company::class, 'company_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class, 'created_by');
    }
}

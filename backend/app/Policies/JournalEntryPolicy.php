<?php

namespace App\Policies;

use App\Models\JournalEntry;
use App\Models\User;

class JournalEntryPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, JournalEntry $journalEntry): bool
    {
        return $user->companies()->where('companies.id', $journalEntry->company_id)->exists();
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, JournalEntry $journalEntry): bool
    {
        return $user->companies()->where('companies.id', $journalEntry->company_id)->exists();
    }

    public function delete(User $user, JournalEntry $journalEntry): bool
    {
        return $user->companies()->where('companies.id', $journalEntry->company_id)->exists();
    }

    public function post(User $user, JournalEntry $journalEntry): bool
    {
        return $user->companies()->where('companies.id', $journalEntry->company_id)->exists();
    }

    public function void(User $user, JournalEntry $journalEntry): bool
    {
        return $user->companies()->where('companies.id', $journalEntry->company_id)->exists();
    }
}

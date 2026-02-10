<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Company;
use App\Models\Account;
use App\Models\AccountType;

class TaxConfigurationTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_tax_with_accounts()
    {
        // Seed minimal data
        $company = Company::factory()->create();
        $atype = AccountType::factory()->create(['company_id' => $company->id]);

        $acc1 = Account::create(["company_id" => $company->id, "code" => '1000', "name" => 'Test A', "account_type_id" => $atype->id, "level" => 1, "is_detail" => false, "active" => true]);
        $acc2 = Account::create(["company_id" => $company->id, "code" => '1100', "name" => 'Test B', "account_type_id" => $atype->id, "level" => 2, "is_detail" => false, "active" => true]);

        $payload = [
            'code' => 'IVA_TEST',
            'name' => 'IVA Test',
            'type' => 'IVA',
            'rate' => 16.00,
            'is_active' => true,
            'debit_account_id' => $acc1->id,
            'credit_account_id' => $acc2->id,
        ];

        $response = $this->withHeader('X-Company-Id', $company->id)
            ->postJson('/api/taxes', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('taxes', ['company_id' => $company->id, 'code' => 'IVA_TEST']);
    }
}

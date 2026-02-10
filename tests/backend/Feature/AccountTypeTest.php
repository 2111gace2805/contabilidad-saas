<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountTypeTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed');
    }

    public function test_index_returns_normal_balance()
    {
        $user = User::where('email', 'admin@example.com')->first();
        $company = Company::first();

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/account-types', ['X-Company-Id' => $company->id]);

        $response->assertStatus(200);
        $data = $response->json();
        $this->assertIsArray($data);
        $this->assertArrayHasKey('normal_balance', $data[0]);
        $this->assertContains($data[0]['normal_balance'], ['debit', 'credit']);
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Company;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountingSegmentTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        // seed basic data
        $this->artisan('db:seed');
    }

    public function test_store_segment_success()
    {
        $user = User::where('email', 'admin@example.com')->first();
        $company = Company::first();

        $payload = [
            'code' => '1',
            'name' => 'ACTIVO',
            'digit_length' => 1,
            'active' => true,
        ];

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/accounting-segments', $payload, ['X-Company-Id' => $company->id]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('accounting_segments', ['company_id' => $company->id, 'code' => '1']);
    }

    public function test_store_segment_duplicate_code_fails()
    {
        $user = User::where('email', 'admin@example.com')->first();
        $company = Company::first();

        // first
        $payload = [
            'code' => '2',
            'name' => 'PASIVO',
            'digit_length' => 1,
            'active' => true,
        ];

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/accounting-segments', $payload, ['X-Company-Id' => $company->id])
            ->assertStatus(201);

        // duplicate
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/accounting-segments', $payload, ['X-Company-Id' => $company->id])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['code']]);
    }
}

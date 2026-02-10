<?php

namespace Tests\Feature;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    private function actingAsUser(): User
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    public function test_authenticated_user_can_list_their_todos(): void
    {
        $user = $this->actingAsUser();
        
        // Create todos for this user
        Todo::factory()->count(3)->create(['user_id' => $user->id]);
        
        // Create todos for another user
        $otherUser = User::factory()->create();
        Todo::factory()->count(2)->create(['user_id' => $otherUser->id]);

        $response = $this->getJson('/api/todos');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_authenticated_user_can_create_todo(): void
    {
        $user = $this->actingAsUser();

        $response = $this->postJson('/api/todos', [
            'title' => 'Test Todo',
            'description' => 'This is a test todo',
            'completed' => false,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
                'completed',
                'user_id',
                'created_at',
                'updated_at',
            ])
            ->assertJson([
                'title' => 'Test Todo',
                'user_id' => $user->id,
            ]);

        $this->assertDatabaseHas('todos', [
            'title' => 'Test Todo',
            'user_id' => $user->id,
        ]);
    }

    public function test_authenticated_user_can_view_their_todo(): void
    {
        $user = $this->actingAsUser();
        $todo = Todo::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/todos/{$todo->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $todo->id,
                'title' => $todo->title,
            ]);
    }

    public function test_authenticated_user_cannot_view_other_users_todo(): void
    {
        $user = $this->actingAsUser();
        $otherUser = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->getJson("/api/todos/{$todo->id}");

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_update_their_todo(): void
    {
        $user = $this->actingAsUser();
        $todo = Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Original Title',
            'completed' => false,
        ]);

        $response = $this->patchJson("/api/todos/{$todo->id}", [
            'title' => 'Updated Title',
            'completed' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'title' => 'Updated Title',
                'completed' => true,
            ]);

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
            'title' => 'Updated Title',
            'completed' => true,
        ]);
    }

    public function test_authenticated_user_cannot_update_other_users_todo(): void
    {
        $user = $this->actingAsUser();
        $otherUser = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->patchJson("/api/todos/{$todo->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_delete_their_todo(): void
    {
        $user = $this->actingAsUser();
        $todo = Todo::factory()->create(['user_id' => $user->id]);

        $response = $this->deleteJson("/api/todos/{$todo->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('todos', [
            'id' => $todo->id,
        ]);
    }

    public function test_authenticated_user_cannot_delete_other_users_todo(): void
    {
        $user = $this->actingAsUser();
        $otherUser = User::factory()->create();
        $todo = Todo::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->deleteJson("/api/todos/{$todo->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('todos', [
            'id' => $todo->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_access_todos(): void
    {
        $response = $this->getJson('/api/todos');

        $response->assertStatus(401);
    }

    public function test_title_is_required_when_creating_todo(): void
    {
        $this->actingAsUser();

        $response = $this->postJson('/api/todos', [
            'description' => 'Description without title',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('title');
    }
}

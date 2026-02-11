<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CompanyUserController extends Controller
{
    /**
     * Display a listing of the users for the current company.
     */
    public function index(Request $request)
    {
        $company = $request->attributes->get('company');

        if (!$company) {
            return response()->json(['message' => 'Company context required'], 400);
        }

        $users = $company->users()
            ->withPivot('role')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot->role,
                    'is_active' => true, // Assuming active if in list
                ];
            });

        return response()->json($users);
    }

    /**
     * Store a newly created user in storage and assign to company.
     */
    public function store(Request $request)
    {
        $company = $request->attributes->get('company');

        if (!$company) {
            return response()->json(['message' => 'Company context required'], 400);
        }

        // Check max users limit
        $currentUsersCount = $company->users()->count();
        if ($company->max_users > 0 && $currentUsersCount >= $company->max_users) {
            return response()->json([
                'message' => "Se ha alcanzado el límite de usuarios permitidos para esta empresa ({$company->max_users}). Contacte al administrador del sistema para ampliar su plan."
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,accountant,viewer',
        ]);

        DB::beginTransaction();
        try {
            // Find or Create User
            // We check if user exists globally by email
            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                $user = User::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'is_super_admin' => false, // Always false for company-created users
                ]);
            }

            // Check if already assigned to this company
            if ($company->users()->where('user_id', $user->id)->exists()) {
                 // Update role if already exists? Or separate endpoint? 
                 // Let's fail if exists to be clear, or just update pivot.
                 // For stricter control, let's say "User already assigned".
                 return response()->json(['message' => 'El usuario ya está asignado a esta empresa.'], 422);
            }

            // Assign to company
            $company->users()->attach($user->id, ['role' => $validated['role']]);

            DB::commit();

            return response()->json([
                'message' => 'Usuario creado y asignado exitosamente.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $validated['role'],
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear usuario: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the specified user in storage (Role only for existing users, Details for owned?).
     * Ideally, we only allow changing the ROLE within this company. 
     * Changing global user details (name/password) might affect other companies if user is shared.
     * Policy decision: Admin can update Name/Email/Password ONLY if the user is NOT a super admin.
     * AND maybe only if matches ID?
     * For now, let's allow updating Name/Email/Role locally.
     */
    public function update(Request $request, $id)
    {
        $company = $request->attributes->get('company');
        
        $user = $company->users()->find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado en esta empresa.'], 404);
        }

        // Prevent modifying Super Admins from Company view
        if ($user->is_super_admin) {
            return response()->json(['message' => 'No puedes modificar a un Super Administrador.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:admin,accountant,viewer',
            'password' => 'nullable|string|min:8',
        ]);

        DB::beginTransaction();
        try {
            // Update User details
            $userUpdateData = [];
            if (isset($validated['name'])) $userUpdateData['name'] = $validated['name'];
            if (isset($validated['email'])) $userUpdateData['email'] = $validated['email'];
            if (!empty($validated['password'])) $userUpdateData['password'] = Hash::make($validated['password']);

            if (!empty($userUpdateData)) {
                $user->update($userUpdateData);
            }

            // Update Role in Pivot
            if (isset($validated['role'])) {
                $company->users()->updateExistingPivot($user->id, ['role' => $validated['role']]);
            }

            DB::commit();

            return response()->json(['message' => 'Usuario actualizado exitosamente.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar usuario: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified user from the company.
     */
    public function destroy(Request $request, $id)
    {
        $company = $request->attributes->get('company');
        $user = $company->users()->find($id);

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado en esta empresa.'], 404);
        }
        
        // Prevent deleting yourself (if you are the admin)
        if ($request->user()->id == $user->id) {
             return response()->json(['message' => 'No puedes eliminar tu propia cuenta de la empresa.'], 403);
        }

        // Detach
        $company->users()->detach($user->id);

        return response()->json(['message' => 'Usuario eliminado de la empresa exitosamente.']);
    }
}

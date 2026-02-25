<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class SuperAdminController extends Controller
{
    public function getAllCompanies()
    {
        $companies = Company::with(['users' => function ($query) {
            $query->select('users.id', 'users.name', 'users.email')
                  ->withPivot('role');
        }])
        ->withCount(['customers', 'suppliers', 'journalEntries'])
        ->orderBy('name')
        ->get();

        return response()->json($companies);
    }

    public function getAllUsers()
    {
        $users = User::with('companies:id,name')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

    public function createCompany(Request $request)
    {
        $input = $request->all();
        if (!isset($input['nit']) && isset($input['rfc'])) {
            $input['nit'] = $input['rfc'];
        }

        $validator = Validator::make($input, [
            'name' => 'required|string|max:255',
            'nit' => 'nullable|string|max:20',
            'rfc' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'currency' => 'nullable|string|max:3',
            'fiscal_year_start' => 'integer|min:1|max:12',
            'admin_user_id' => 'nullable|exists:users,id',
            'max_users' => 'integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $data = $validator->validated();
            if (!isset($data['rfc']) && isset($data['nit'])) {
                $data['rfc'] = $data['nit'];
            }

            $company = Company::create($data);

            if ($request->admin_user_id) {
                DB::table('company_users')->insert([
                    'company_id' => $company->id,
                    'user_id' => $request->admin_user_id,
                    'role' => 'admin',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
            return response()->json($company, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function deleteCompany($id)
    {
        $company = Company::findOrFail($id);
        $hasTransactions = $this->companyHasTransactions($company);

        if ($hasTransactions) {
            return response()->json([
                'message' => 'No se puede eliminar esta empresa porque tiene transacciones.'
            ], 422);
        }

        $company->delete();
        return response()->json(['message' => 'Company deleted successfully']);
    }


    public function disableCompany($id)
    {
        $company = Company::findOrFail($id);
        $hasTransactions = $this->companyHasTransactions($company);

        if ($hasTransactions) {
            return response()->json([
                'message' => 'No se puede deshabilitar esta empresa porque tiene transacciones.'
            ], 422);
        }

        $company->active = false;
        $company->save();

        return response()->json(['message' => 'Company disabled successfully', 'company' => $company]);
    }

    public function enableCompany($id)
    {
        $company = Company::findOrFail($id);

        if ($company->active) {
            return response()->json(['message' => 'Company already enabled', 'company' => $company]);
        }

        $company->active = true;
        $company->save();

        return response()->json(['message' => 'Company enabled successfully', 'company' => $company]);
    }

    public function updateCompany(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $input = $request->all();
        if (!isset($input['nit']) && isset($input['rfc'])) {
            $input['nit'] = $input['rfc'];
        }

        $validator = Validator::make($input, [
            'name' => 'required|string|max:255',
            'nit' => 'nullable|string|max:20',
            'rfc' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'currency' => 'nullable|string|max:3',
            'fiscal_year_start' => 'integer|min:1|max:12',
            'max_users' => 'integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (!isset($data['rfc']) && isset($data['nit'])) {
            $data['rfc'] = $data['nit'];
        }

        $company->update($data);

        return response()->json($company);
    }

    public function assignUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
            'role' => 'required|in:admin,accountant,viewer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = DB::table('company_users')
            ->where('user_id', $request->user_id)
            ->where('company_id', $request->company_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Usuario ya está asignado'], 422);
        }

        // Check max users limit
        $company = Company::findOrFail($request->company_id);
        $currentUsersCount = DB::table('company_users')
            ->where('company_id', $request->company_id)
            ->count();

        if ($currentUsersCount >= $company->max_users) {
            return response()->json([
                'message' => "La empresa ha alcanzado su límite máximo de {$company->max_users} usuarios."
            ], 422);
        }

        DB::table('company_users')->insert([
            'user_id' => $request->user_id,
            'company_id' => $request->company_id,
            'role' => $request->role,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'User assigned successfully']);
    }

    public function updateUserRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
            'role' => 'required|in:admin,accountant,viewer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::table('company_users')
            ->where('user_id', $request->user_id)
            ->where('company_id', $request->company_id)
            ->update(['role' => $request->role, 'updated_at' => now()]);

        return response()->json(['message' => 'Role updated successfully']);
    }

    public function removeUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::table('company_users')
            ->where('user_id', $request->user_id)
            ->where('company_id', $request->company_id)
            ->delete();

        return response()->json(['message' => 'User removed successfully']);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'is_super_admin' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'active' => true,
            'is_super_admin' => $request->is_super_admin ?? false,
        ]);

        return response()->json($user, 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return response()->json($user);
    }

    public function changeUserPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update([
            'password' => bcrypt($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function changeOwnPassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!\Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['La contraseña actual es incorrecta']]
            ], 422);
        }

        $user->update([
            'password' => bcrypt($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    private function companyHasTransactions(Company $company): bool
    {
        try {
            return $company->journalEntries()->exists()
                || $company->customers()->exists()
                || $company->suppliers()->exists()
                || $company->inventoryItems()->exists()
                || $company->bankAccounts()->exists();
        } catch (\Exception $e) {
            \Log::error('Error checking company transactions: ' . $e->getMessage());
            return true;
        }
    }
}

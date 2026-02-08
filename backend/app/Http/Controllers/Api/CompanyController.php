<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $companies = $request->user()->companies()
            ->withPivot('role')
            ->orderBy('name')
            ->get();
        
        return response()->json($companies);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'rfc' => 'nullable|string|max:20',
            'nrc' => 'nullable|string|max:20',
            'nit' => 'nullable|string|max:20',
            'taxpayer_type' => 'nullable|string|max:50',
            'is_withholding_agent' => 'boolean',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'currency' => 'nullable|string|max:3',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company = Company::create($validator->validated());
        
        $request->user()->companies()->attach($company->id, ['role' => 'admin']);
        
        return response()->json($company, 201);
    }

    public function show(Request $request, $id)
    {
        $company = $request->user()->companies()->findOrFail($id);
        
        return response()->json($company);
    }

    public function update(Request $request, $id)
    {
        $company = $request->user()->companies()->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'rfc' => 'nullable|string|max:20',
            'nrc' => 'nullable|string|max:20',
            'nit' => 'nullable|string|max:20',
            'taxpayer_type' => 'nullable|string|max:50',
            'is_withholding_agent' => 'boolean',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'currency' => 'nullable|string|max:3',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $company->update($validator->validated());
        
        return response()->json($company);
    }

    public function destroy(Request $request, $id)
    {
        $company = $request->user()->companies()->findOrFail($id);
        
        // Check if company has any transactions
        $hasTransactions = $this->companyHasTransactions($company);
        
        if ($hasTransactions) {
            return response()->json([
                'message' => 'No se puede eliminar esta empresa porque tiene transacciones registradas.'
            ], 422);
        }
        
        $company->delete();
        
        return response()->json(['message' => 'Company deleted successfully']);
    }

    public function canDelete(Request $request, $id)
    {
        try {
            $company = $request->user()->companies()->findOrFail($id);
            
            $hasTransactions = $this->companyHasTransactions($company);
            
            return response()->json([
                'can_delete' => !$hasTransactions,
                'has_transactions' => $hasTransactions,
                'message' => $hasTransactions 
                    ? 'No se puede eliminar esta empresa porque tiene transacciones registradas.'
                    : 'Esta empresa puede ser eliminada.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'can_delete' => false,
                'has_transactions' => false,
                'message' => 'Error al verificar la empresa: ' . $e->getMessage()
            ], 500);
        }
    }

    private function companyHasTransactions(Company $company): bool
    {
        try {
            // Check for journal entries
            if ($company->journalEntries()->exists()) {
                return true;
            }

            // Check for invoices (if relation exists)
            if (method_exists($company, 'invoices') && $company->invoices()->exists()) {
                return true;
            }

            // Check for bills (if relation exists)
            if (method_exists($company, 'bills') && $company->bills()->exists()) {
                return true;
            }

            // Check for customers
            if ($company->customers()->exists()) {
                return true;
            }

            // Check for suppliers
            if ($company->suppliers()->exists()) {
                return true;
            }

            // Check for inventory items
            if ($company->inventoryItems()->exists()) {
                return true;
            }

            // Check for bank accounts with transactions
            if ($company->bankAccounts()->exists()) {
                return true;
            }

            return false;
        } catch (\Exception $e) {
            \Log::error('Error checking company transactions: ' . $e->getMessage());
            return true; // Si hay error, asumimos que tiene transacciones por seguridad
        }
    }

    public function select(Request $request, $id)
    {
        $company = $request->user()->companies()->findOrFail($id);
        
        return response()->json([
            'message' => 'Company selected',
            'company' => $company,
        ]);
    }
}

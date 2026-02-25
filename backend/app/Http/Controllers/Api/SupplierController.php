<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;

class SupplierController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    public function index(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = Supplier::where('company_id', $companyId);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('nit', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $suppliers = $query->orderBy('name')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($suppliers);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'nit' => 'nullable|string|max:50',
            'rfc' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'credit_days' => 'nullable|integer|min:0',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (!isset($data['nit']) && isset($data['rfc'])) {
            $data['nit'] = $data['rfc'];
        }
        unset($data['rfc']);
        $data['company_id'] = $companyId;

        $supplier = Supplier::create($data);
        
        return response()->json($supplier, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $supplier = Supplier::where('company_id', $companyId)
            ->with(['bills'])
            ->findOrFail($id);
        
        return response()->json($supplier);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $supplier = Supplier::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'nullable|string|max:50',
            'nit' => 'nullable|string|max:50',
            'rfc' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'credit_days' => 'nullable|integer|min:0',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (!isset($data['nit']) && isset($data['rfc'])) {
            $data['nit'] = $data['rfc'];
        }
        unset($data['rfc']);

        $supplier->update($data);
        
        return response()->json($supplier);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $supplier = Supplier::where('company_id', $companyId)->findOrFail($id);

        $hasBills = $supplier->bills()
            ->where('company_id', $companyId)
            ->exists();

        if ($hasBills) {
            return response()->json([
                'message' => 'No se puede eliminar este proveedor porque tiene transacciones procesadas.',
            ], 422);
        }

        try {
            $supplier->delete();
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar este proveedor porque tiene transacciones procesadas.',
                ], 422);
            }

            throw $exception;
        }
        
        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}

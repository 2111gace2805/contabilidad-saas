<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaxController extends Controller
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

        $query = Tax::where('company_id', $companyId);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
        }

        $taxes = $query->orderBy('code')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($taxes);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'rate' => 'required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $exists = Tax::where('company_id', $companyId)
            ->where('code', $request->code)
            ->exists();
        
        if ($exists) {
            return response()->json(['message' => 'Ya existe un impuesto con ese código'], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        $tax = Tax::create($data);
        
        return response()->json($tax, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $tax = Tax::where('company_id', $companyId)->findOrFail($id);
        
        return response()->json($tax);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $tax = Tax::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:50',
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|max:255',
            'rate' => 'sometimes|required|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('code') && $request->code !== $tax->code) {
            $exists = Tax::where('company_id', $companyId)
                ->where('code', $request->code)
                ->where('id', '!=', $id)
                ->exists();
            
            if ($exists) {
                return response()->json(['message' => 'Ya existe un impuesto con ese código'], 422);
            }
        }

        $tax->update($validator->validated());
        
        return response()->json($tax);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $tax = Tax::where('company_id', $companyId)->findOrFail($id);
        
        $tax->delete();
        
        return response()->json(['message' => 'Impuesto eliminado exitosamente']);
    }
}

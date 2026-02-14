<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
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

        $query = Customer::where('company_id', $companyId);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%")
                  ->orWhere('rfc', 'like', "%{$search}%")
                  ->orWhere('email1', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $customers = $query->orderBy('name')
            ->paginate($request->get('per_page', 15));
        
        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:customers,code,NULL,id,company_id,' . $companyId,
            'rfc' => 'nullable|string|max:50',
            'business_name' => 'nullable|string|max:255',
            'profile_type' => 'required|in:natural,juridical',
            'contact_name' => 'nullable|string|max:255',
            'email1' => 'required|email|max:255',
            'email2' => 'nullable|email|max:255',
            'email3' => 'nullable|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'required|string',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_days' => 'nullable|integer|min:0',
            'active' => 'boolean',
            'customer_type_id' => 'nullable|exists:customer_types,id',
            'economic_activity_id' => 'nullable|string|size:5',
            'depa_id' => 'required|string|max:10',
            'municipality_id' => 'required|integer',
            'district_id' => 'required|integer',
            'nit' => 'nullable|string|max:17',
            'nrc' => 'nullable|string',
            'dui' => 'nullable|string|max:10',
            'is_gran_contribuyente' => 'boolean',
            'is_exento_iva' => 'boolean',
            'is_no_sujeto_iva' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;
        $data['is_gran_contribuyente'] = $request->boolean('is_gran_contribuyente');
        $data['is_exento_iva'] = $request->boolean('is_exento_iva');
        $data['is_no_sujeto_iva'] = $request->boolean('is_no_sujeto_iva');

        $customer = Customer::create($data);
        
        return response()->json($customer, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $customer = Customer::where('company_id', $companyId)
            ->with(['invoices'])
            ->findOrFail($id);
        
        return response()->json($customer);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $customer = Customer::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'code' => 'required|string|max:50|unique:customers,code,' . $id . ',id,company_id,' . $companyId,
            'rfc' => 'nullable|string|max:50',
            'business_name' => 'nullable|string|max:255',
            'profile_type' => 'required|in:natural,juridical',
            'contact_name' => 'nullable|string|max:255',
            'email1' => 'sometimes|required|email|max:255',
            'email2' => 'nullable|email|max:255',
            'email3' => 'nullable|email|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'required|string',
            'credit_limit' => 'nullable|numeric|min:0',
            'credit_days' => 'nullable|integer|min:0',
            'active' => 'boolean',
            'customer_type_id' => 'nullable|exists:customer_types,id',
            'economic_activity_id' => 'nullable|string|size:5',
            'depa_id' => 'required|string|max:10',
            'municipality_id' => 'required|integer',
            'district_id' => 'required|integer',
            'nit' => 'nullable|string|max:17',
            'nrc' => 'nullable|string',
            'dui' => 'nullable|string|max:10',
            'is_gran_contribuyente' => 'boolean',
            'is_exento_iva' => 'boolean',
            'is_no_sujeto_iva' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $validated['is_gran_contribuyente'] = $request->boolean('is_gran_contribuyente', $customer->is_gran_contribuyente);
        $validated['is_exento_iva'] = $request->boolean('is_exento_iva', $customer->is_exento_iva);
        $validated['is_no_sujeto_iva'] = $request->boolean('is_no_sujeto_iva', $customer->is_no_sujeto_iva);

        $customer->update($validated);
        
        return response()->json($customer);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $customer = Customer::where('company_id', $companyId)->findOrFail($id);
        
        $customer->delete();
        
        return response()->json(['message' => 'Customer deleted successfully']);
    }
}

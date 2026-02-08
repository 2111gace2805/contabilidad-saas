<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountingSegment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountingSegmentController extends Controller
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

        $segments = AccountingSegment::where('company_id', $companyId)
            ->orderBy('code')
            ->get();
        
        return response()->json($segments);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:10',
            'name' => 'required|string|max:100',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        $segment = AccountingSegment::create($data);
        
        return response()->json($segment, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $segment = AccountingSegment::where('company_id', $companyId)
            ->findOrFail($id);
        
        return response()->json($segment);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $segment = AccountingSegment::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|required|string|max:10',
            'name' => 'sometimes|required|string|max:100',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $segment->update($validator->validated());
        
        return response()->json($segment);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $segment = AccountingSegment::where('company_id', $companyId)->findOrFail($id);
        
        $segment->delete();
        
        return response()->json(['message' => 'Accounting segment deleted successfully']);
    }
}

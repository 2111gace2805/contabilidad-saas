<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountingSegment;
use Illuminate\Database\QueryException;
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
            'code' => 'required|string|max:10|unique:accounting_segments,code,NULL,id,company_id,' . $companyId,
            'name' => 'required|string|max:100',
            'digit_length' => 'required|integer|min:1|max:10', // Use digit_length to match model
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        // Ensure digit_length is an integer
        $data['digit_length'] = intval($data['digit_length']);

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
            'code' => 'sometimes|required|string|max:10|unique:accounting_segments,code,' . $id . ',id,company_id,' . $companyId,
            'name' => 'sometimes|required|string|max:100',
            'digit_length' => 'sometimes|required|integer|min:1|max:10',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (isset($data['digit_length'])) {
            $data['digit_length'] = intval($data['digit_length']);
        }

        $segment->update($data);
        
        return response()->json($segment);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $segment = AccountingSegment::where('company_id', $companyId)->findOrFail($id);

        try {
            $segment->delete();
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() === '23000') {
                return response()->json([
                    'message' => 'No se puede eliminar este segmento contable porque tiene transacciones procesadas.',
                ], 422);
            }

            throw $exception;
        }
        
        return response()->json(['message' => 'Accounting segment deleted successfully']);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountingPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AccountingPeriodController extends Controller
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

        $periods = AccountingPeriod::where('company_id', $companyId)
            ->orderBy('fiscal_year', 'desc')
            ->orderBy('period_number', 'desc')
            ->get();
        
        return response()->json($periods);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'fiscal_year' => 'required|integer|min:2000',
            'period_number' => 'required|integer|min:1|max:12',
            'period_type' => 'nullable|string|max:20',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'status' => 'required|in:open,closed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['company_id'] = $companyId;

        $period = AccountingPeriod::create($data);
        
        return response()->json($period, 201);
    }

    public function show(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $period = AccountingPeriod::where('company_id', $companyId)
            ->findOrFail($id);
        
        return response()->json($period);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $period = AccountingPeriod::where('company_id', $companyId)->findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'fiscal_year' => 'sometimes|required|integer|min:2000',
            'period_number' => 'sometimes|required|integer|min:1|max:12',
            'period_type' => 'nullable|string|max:20',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:open,closed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $period->update($validator->validated());
        
        return response()->json($period);
    }

    public function close(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $period = AccountingPeriod::where('company_id', $companyId)->findOrFail($id);
        
        $period->update(['status' => 'closed']);
        
        return response()->json(['message' => 'Period closed successfully', 'period' => $period]);
    }

    public function open(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $period = AccountingPeriod::where('company_id', $companyId)->findOrFail($id);
        
        $period->update(['status' => 'open']);
        
        return response()->json(['message' => 'Period opened successfully', 'period' => $period]);
    }

    public function generateYear(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        
        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $year = $request->year;

        // Check if year already exists
        $existing = AccountingPeriod::where('company_id', $companyId)
            ->where('fiscal_year', $year)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Periods for this year already exist'], 422);
        }

        // Generate 12 periods
        $monthNames = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        $periods = [];
        for ($month = 1; $month <= 12; $month++) {
            $startDate = \Carbon\Carbon::create($year, $month, 1);
            $endDate = $startDate->copy()->endOfMonth();

            $period = AccountingPeriod::create([
                'company_id' => $companyId,
                'fiscal_year' => $year,
                'period_number' => $month,
                'year' => $year,
                'month' => $month,
                'period_name' => $monthNames[$month] . ' ' . $year,
                'period_type' => 'month',
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'status' => 'open',
                'is_closed' => false,
            ]);

            $periods[] = $period;
        }

        return response()->json([
            'message' => '12 periods generated successfully',
            'periods' => $periods
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        
        $period = AccountingPeriod::where('company_id', $companyId)->findOrFail($id);

        if ($period->status === 'closed') {
            return response()->json(['message' => 'Cannot delete a closed period'], 422);
        }

        $period->delete();
        
        return response()->json(['message' => 'Period deleted successfully']);
    }
}

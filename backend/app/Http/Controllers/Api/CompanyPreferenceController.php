<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyPreference;
use App\Support\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyPreferenceController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    public function show(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $preference = CompanyPreference::firstOrCreate(
            ['company_id' => $companyId],
            ['primary_color' => 'slate']
        );

        return response()->json($preference);
    }

    public function update(Request $request)
    {
        $companyId = $this->getCompanyId($request);

        if (!$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $validator = Validator::make($request->all(), [
            'primary_color' => 'required|string|in:slate,blue,emerald,indigo,rose,amber',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $preference = CompanyPreference::updateOrCreate(
            ['company_id' => $companyId],
            ['primary_color' => $validator->validated()['primary_color']]
        );

        AuditLogger::log(
            $request,
            (int) $companyId,
            'company.preference.update',
            'company_preference',
            (string) $preference->id,
            'Color corporativo actualizado',
            ['primary_color' => $preference->primary_color]
        );

        return response()->json($preference);
    }
}

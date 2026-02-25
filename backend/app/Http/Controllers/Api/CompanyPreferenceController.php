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
            'firmador_certificate_name' => 'nullable|string|max:255',
            'firmador_certificate_content' => 'nullable|string',
            'firmador_private_key_name' => 'nullable|string|max:255',
            'firmador_private_key_content' => 'nullable|string',
            'firmador_api_password' => 'nullable|string|max:255',
            'firmador_api_url' => 'nullable|url|max:255',
            'smtp_provider' => 'nullable|string|in:office365,google,zeptomail,aws,custom',
            'smtp_url' => 'nullable|url|max:255',
            'smtp_api_key' => 'nullable|string|max:255',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_username' => 'nullable|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'smtp_encryption' => 'nullable|string|in:tls,ssl,starttls,none',
            'smtp_region' => 'nullable|string|max:30',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $preference = CompanyPreference::updateOrCreate(
            ['company_id' => $companyId],
            $validated
        );

        AuditLogger::log(
            $request,
            (int) $companyId,
            'company.preference.update',
            'company_preference',
            (string) $preference->id,
            'Color corporativo actualizado',
            [
                'primary_color' => $preference->primary_color,
                'smtp_provider' => $preference->smtp_provider,
                'firmador_api_url' => $preference->firmador_api_url,
            ]
        );

        return response()->json($preference);
    }
}

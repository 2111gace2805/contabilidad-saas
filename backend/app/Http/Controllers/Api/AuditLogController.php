<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $companyId = $this->getCompanyId($request);

        $isSuperAdmin = (bool) $user->is_super_admin;
        $isCompanyAdmin = $companyId ? $user->isAdminOfCompany((int) $companyId) : false;

        if (!$isSuperAdmin && !$isCompanyAdmin) {
            return response()->json(['message' => 'No autorizado para ver auditoría'], 403);
        }

        if (!$isSuperAdmin && !$companyId) {
            return response()->json(['message' => 'Company ID required'], 400);
        }

        $query = AuditLog::query()
            ->with(['user:id,name,email', 'company:id,name']);

        if (!$isSuperAdmin) {
            $query->where('company_id', $companyId);
        } elseif ($companyId) {
            $query->where('company_id', $companyId);
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', '%' . $request->action . '%');
        }

        if ($request->filled('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 50))
        );
    }
}

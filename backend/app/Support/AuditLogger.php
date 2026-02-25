<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogger
{
    public static function log(
        ?Request $request,
        ?int $companyId,
        string $action,
        ?string $entityType = null,
        $entityId = null,
        ?string $description = null,
        array $metadata = []
    ): void {
        try {
            AuditLog::create([
                'company_id' => $companyId,
                'user_id' => $request?->user()?->id,
                'action' => $action,
                'entity_type' => $entityType,
                'entity_id' => $entityId !== null ? (string) $entityId : null,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        } catch (\Throwable $e) {
        }
    }
}

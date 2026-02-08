<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCompanyContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if ($user) {
            $companyId = $request->header('X-Company-Id');
            
            if ($companyId) {
                $hasAccess = $user->companies()->where('companies.id', $companyId)->exists();
                
                if (!$hasAccess) {
                    return response()->json(['message' => 'Unauthorized access to this company'], 403);
                }
                
                $request->attributes->set('company_id', $companyId);
            }
        }
        
        return $next($request);
    }
}

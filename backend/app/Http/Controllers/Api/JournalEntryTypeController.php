<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntryType;
use App\Models\JournalEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JournalEntryTypeController extends Controller
{
    private function getCompanyId(Request $request)
    {
        return $request->header('X-Company-Id');
    }

    public function index(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        if (!$companyId) return response()->json(['message' => 'ID de empresa requerido'], 400);

        $types = JournalEntryType::where('company_id', $companyId)
            ->orderBy('code')
            ->get()
            ->map(function ($type) use ($companyId) {
                $type->has_entries = JournalEntry::where('company_id', $companyId)
                    ->where('entry_type', $type->code)
                    ->exists();
                return $type;
            });
        
        return response()->json($types);
    }

    public function store(Request $request)
    {
        $companyId = $this->getCompanyId($request);
        if (!$companyId) return response()->json(['message' => 'ID de empresa requerido'], 400);

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:10',
            'name' => 'required|string|max:100',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        // Check if code already exists for this company
        if (JournalEntryType::where('company_id', $companyId)->where('code', strtoupper($data['code']))->exists()) {
          return response()->json(['errors' => ['code' => ['El código ya está en uso por otro tipo de partida.']]], 422);
        }

        $type = JournalEntryType::create([
            'company_id' => $companyId,
            'code' => strtoupper($data['code']),
            'name' => $data['name'],
            'active' => $data['active'] ?? true,
        ]);

        return response()->json($type, 201);
    }

    public function update(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        $type = JournalEntryType::where('company_id', $companyId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Only name and active can be modified
        $type->update([
            'name' => $request->name,
            'active' => $request->active ?? $type->active,
        ]);

        return response()->json($type);
    }

    public function destroy(Request $request, $id)
    {
        $companyId = $this->getCompanyId($request);
        $type = JournalEntryType::where('company_id', $companyId)->findOrFail($id);

        // Check if entries exist for this type
        $exists = JournalEntry::where('company_id', $companyId)
            ->where('entry_type', $type->code)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'No se puede eliminar el tipo de partida porque tiene movimientos contables asociados.'], 400);
        }

        $type->delete();

        return response()->json(['message' => 'Tipo de partida eliminado exitosamente.']);
    }
}

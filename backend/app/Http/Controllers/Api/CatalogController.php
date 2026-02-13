<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function departments()
    {
        $items = DB::table('departments')->where('status', 'ACTIVE')->select('depa_id as id', 'name')->orderBy('name')->get();
        return response()->json($items);
    }

    public function municipalities(Request $request)
    {
        $depa = $request->query('depa_id');
        $q = DB::table('municipalities')->where('muni_status', 'ACTIVE');
        if ($depa) $q->where('depa_id', $depa);
        $items = $q->select('id', 'muni_nombre as name', 'depa_id')->orderBy('muni_nombre')->get();
        return response()->json($items);
    }

    public function districts(Request $request)
    {
        $muni = $request->query('municipality_id');
        $q = DB::table('districts')->where('dist_status', 'ACTIVE');
        if ($muni) $q->where('munidepa_id', $muni);
        $items = $q->select('id', 'dist_name as name', 'munidepa_id')->orderBy('dist_name')->get();
        return response()->json($items);
    }

    public function customerTypes()
    {
        $items = DB::table('customer_types')->where('is_active', true)->select('id', 'code', 'name')->orderBy('name')->get();
        return response()->json($items);
    }

    public function economicActivities()
    {
        $items = DB::table('economic_activities')->where('status', 'ACTIVE')->select('id', 'name')->orderBy('name')->get();
        return response()->json($items);
    }
}

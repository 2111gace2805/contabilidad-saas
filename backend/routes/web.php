<?php

use Illuminate\Support\Facades\Route;

// Public downloadable template for account import
Route::get('/plantilla.csv', function () {
    $file = public_path('plantilla.csv');
    if (!file_exists($file)) {
        abort(404);
    }
    return response()->download($file, 'plantilla.csv');
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

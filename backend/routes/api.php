<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\AccountTypeController;
use App\Http\Controllers\Api\AccountingSegmentController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\AccountingPeriodController;
use App\Http\Controllers\Api\JournalEntryController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentTypeController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\BankAccountController;
use App\Http\Controllers\Api\InventoryItemController;
use App\Http\Controllers\Api\TodoController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\UnitOfMeasureController;
use App\Http\Controllers\Api\TaxController;

// Authentication routes (no auth required)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'user']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

// Backward compatibility routes (legacy frontend code)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
});

// === SUPER ADMIN ROUTES ===
Route::middleware(['auth:sanctum', 'super.admin'])->prefix('super-admin')->group(function () {
    // Companies Management
    Route::get('/companies', [SuperAdminController::class, 'getAllCompanies']);
    Route::post('/companies', [SuperAdminController::class, 'createCompany']);
    Route::delete('/companies/{id}', [SuperAdminController::class, 'deleteCompany']);
    
    // Users Management
    Route::get('/users', [SuperAdminController::class, 'getAllUsers']);
    Route::post('/users', [SuperAdminController::class, 'createUser']);
    Route::put('/users/{id}', [SuperAdminController::class, 'updateUser']);
    Route::put('/users/{id}/password', [SuperAdminController::class, 'changeUserPassword']);
    Route::post('/users/assign', [SuperAdminController::class, 'assignUser']);
    Route::put('/users/role', [SuperAdminController::class, 'updateUserRole']);
    Route::delete('/users/remove', [SuperAdminController::class, 'removeUser']);
});

// Change own password (any authenticated user)
Route::middleware(['auth:sanctum'])->post('/user/change-password', [SuperAdminController::class, 'changeOwnPassword']);

// Dashboard (authenticated)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
});

// Company management (authenticated, no company context required)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/companies/{company}/can-delete', [CompanyController::class, 'canDelete']);
    Route::apiResource('companies', CompanyController::class);
    Route::post('/companies/{company}/select', [CompanyController::class, 'select']);
});

// Company-scoped routes (requires auth + company context)
Route::middleware(['auth:sanctum', 'company.context'])->group(function () {
    
    // === CATÁLOGO Y CONFIGURACIÓN CONTABLE ===
    
    // Tipos de cuenta
    Route::apiResource('account-types', AccountTypeController::class);
    
    // Segmentos contables
    Route::apiResource('accounting-segments', AccountingSegmentController::class);
    
    // Cuentas contables
    Route::get('accounts/hierarchy', [AccountController::class, 'hierarchy']);
    Route::apiResource('accounts', AccountController::class);
    // Importar catálogo (CSV) - crea/actualiza tipos de cuenta y cuentas según el payload
    Route::post('accounts/import', [AccountController::class, 'import']);
    
    // Períodos contables
    Route::apiResource('accounting-periods', AccountingPeriodController::class);
    Route::post('accounting-periods/{period}/close', [AccountingPeriodController::class, 'close']);
    Route::post('accounting-periods/{period}/open', [AccountingPeriodController::class, 'open']);
    Route::post('accounting-periods/generate-year', [AccountingPeriodController::class, 'generateYear']);
    Route::post('accounting-periods/{period}/reopen', [AccountingPeriodController::class, 'open']); // Alias for compatibility
    
    // === TRANSACCIONES CONTABLES ===
    
    // Pólizas/Asientos contables
    Route::get('journal-entries/pending-voids', [JournalEntryController::class, 'pendingVoids']);
    Route::apiResource('journal-entries', JournalEntryController::class);
    Route::post('journal-entries/{entry}/post', [JournalEntryController::class, 'post']);
    Route::post('journal-entries/{entry}/request-void', [JournalEntryController::class, 'requestVoid']);
    Route::post('journal-entries/{entry}/authorize-void', [JournalEntryController::class, 'authorizeVoid']);
    
    // === MÓDULOS OPERATIVOS ===
    
    // Clientes
    Route::apiResource('customers', CustomerController::class);
    
    // Proveedores
    Route::apiResource('suppliers', SupplierController::class);
    
    // Facturas de venta (Invoices)
    Route::apiResource('invoices', InvoiceController::class);
    Route::post('invoices/{invoice}/post', [InvoiceController::class, 'post']);
    Route::post('invoices/{invoice}/void', [InvoiceController::class, 'void']);
    
    // Facturas de compra (Bills/Purchases)
    Route::apiResource('bills', BillController::class);
    Route::post('bills/{bill}/post', [BillController::class, 'post']);
    Route::post('bills/{bill}/void', [BillController::class, 'void']);
    
    // Inventario
    Route::apiResource('inventory-items', InventoryItemController::class);
    
    // Bancos
    Route::apiResource('bank-accounts', BankAccountController::class);
    
    // Bodegas
    Route::apiResource('warehouses', WarehouseController::class);
    
    // Sucursales
    Route::apiResource('branches', BranchController::class);
    
    // Unidades de Medida
    Route::apiResource('units-of-measure', UnitOfMeasureController::class);
    
    // === CONFIGURACIÓN ===
    
    // Impuestos
    Route::apiResource('taxes', TaxController::class);
    
    // Tipos de documento
    Route::apiResource('document-types', DocumentTypeController::class);
    
    // Métodos de pago
    Route::apiResource('payment-methods', PaymentMethodController::class);
    
    // === REPORTES ===
    
    Route::prefix('reports')->group(function () {
        Route::get('balance-sheet', [ReportController::class, 'balanceSheet']);
        Route::get('income-statement', [ReportController::class, 'incomeStatement']);
        Route::get('trial-balance', [ReportController::class, 'trialBalance']);
        Route::get('general-ledger', [ReportController::class, 'generalLedger']);
        Route::get('accounts-receivable', [ReportController::class, 'accountsReceivable']);
        Route::get('accounts-payable', [ReportController::class, 'accountsPayable']);
    });
    
    // === UTILIDADES ===
    
    // Todos (task management)
    Route::apiResource('todos', TodoController::class);
});

// Route to download plantilla.csv
Route::get('accounts/template', [AccountController::class, 'downloadTemplate']);

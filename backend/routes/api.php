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
use App\Http\Controllers\Api\CompanyUserController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\UnitOfMeasureController;
use App\Http\Controllers\Api\TaxController;
use App\Http\Controllers\Api\JournalEntryTypeController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\CompanyPreferenceController;

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
    Route::put('/companies/{id}', [SuperAdminController::class, 'updateCompany']);
    Route::put('/companies/{id}/disable', [SuperAdminController::class, 'disableCompany']);
    Route::put('/companies/{id}/enable', [SuperAdminController::class, 'enableCompany']);
    
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
    // Tipos de partida (comprobantes)
    Route::apiResource('journal-entry-types', JournalEntryTypeController::class);
    
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
    
    // Partidas/Asientos contables
    Route::get('journal-entries/pending-voids', [JournalEntryController::class, 'pendingVoids']);
    Route::apiResource('journal-entries', JournalEntryController::class);
    Route::post('journal-entries/{entry}/post', [JournalEntryController::class, 'post']);
    Route::post('journal-entries/{entry}/request-void', [JournalEntryController::class, 'requestVoid']);
    Route::post('journal-entries/{entry}/authorize-void', [JournalEntryController::class, 'authorizeVoid']);
    
    // === MÓDULOS OPERATIVOS ===
    
    // Clientes
    Route::apiResource('customers', CustomerController::class);

    // Facturación (Ventas)
    Route::get('invoices/next-number', [InvoiceController::class, 'nextNumber']);
    Route::apiResource('invoices', InvoiceController::class);

    // Usuarios de la empresa
    Route::apiResource('company-users', CompanyUserController::class);

    // Catálogos operativos
    Route::apiResource('document-types', DocumentTypeController::class);
    Route::apiResource('payment-methods', PaymentMethodController::class);
    Route::apiResource('warehouses', WarehouseController::class);
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('units-of-measure', UnitOfMeasureController::class);
    Route::apiResource('taxes', TaxController::class);

    // Catalogs for billing / CxC
    Route::get('catalogs/departments', [CatalogController::class, 'departments']);
    Route::get('catalogs/municipalities', [CatalogController::class, 'municipalities']);
    Route::get('catalogs/districts', [CatalogController::class, 'districts']);
    Route::get('catalogs/customer-types', [CatalogController::class, 'customerTypes']);
    Route::get('catalogs/economic-activities', [CatalogController::class, 'economicActivities']);

    // Cuentas por pagar
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('bills', BillController::class);

    // Bancos
    Route::apiResource('bank-accounts', BankAccountController::class);

    // Inventario
    Route::apiResource('inventory-items', InventoryItemController::class);

    // Reportes
    Route::get('reports/trial-balance', [ReportController::class, 'trialBalance']);
    Route::get('reports/balance-sheet', [ReportController::class, 'balanceSheet']);
    Route::get('reports/income-statement', [ReportController::class, 'incomeStatement']);
    Route::get('reports/purchase-book', [ReportController::class, 'purchaseBook']);
    Route::get('reports/sales-book-consumer', [ReportController::class, 'salesBookConsumer']);
    Route::get('reports/sales-book-taxpayer', [ReportController::class, 'salesBookTaxpayer']);
    Route::get('reports/general-ledger', [ReportController::class, 'generalLedger']);
    Route::get('reports/cash-flow', [ReportController::class, 'cashFlow']);
    Route::get('reports/journal-book', [ReportController::class, 'journalBook']);
    Route::get('reports/accounts-receivable', [ReportController::class, 'accountsReceivable']);
    Route::get('reports/accounts-payable', [ReportController::class, 'accountsPayable']);
    Route::get('reports/fiscal', [ReportController::class, 'fiscalReport']);
    Route::get('reports/inventory', [ReportController::class, 'inventoryReport']);
    Route::get('reports/export/{report}/{format}', [ReportController::class, 'export']);

    // Auditoría y preferencias
    Route::get('audit-logs', [AuditLogController::class, 'index']);
    Route::get('company-preferences', [CompanyPreferenceController::class, 'show']);
    Route::put('company-preferences', [CompanyPreferenceController::class, 'update']);

    // TODOs
    Route::apiResource('todos', TodoController::class);

    // (remaining routes omitted) - end of company-scoped group
});

// End of API routes

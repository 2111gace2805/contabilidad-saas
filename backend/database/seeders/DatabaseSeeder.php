<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AccountingPeriod;
use App\Models\AccountingSegment;
use App\Models\AccountType;
use App\Models\BankAccount;
use App\Models\Company;
use App\Models\Customer;
use App\Models\DocumentType;
use App\Models\JournalEntryType;
use App\Models\JournalEntry;
use App\Models\InventoryItem;
use App\Models\PaymentMethod;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;


class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create SUPER ADMIN user (idempotent)
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'active' => true,
                'is_super_admin' => true,
            ]
        );

        // Create regular admin user (idempotent)
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'active' => true,
                'is_super_admin' => false,
            ]
        );

        // Create regular user (viewer) (idempotent)
        $viewer = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'User Viewer',
                'password' => Hash::make('password'),
                'active' => true,
                'is_super_admin' => false,
            ]
        );

        // Create test company (idempotent)
        $company = Company::firstOrCreate(
            ['rfc' => 'EDE123456789'],
            [
                'name' => 'Empresa Demo S.A. de C.V.',
                'nrc' => '123456-7',
                'nit' => '0614-123456-001-8',
                'taxpayer_type' => 'pequeño',
                'is_withholding_agent' => true,
                'address' => 'Av. Principal #123',
                'municipality' => 'San Salvador',
                'department' => 'San Salvador',
                'city' => 'San Salvador',
                'postal_code' => '01101',
                'country' => 'El Salvador',
                'phone' => '2222-2222',
                'business_activity' => 'Servicios de contabilidad',
                'fiscal_year_start' => 1,
                'currency' => 'USD',
                'active' => true,
            ]
        );

        // Associate users with company (idempotent)
        // Admin has full access
        \DB::table('company_users')->updateOrInsert(
            ['company_id' => $company->id, 'user_id' => $user->id],
            ['role' => 'admin', 'updated_at' => now(), 'created_at' => now()]
        );

        \DB::table('company_users')->updateOrInsert(
            ['company_id' => $company->id, 'user_id' => $viewer->id],
            ['role' => 'viewer', 'updated_at' => now(), 'created_at' => now()]
        );

        // Note: Super admin doesn't need company association - has access to all

        // Load global catalogs (DTE/MH catalogs, departments, municipalities, activities)
        $this->call(GlobalCatalogsSeeder::class);

        // Seed Account Types
        $this->seedAccountTypes($company);

        // Seed Accounting Segments
        $this->seedAccountingSegments($company);

        // Seed Chart of Accounts
        $this->seedAccounts($company);

        // Seed Accounting Periods
        $this->seedAccountingPeriods($company, $user);

        // Seed Catalogs
        $this->seedPaymentMethods($company);
        $this->seedDocumentTypes($company);

        // Seed Customers
        $this->seedCustomers($company);

        // Seed Suppliers
        $this->seedSuppliers($company);

        // Seed Inventory Items
        $this->seedInventoryItems($company);

        // Seed Bank Accounts
        $this->seedBankAccounts($company);

        // Seed Journal Entry Types
        $this->seedJournalEntryTypes($company);

        // Populate journal entry number sequences per company/type/year
        $this->call(JournalEntryNumberSequencesSeeder::class);
        // Populate invoice sequences per company/year (facturación / CxC)
        $this->call(InvoiceSequencesSeeder::class);
        // Seed customer types and economic activities
        $this->call(CustomerTypesSeeder::class);
        $this->call(EconomicActivitiesSeeder::class);
    }

    private function seedAccountTypes(Company $company): void
    {
        $types = [
            ['code' => '1', 'name' => 'Activo', 'nature' => 'deudora', 'affects_balance' => true, 'affects_results' => false, 'sort_order' => 1],
            ['code' => '2', 'name' => 'Pasivo', 'nature' => 'acreedora', 'affects_balance' => true, 'affects_results' => false, 'sort_order' => 2],
            ['code' => '3', 'name' => 'Capital', 'nature' => 'acreedora', 'affects_balance' => true, 'affects_results' => false, 'sort_order' => 3],
            ['code' => '4', 'name' => 'Ingresos', 'nature' => 'acreedora', 'affects_balance' => false, 'affects_results' => true, 'sort_order' => 4],
            ['code' => '5', 'name' => 'Costos', 'nature' => 'deudora', 'affects_balance' => false, 'affects_results' => true, 'sort_order' => 5],
            ['code' => '6', 'name' => 'Gastos', 'nature' => 'deudora', 'affects_balance' => false, 'affects_results' => true, 'sort_order' => 6],
        ];

        foreach ($types as $type) {
            AccountType::updateOrCreate(
                ['company_id' => $company->id, 'code' => $type['code']],
                array_merge(['company_id' => $company->id], $type)
            );
        }
    }

    private function seedAccountingSegments(Company $company): void
    {
        $segments = [
            ['code' => 'TIPO', 'name' => 'Tipo de Cuenta', 'level' => 1, 'digit_length' => 1, 'sequence' => 1],
            ['code' => 'CUENTA', 'name' => 'Cuenta', 'level' => 2, 'digit_length' => 4, 'sequence' => 2],
        ];

        foreach ($segments as $segment) {
            AccountingSegment::updateOrCreate(
                ['company_id' => $company->id, 'code' => $segment['code']],
                array_merge(['company_id' => $company->id], $segment)
            );
        }
    }

    private function seedAccounts(Company $company): void
    {
        $activo = AccountType::where('company_id', $company->id)->where('code', '1')->first();
        $pasivo = AccountType::where('company_id', $company->id)->where('code', '2')->first();
        $capital = AccountType::where('company_id', $company->id)->where('code', '3')->first();
        $ingresos = AccountType::where('company_id', $company->id)->where('code', '4')->first();
        $costos = AccountType::where('company_id', $company->id)->where('code', '5')->first();
        $gastos = AccountType::where('company_id', $company->id)->where('code', '6')->first();

        // ACTIVO
        $activo1 = Account::updateOrCreate(
            ['company_id' => $company->id, 'code' => '1'],
            ['name' => 'ACTIVO', 'account_type_id' => $activo->id, 'level' => 1, 'is_detail' => false]
        );
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '1101'], ['name' => 'Caja', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '1102'], ['name' => 'Bancos', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '1103'], ['name' => 'Cuentas por Cobrar Clientes', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '1104'], ['name' => 'IVA Crédito Fiscal', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '1105'], ['name' => 'Inventarios', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '1201'], ['name' => 'Propiedad Planta y Equipo', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => true]);

        // PASIVO
        $pasivo2 = Account::updateOrCreate(['company_id' => $company->id, 'code' => '2'], ['name' => 'PASIVO', 'account_type_id' => $pasivo->id, 'level' => 1, 'is_detail' => false]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '2101'], ['name' => 'Cuentas por Pagar Proveedores', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo2->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '2102'], ['name' => 'IVA Débito Fiscal', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo2->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '2103'], ['name' => 'Retenciones por Pagar', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo2->id, 'level' => 2, 'is_detail' => true]);

        // CAPITAL
        $capital3 = Account::updateOrCreate(['company_id' => $company->id, 'code' => '3'], ['name' => 'CAPITAL', 'account_type_id' => $capital->id, 'level' => 1, 'is_detail' => false]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '3101'], ['name' => 'Capital Social', 'account_type_id' => $capital->id, 'parent_id' => $capital3->id, 'level' => 2, 'is_detail' => true]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '3102'], ['name' => 'Utilidades Retenidas', 'account_type_id' => $capital->id, 'parent_id' => $capital3->id, 'level' => 2, 'is_detail' => true]);

        // INGRESOS
        $ingresos4 = Account::updateOrCreate(['company_id' => $company->id, 'code' => '4'], ['name' => 'INGRESOS', 'account_type_id' => $ingresos->id, 'level' => 1, 'is_detail' => false]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '4101'], ['name' => 'Ventas', 'account_type_id' => $ingresos->id, 'parent_id' => $ingresos4->id, 'level' => 2, 'is_detail' => true]);

        // COSTOS
        $costos5 = Account::updateOrCreate(['company_id' => $company->id, 'code' => '5'], ['name' => 'COSTOS', 'account_type_id' => $costos->id, 'level' => 1, 'is_detail' => false]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '5101'], ['name' => 'Costo de Ventas', 'account_type_id' => $costos->id, 'parent_id' => $costos5->id, 'level' => 2, 'is_detail' => true]);

        // GASTOS
        $gastos6 = Account::updateOrCreate(['company_id' => $company->id, 'code' => '6'], ['name' => 'GASTOS', 'account_type_id' => $gastos->id, 'level' => 1, 'is_detail' => false]);
        Account::updateOrCreate(['company_id' => $company->id, 'code' => '6101'], ['name' => 'Gastos de Administración', 'account_type_id' => $gastos->id, 'parent_id' => $gastos6->id, 'level' => 2, 'is_detail' => true]);
    }

    private function seedAccountingPeriods(Company $company, User $user): void
    {
        $year = now()->year;
        
        // Create annual period (idempotent)
        AccountingPeriod::updateOrCreate(
            ['company_id' => $company->id, 'fiscal_year' => $year, 'period_number' => 0],
            [
                'period_type' => 'annual',
                'start_date' => "{$year}-01-01",
                'end_date' => "{$year}-12-31",
                'status' => 'open',
                'month' => null,
                'year' => $year,
                'period_name' => 'Anual ' . $year,
            ]
        );

        // Create monthly periods for current year (idempotent) and include month/period_name for UI
        $monthNames = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        for ($month = 1; $month <= 12; $month++) {
            $startDate = date('Y-m-01', strtotime("{$year}-{$month}-01"));
            $endDate = date('Y-m-t', strtotime("{$year}-{$month}-01"));

            AccountingPeriod::updateOrCreate(
                ['company_id' => $company->id, 'fiscal_year' => $year, 'period_number' => $month],
                [
                    'period_type' => 'monthly',
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'open',
                    'month' => $month,
                    'year' => $year,
                    'period_name' => $monthNames[$month] . ' ' . $year,
                ]
            );
        }
    }

    private function seedPaymentMethods(Company $company): void
    {
        $methods = [
            ['code' => 'EFECTIVO', 'name' => 'Efectivo'],
            ['code' => 'CHEQUE', 'name' => 'Cheque'],
            ['code' => 'TRANSFERENCIA', 'name' => 'Transferencia Bancaria'],
            ['code' => 'TARJETA', 'name' => 'Tarjeta de Crédito/Débito'],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(
                ['company_id' => $company->id, 'code' => $method['code']],
                array_merge(['company_id' => $company->id], $method)
            );
        }
    }

    private function seedDocumentTypes(Company $company): void
    {
        $types = [
            ['code' => 'FACTURA', 'name' => 'Factura'],
            ['code' => 'CCF', 'name' => 'Comprobante de Crédito Fiscal'],
            ['code' => 'RECIBO', 'name' => 'Recibo'],
            ['code' => 'NOTA_CREDITO', 'name' => 'Nota de Crédito'],
            ['code' => 'NOTA_DEBITO', 'name' => 'Nota de Débito'],
        ];

        foreach ($types as $type) {
            DocumentType::updateOrCreate(
                ['company_id' => $company->id, 'code' => $type['code']],
                array_merge(['company_id' => $company->id], $type)
            );
        }
    }

    private function seedCustomers(Company $company): void
    {
        $customers = [
            ['code' => 'CLI001', 'name' => 'Cliente Demo 1', 'rfc' => 'CLI001-123456', 'email' => 'cliente1@example.com', 'credit_limit' => 10000, 'credit_days' => 30],
            ['code' => 'CLI002', 'name' => 'Cliente Demo 2', 'rfc' => 'CLI002-654321', 'email' => 'cliente2@example.com', 'credit_limit' => 5000, 'credit_days' => 15],
            ['code' => 'CLI003', 'name' => 'Cliente Demo 3', 'rfc' => 'CLI003-789012', 'email' => 'cliente3@example.com', 'credit_limit' => 15000, 'credit_days' => 45],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['company_id' => $company->id, 'code' => $customer['code']],
                array_merge(['company_id' => $company->id], $customer)
            );
        }
    }

    private function seedSuppliers(Company $company): void
    {
        $suppliers = [
            ['code' => 'PROV001', 'name' => 'Proveedor Demo 1', 'rfc' => 'PROV001-123456', 'email' => 'proveedor1@example.com', 'credit_days' => 30],
            ['code' => 'PROV002', 'name' => 'Proveedor Demo 2', 'rfc' => 'PROV002-654321', 'email' => 'proveedor2@example.com', 'credit_days' => 15],
            ['code' => 'PROV003', 'name' => 'Proveedor Demo 3', 'rfc' => 'PROV003-789012', 'email' => 'proveedor3@example.com', 'credit_days' => 45],
        ];

        foreach ($suppliers as $supplier) {
            Supplier::updateOrCreate(
                ['company_id' => $company->id, 'code' => $supplier['code']],
                array_merge(['company_id' => $company->id], $supplier)
            );
        }
    }

    private function seedInventoryItems(Company $company): void
    {
        $inventoryAccount = Account::where('company_id', $company->id)->where('code', '1105')->first();
        $cogsAccount = Account::where('company_id', $company->id)->where('code', '5101')->first();

        $items = [
            ['item_code' => 'PROD001', 'name' => 'Producto Demo 1', 'unit_of_measure' => 'Unidad', 'cost_method' => 'average', 'current_quantity' => 100, 'average_cost' => 50],
            ['item_code' => 'PROD002', 'name' => 'Producto Demo 2', 'unit_of_measure' => 'Caja', 'cost_method' => 'average', 'current_quantity' => 50, 'average_cost' => 100],
            ['item_code' => 'SERV001', 'name' => 'Servicio Demo 1', 'unit_of_measure' => 'Hora', 'cost_method' => 'average', 'current_quantity' => 0, 'average_cost' => 75],
        ];

        foreach ($items as $item) {
            InventoryItem::updateOrCreate(
                ['company_id' => $company->id, 'item_code' => $item['item_code']],
                array_merge([
                    'company_id' => $company->id,
                    'inventory_account_id' => $inventoryAccount?->id,
                    'cogs_account_id' => $cogsAccount?->id,
                ], $item)
            );
        }
    }

    private function seedBankAccounts(Company $company): void
    {
        $bankAccount = Account::where('company_id', $company->id)->where('code', '1102')->first();

        $accounts = [
            ['bank_name' => 'Banco Demo', 'account_number' => '1234567890', 'account_type' => 'checking', 'initial_balance' => 50000, 'current_balance' => 50000],
            ['bank_name' => 'Banco Ahorro', 'account_number' => '0987654321', 'account_type' => 'savings', 'initial_balance' => 25000, 'current_balance' => 25000],
        ];

        foreach ($accounts as $account) {
            BankAccount::updateOrCreate(
                ['company_id' => $company->id, 'account_number' => $account['account_number']],
                array_merge([
                    'company_id' => $company->id,
                    'account_id' => $bankAccount?->id,
                ], $account)
            );
        }
    }

    private function seedJournalEntryTypes(Company $company): void
    {
        $types = [
            ['code' => 'PD', 'name' => 'Partida de Diario', 'active' => true],
            ['code' => 'PI', 'name' => 'Partida de Ingreso', 'active' => true],
            ['code' => 'PE', 'name' => 'Partida de Egreso', 'active' => true],
            ['code' => 'PA', 'name' => 'Partida de Ajuste', 'active' => true],
            ['code' => 'PB', 'name' => 'Partida de Banco', 'active' => true],
            ['code' => 'PC', 'name' => 'Partida de Caja', 'active' => true],
            ['code' => 'PCIERRE', 'name' => 'Partida de Cierre', 'active' => true],
            ['code' => 'PX', 'name' => 'Partida de Exportación', 'active' => true],
        ];

        foreach ($types as $type) {
            JournalEntryType::updateOrCreate(
                ['company_id' => $company->id, 'code' => $type['code']],
                array_merge(['company_id' => $company->id], $type)
            );
        }

        // Ensure any entry types already used in journal entries are present
        $usedTypes = JournalEntry::where('company_id', $company->id)
            ->whereNotNull('entry_type')
            ->pluck('entry_type')
            ->map(fn($c) => strtoupper($c))
            ->unique()
            ->toArray();

        $existing = JournalEntryType::where('company_id', $company->id)->pluck('code')->map(fn($c)=>strtoupper($c))->toArray();

        foreach ($usedTypes as $code) {
            if (!$code) continue;
            if (!in_array($code, $existing)) {
                JournalEntryType::create([
                    'company_id' => $company->id,
                    'code' => strtoupper($code),
                    'name' => "Tipo ({$code})",
                    'active' => true,
                ]);
            }
        }
    }
}


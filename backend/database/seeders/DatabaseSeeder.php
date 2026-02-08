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
        // Create SUPER ADMIN user
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => Hash::make('password'),
            'active' => true,
            'is_super_admin' => true,
        ]);

        // Create regular admin user
        $user = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'active' => true,
            'is_super_admin' => false,
        ]);

        // Create regular user (viewer)
        $viewer = User::create([
            'name' => 'User Viewer',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'active' => true,
            'is_super_admin' => false,
        ]);

        // Create test company
        $company = Company::create([
            'name' => 'Empresa Demo S.A. de C.V.',
            'rfc' => 'EDE123456789',
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
        ]);

        // Associate users with company
        // Admin has full access
        \DB::table('company_users')->insert([
            ['company_id' => $company->id, 'user_id' => $user->id, 'role' => 'admin', 'created_at' => now(), 'updated_at' => now()],
            ['company_id' => $company->id, 'user_id' => $viewer->id, 'role' => 'viewer', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Note: Super admin doesn't need company association - has access to all

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
            AccountType::create(array_merge(['company_id' => $company->id], $type));
        }
    }

    private function seedAccountingSegments(Company $company): void
    {
        $segments = [
            ['code' => 'TIPO', 'name' => 'Tipo de Cuenta', 'level' => 1, 'digit_length' => 1, 'sequence' => 1],
            ['code' => 'GRUPO', 'name' => 'Grupo', 'level' => 2, 'digit_length' => 2, 'sequence' => 2],
            ['code' => 'CUENTA', 'name' => 'Cuenta Mayor', 'level' => 3, 'digit_length' => 2, 'sequence' => 3],
            ['code' => 'SUBCUENTA', 'name' => 'Subcuenta', 'level' => 4, 'digit_length' => 2, 'sequence' => 4],
        ];

        foreach ($segments as $segment) {
            AccountingSegment::create(array_merge(['company_id' => $company->id], $segment));
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
        $activo1 = Account::create(['company_id' => $company->id, 'code' => '1', 'name' => 'ACTIVO', 'account_type_id' => $activo->id, 'level' => 1, 'is_detail' => false]);
        $activo11 = Account::create(['company_id' => $company->id, 'code' => '11', 'name' => 'ACTIVO CORRIENTE', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => false]);

        Account::create(['company_id' => $company->id, 'code' => '1101', 'name' => 'Caja', 'account_type_id' => $activo->id, 'parent_id' => $activo11->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '1102', 'name' => 'Bancos', 'account_type_id' => $activo->id, 'parent_id' => $activo11->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '1103', 'name' => 'Cuentas por Cobrar Clientes', 'account_type_id' => $activo->id, 'parent_id' => $activo11->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '1104', 'name' => 'IVA Crédito Fiscal', 'account_type_id' => $activo->id, 'parent_id' => $activo11->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '1105', 'name' => 'Inventarios', 'account_type_id' => $activo->id, 'parent_id' => $activo11->id, 'level' => 3, 'is_detail' => true]);

        $activo12 = Account::create(['company_id' => $company->id, 'code' => '12', 'name' => 'ACTIVO NO CORRIENTE', 'account_type_id' => $activo->id, 'parent_id' => $activo1->id, 'level' => 2, 'is_detail' => false]);
        Account::create(['company_id' => $company->id, 'code' => '1201', 'name' => 'Propiedad Planta y Equipo', 'account_type_id' => $activo->id, 'parent_id' => $activo12->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '1202', 'name' => 'Depreciación Acumulada', 'account_type_id' => $activo->id, 'parent_id' => $activo12->id, 'level' => 3, 'is_detail' => true]);

        // PASIVO
        $pasivo2 = Account::create(['company_id' => $company->id, 'code' => '2', 'name' => 'PASIVO', 'account_type_id' => $pasivo->id, 'level' => 1, 'is_detail' => false]);
        $pasivo21 = Account::create(['company_id' => $company->id, 'code' => '21', 'name' => 'PASIVO CORRIENTE', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo2->id, 'level' => 2, 'is_detail' => false]);

        Account::create(['company_id' => $company->id, 'code' => '2101', 'name' => 'Cuentas por Pagar Proveedores', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo21->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '2102', 'name' => 'IVA Débito Fiscal', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo21->id, 'level' => 3, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '2103', 'name' => 'Retenciones por Pagar', 'account_type_id' => $pasivo->id, 'parent_id' => $pasivo21->id, 'level' => 3, 'is_detail' => true]);

        // CAPITAL
        $capital3 = Account::create(['company_id' => $company->id, 'code' => '3', 'name' => 'CAPITAL', 'account_type_id' => $capital->id, 'level' => 1, 'is_detail' => false]);
        Account::create(['company_id' => $company->id, 'code' => '3101', 'name' => 'Capital Social', 'account_type_id' => $capital->id, 'parent_id' => $capital3->id, 'level' => 2, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '3102', 'name' => 'Utilidades Retenidas', 'account_type_id' => $capital->id, 'parent_id' => $capital3->id, 'level' => 2, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '3103', 'name' => 'Utilidad del Ejercicio', 'account_type_id' => $capital->id, 'parent_id' => $capital3->id, 'level' => 2, 'is_detail' => true]);

        // INGRESOS
        $ingresos4 = Account::create(['company_id' => $company->id, 'code' => '4', 'name' => 'INGRESOS', 'account_type_id' => $ingresos->id, 'level' => 1, 'is_detail' => false]);
        Account::create(['company_id' => $company->id, 'code' => '4101', 'name' => 'Ventas', 'account_type_id' => $ingresos->id, 'parent_id' => $ingresos4->id, 'level' => 2, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '4102', 'name' => 'Ingresos por Servicios', 'account_type_id' => $ingresos->id, 'parent_id' => $ingresos4->id, 'level' => 2, 'is_detail' => true]);

        // COSTOS
        $costos5 = Account::create(['company_id' => $company->id, 'code' => '5', 'name' => 'COSTOS', 'account_type_id' => $costos->id, 'level' => 1, 'is_detail' => false]);
        Account::create(['company_id' => $company->id, 'code' => '5101', 'name' => 'Costo de Ventas', 'account_type_id' => $costos->id, 'parent_id' => $costos5->id, 'level' => 2, 'is_detail' => true]);

        // GASTOS
        $gastos6 = Account::create(['company_id' => $company->id, 'code' => '6', 'name' => 'GASTOS', 'account_type_id' => $gastos->id, 'level' => 1, 'is_detail' => false]);
        Account::create(['company_id' => $company->id, 'code' => '6101', 'name' => 'Gastos de Administración', 'account_type_id' => $gastos->id, 'parent_id' => $gastos6->id, 'level' => 2, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '6102', 'name' => 'Gastos de Venta', 'account_type_id' => $gastos->id, 'parent_id' => $gastos6->id, 'level' => 2, 'is_detail' => true]);
        Account::create(['company_id' => $company->id, 'code' => '6103', 'name' => 'Gastos Financieros', 'account_type_id' => $gastos->id, 'parent_id' => $gastos6->id, 'level' => 2, 'is_detail' => true]);
    }

    private function seedAccountingPeriods(Company $company, User $user): void
    {
        $year = now()->year;
        
        // Create annual period
        AccountingPeriod::create([
            'company_id' => $company->id,
            'period_type' => 'annual',
            'fiscal_year' => $year,
            'period_number' => 0,
            'start_date' => "{$year}-01-01",
            'end_date' => "{$year}-12-31",
            'status' => 'open',
        ]);

        // Create monthly periods for current year
        for ($month = 1; $month <= 12; $month++) {
            $startDate = date('Y-m-01', strtotime("{$year}-{$month}-01"));
            $endDate = date('Y-m-t', strtotime("{$year}-{$month}-01"));
            
            AccountingPeriod::create([
                'company_id' => $company->id,
                'period_type' => 'monthly',
                'fiscal_year' => $year,
                'period_number' => $month,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'open',
            ]);
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
            PaymentMethod::create(array_merge(['company_id' => $company->id], $method));
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
            DocumentType::create(array_merge(['company_id' => $company->id], $type));
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
            Customer::create(array_merge(['company_id' => $company->id], $customer));
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
            Supplier::create(array_merge(['company_id' => $company->id], $supplier));
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
            InventoryItem::create(array_merge([
                'company_id' => $company->id,
                'inventory_account_id' => $inventoryAccount?->id,
                'cogs_account_id' => $cogsAccount?->id,
            ], $item));
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
            BankAccount::create(array_merge([
                'company_id' => $company->id,
                'account_id' => $bankAccount?->id,
            ], $account));
        }
    }
}


<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\AccountType;
use App\Models\Company;
use Illuminate\Database\Seeder;

class BasicAccountingTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->get();

        foreach ($companies as $company) {
            $types = $this->ensureAccountTypes((int) $company->id);
            $this->seedTemplateAccounts((int) $company->id, $types);
        }
    }

    private function ensureAccountTypes(int $companyId): array
    {
        $catalog = [
            '1' => ['name' => 'Activo', 'nature' => 'deudora', 'affects_balance' => true, 'affects_results' => false, 'sort_order' => 1],
            '2' => ['name' => 'Pasivo', 'nature' => 'acreedora', 'affects_balance' => true, 'affects_results' => false, 'sort_order' => 2],
            '3' => ['name' => 'Capital', 'nature' => 'acreedora', 'affects_balance' => true, 'affects_results' => false, 'sort_order' => 3],
            '4' => ['name' => 'Ingresos', 'nature' => 'acreedora', 'affects_balance' => false, 'affects_results' => true, 'sort_order' => 4],
            '5' => ['name' => 'Costos', 'nature' => 'deudora', 'affects_balance' => false, 'affects_results' => true, 'sort_order' => 5],
            '6' => ['name' => 'Gastos', 'nature' => 'deudora', 'affects_balance' => false, 'affects_results' => true, 'sort_order' => 6],
        ];

        $map = [];
        foreach ($catalog as $code => $data) {
            $type = AccountType::query()->updateOrCreate(
                ['company_id' => $companyId, 'code' => $code],
                array_merge(['company_id' => $companyId, 'code' => $code], $data)
            );
            $map[$code] = $type;
        }

        return $map;
    }

    private function seedTemplateAccounts(int $companyId, array $types): void
    {
        $accounts = [
            ['code' => '1', 'name' => 'ACTIVO', 'type' => '1', 'parent' => null, 'level' => 1, 'is_detail' => false],
            ['code' => '1101', 'name' => 'Caja', 'type' => '1', 'parent' => '1', 'level' => 2, 'is_detail' => true],
            ['code' => '1102', 'name' => 'Bancos', 'type' => '1', 'parent' => '1', 'level' => 2, 'is_detail' => true],
            ['code' => '1103', 'name' => 'Cuentas por Cobrar Clientes', 'type' => '1', 'parent' => '1', 'level' => 2, 'is_detail' => true],
            ['code' => '1104', 'name' => 'IVA Crédito Fiscal', 'type' => '1', 'parent' => '1', 'level' => 2, 'is_detail' => true],
            ['code' => '1105', 'name' => 'Inventarios', 'type' => '1', 'parent' => '1', 'level' => 2, 'is_detail' => true],

            ['code' => '2', 'name' => 'PASIVO', 'type' => '2', 'parent' => null, 'level' => 1, 'is_detail' => false],
            ['code' => '2101', 'name' => 'Cuentas por Pagar Proveedores', 'type' => '2', 'parent' => '2', 'level' => 2, 'is_detail' => true],
            ['code' => '2102', 'name' => 'IVA Débito Fiscal', 'type' => '2', 'parent' => '2', 'level' => 2, 'is_detail' => true],
            ['code' => '2103', 'name' => 'Retenciones por Pagar', 'type' => '2', 'parent' => '2', 'level' => 2, 'is_detail' => true],

            ['code' => '3', 'name' => 'CAPITAL', 'type' => '3', 'parent' => null, 'level' => 1, 'is_detail' => false],
            ['code' => '3101', 'name' => 'Capital Social', 'type' => '3', 'parent' => '3', 'level' => 2, 'is_detail' => true],

            ['code' => '4', 'name' => 'INGRESOS', 'type' => '4', 'parent' => null, 'level' => 1, 'is_detail' => false],
            ['code' => '4101', 'name' => 'Ventas Gravadas', 'type' => '4', 'parent' => '4', 'level' => 2, 'is_detail' => true],
            ['code' => '4102', 'name' => 'Servicios Gravados', 'type' => '4', 'parent' => '4', 'level' => 2, 'is_detail' => true],

            ['code' => '5', 'name' => 'COSTOS', 'type' => '5', 'parent' => null, 'level' => 1, 'is_detail' => false],
            ['code' => '5101', 'name' => 'Costo de Ventas', 'type' => '5', 'parent' => '5', 'level' => 2, 'is_detail' => true],

            ['code' => '6', 'name' => 'GASTOS', 'type' => '6', 'parent' => null, 'level' => 1, 'is_detail' => false],
            ['code' => '6101', 'name' => 'Gastos Administrativos', 'type' => '6', 'parent' => '6', 'level' => 2, 'is_detail' => true],
        ];

        $codeToId = Account::query()
            ->where('company_id', $companyId)
            ->pluck('id', 'code')
            ->toArray();

        foreach ($accounts as $row) {
            $typeId = $types[$row['type']]->id;
            $parentId = $row['parent'] ? ($codeToId[$row['parent']] ?? null) : null;

            $account = Account::query()->updateOrCreate(
                ['company_id' => $companyId, 'code' => $row['code']],
                [
                    'name' => $row['name'],
                    'account_type_id' => $typeId,
                    'parent_id' => $parentId,
                    'level' => $row['level'],
                    'is_detail' => $row['is_detail'],
                    'active' => true,
                ]
            );

            $codeToId[$row['code']] = $account->id;
        }
    }
}

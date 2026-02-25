<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Company;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class JournalEntriesDemoSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();
        if ($companies->isEmpty()) {
            return;
        }

        foreach ($companies as $company) {
            $this->seedCompanyEntries($company);
        }
    }

    private function seedCompanyEntries(Company $company): void
    {
        $createdBy = User::where('is_super_admin', false)->value('id')
            ?? User::query()->value('id');

        if (!$createdBy) {
            return;
        }

        $accounts = Account::where('company_id', $company->id)
            ->whereIn('code', ['1101', '1102', '1103', '1105', '1201', '2101', '2102', '3101', '3102', '4101', '5101', '6101'])
            ->pluck('id', 'code');

        $requiredCodes = ['1101', '1102', '1103', '1105', '1201', '2101', '2102', '3101', '3102', '4101', '5101', '6101'];
        foreach ($requiredCodes as $code) {
            if (!isset($accounts[$code])) {
                return;
            }
        }

        $year = Carbon::now()->year;
        $baseDate = Carbon::create($year, 2, 15)->format('Y-m-d');
        $closingDate = Carbon::create($year, 12, 31)->format('Y-m-d');

        $entries = [
            [
                'entry_number' => 'PD-9000001',
                'entry_type' => 'PD',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Aporte inicial de capital en banco',
                'lines' => [
                    ['account' => '1102', 'debit' => 25000.00, 'credit' => 0.00, 'description' => 'Ingreso a banco'],
                    ['account' => '3101', 'debit' => 0.00, 'credit' => 25000.00, 'description' => 'Capital social'],
                ],
            ],
            [
                'entry_number' => 'PD-9000002',
                'entry_type' => 'PD',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Compra de inventario al crédito',
                'lines' => [
                    ['account' => '1105', 'debit' => 3200.00, 'credit' => 0.00, 'description' => 'Ingreso de inventario'],
                    ['account' => '2101', 'debit' => 0.00, 'credit' => 3200.00, 'description' => 'Cuenta por pagar proveedor'],
                ],
            ],
            [
                'entry_number' => 'PI-9000001',
                'entry_type' => 'PI',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Venta al contado con IVA débito fiscal',
                'lines' => [
                    ['account' => '1101', 'debit' => 1130.00, 'credit' => 0.00, 'description' => 'Ingreso en caja'],
                    ['account' => '4101', 'debit' => 0.00, 'credit' => 1000.00, 'description' => 'Ingreso por ventas'],
                    ['account' => '2102', 'debit' => 0.00, 'credit' => 130.00, 'description' => 'IVA débito fiscal'],
                ],
            ],
            [
                'entry_number' => 'PI-9000002',
                'entry_type' => 'PI',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Cobro de cuenta por cobrar de cliente',
                'lines' => [
                    ['account' => '1102', 'debit' => 2500.00, 'credit' => 0.00, 'description' => 'Ingreso en banco'],
                    ['account' => '1103', 'debit' => 0.00, 'credit' => 2500.00, 'description' => 'Disminución de CxC'],
                ],
            ],
            [
                'entry_number' => 'PE-9000001',
                'entry_type' => 'PE',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Pago parcial a proveedor',
                'lines' => [
                    ['account' => '2101', 'debit' => 1500.00, 'credit' => 0.00, 'description' => 'Disminución de CxP'],
                    ['account' => '1102', 'debit' => 0.00, 'credit' => 1500.00, 'description' => 'Salida de banco'],
                ],
            ],
            [
                'entry_number' => 'PE-9000002',
                'entry_type' => 'PE',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Pago de servicios administrativos',
                'lines' => [
                    ['account' => '6101', 'debit' => 850.00, 'credit' => 0.00, 'description' => 'Gasto administrativo'],
                    ['account' => '1101', 'debit' => 0.00, 'credit' => 850.00, 'description' => 'Salida de caja'],
                ],
            ],
            [
                'entry_number' => 'PA-9000001',
                'entry_type' => 'PA',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Ajuste por depreciación del periodo',
                'lines' => [
                    ['account' => '6101', 'debit' => 300.00, 'credit' => 0.00, 'description' => 'Reconocimiento de gasto'],
                    ['account' => '1201', 'debit' => 0.00, 'credit' => 300.00, 'description' => 'Ajuste de activo fijo'],
                ],
            ],
            [
                'entry_number' => 'PA-9000002',
                'entry_type' => 'PA',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Ajuste por consumo de inventario',
                'lines' => [
                    ['account' => '5101', 'debit' => 450.00, 'credit' => 0.00, 'description' => 'Costo de ventas'],
                    ['account' => '1105', 'debit' => 0.00, 'credit' => 450.00, 'description' => 'Disminución inventario'],
                ],
            ],
            [
                'entry_number' => 'PB-9000001',
                'entry_type' => 'PB',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Traslado de efectivo de caja a banco',
                'lines' => [
                    ['account' => '1102', 'debit' => 2000.00, 'credit' => 0.00, 'description' => 'Ingreso en banco'],
                    ['account' => '1101', 'debit' => 0.00, 'credit' => 2000.00, 'description' => 'Salida de caja'],
                ],
            ],
            [
                'entry_number' => 'PB-9000002',
                'entry_type' => 'PB',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Retiro de banco para operación diaria',
                'lines' => [
                    ['account' => '1101', 'debit' => 700.00, 'credit' => 0.00, 'description' => 'Ingreso en caja'],
                    ['account' => '1102', 'debit' => 0.00, 'credit' => 700.00, 'description' => 'Salida de banco'],
                ],
            ],
            [
                'entry_number' => 'PC-9000001',
                'entry_type' => 'PC',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Constitución de fondo fijo de caja chica',
                'lines' => [
                    ['account' => '1101', 'debit' => 500.00, 'credit' => 0.00, 'description' => 'Fondo de caja chica'],
                    ['account' => '1102', 'debit' => 0.00, 'credit' => 500.00, 'description' => 'Salida de banco'],
                ],
            ],
            [
                'entry_number' => 'PC-9000002',
                'entry_type' => 'PC',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Reposición de caja chica por gastos menores',
                'lines' => [
                    ['account' => '6101', 'debit' => 120.00, 'credit' => 0.00, 'description' => 'Gasto menor'],
                    ['account' => '1101', 'debit' => 0.00, 'credit' => 120.00, 'description' => 'Salida de caja'],
                ],
            ],
            [
                'entry_number' => 'PCIERRE-9000001',
                'entry_type' => 'PCIERRE',
                'type_number' => 9000001,
                'entry_date' => $closingDate,
                'description' => 'Cierre de cuentas de ingresos del ejercicio',
                'lines' => [
                    ['account' => '4101', 'debit' => 5000.00, 'credit' => 0.00, 'description' => 'Cancelación de ingresos'],
                    ['account' => '3102', 'debit' => 0.00, 'credit' => 5000.00, 'description' => 'Traslado a utilidades retenidas'],
                ],
            ],
            [
                'entry_number' => 'PCIERRE-9000002',
                'entry_type' => 'PCIERRE',
                'type_number' => 9000002,
                'entry_date' => $closingDate,
                'description' => 'Cierre de costos y gastos del ejercicio',
                'lines' => [
                    ['account' => '3102', 'debit' => 2200.00, 'credit' => 0.00, 'description' => 'Reconocimiento de resultado del periodo'],
                    ['account' => '5101', 'debit' => 0.00, 'credit' => 1200.00, 'description' => 'Cancelación costos'],
                    ['account' => '6101', 'debit' => 0.00, 'credit' => 1000.00, 'description' => 'Cancelación gastos'],
                ],
            ],
            [
                'entry_number' => 'PX-9000001',
                'entry_type' => 'PX',
                'type_number' => 9000001,
                'entry_date' => $baseDate,
                'description' => 'Factura de exportación a crédito',
                'lines' => [
                    ['account' => '1103', 'debit' => 8000.00, 'credit' => 0.00, 'description' => 'Cuenta por cobrar exportación'],
                    ['account' => '4101', 'debit' => 0.00, 'credit' => 8000.00, 'description' => 'Ingreso por exportación'],
                ],
            ],
            [
                'entry_number' => 'PX-9000002',
                'entry_type' => 'PX',
                'type_number' => 9000002,
                'entry_date' => $baseDate,
                'description' => 'Cobro parcial de exportación',
                'lines' => [
                    ['account' => '1102', 'debit' => 4000.00, 'credit' => 0.00, 'description' => 'Ingreso en banco'],
                    ['account' => '1103', 'debit' => 0.00, 'credit' => 4000.00, 'description' => 'Disminución CxC exportación'],
                ],
            ],
        ];

        foreach ($entries as $entryData) {
            $entry = JournalEntry::updateOrCreate(
                [
                    'company_id' => $company->id,
                    'entry_number' => $entryData['entry_number'],
                ],
                [
                    'entry_date' => $entryData['entry_date'],
                    'entry_type' => $entryData['entry_type'],
                    'type_number' => $entryData['type_number'],
                    'description' => $entryData['description'],
                    'status' => 'posted',
                    'created_by' => $createdBy,
                ]
            );

            JournalEntryLine::where('journal_entry_id', $entry->id)->delete();

            $lineNumber = 1;
            foreach ($entryData['lines'] as $line) {
                JournalEntryLine::create([
                    'journal_entry_id' => $entry->id,
                    'account_id' => $accounts[$line['account']],
                    'debit' => $line['debit'],
                    'credit' => $line['credit'],
                    'description' => $line['description'],
                    'line_number' => $lineNumber++,
                ]);
            }
        }
    }
}

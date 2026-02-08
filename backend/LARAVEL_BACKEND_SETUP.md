# Laravel Backend Setup - Multi-Company Accounting System

This document describes the complete Laravel backend implementation for the multi-company accounting system.

## Overview

The backend has been fully implemented with:
- ✅ **33 database migrations** covering all tables from the MySQL schema
- ✅ **19 Eloquent models** with proper relationships
- ✅ **Comprehensive seeders** with test data
- ✅ UUID support for all primary keys
- ✅ Multi-company architecture with proper relationships

## Database Schema

### Core Tables (33 total)

#### 1. Multi-Company Foundation
- `companies` - Company information
- `users` - User accounts with UUID support
- `company_users` - Many-to-many relationship between companies and users
- `balance_signers` - Balance sheet signatories

#### 2. Chart of Accounts
- `account_types` - Types of accounts (Asset, Liability, Capital, Income, Cost, Expense)
- `accounting_segments` - Flexible account structure segments
- `accounts` - Chart of accounts with hierarchical structure

#### 3. Accounting Periods
- `accounting_periods` - Fiscal periods (monthly/annual)
- `journal_entry_prefixes` - Prefixes for journal entries by module
- `journal_entry_sequences` - Sequential numbering per period

#### 4. Journal Entries (Pólizas)
- `journal_entries` - Journal entry headers
- `journal_entry_lines` - Journal entry line items

#### 5. Accounts Receivable
- `customers` - Customer master data
- `invoices` - Customer invoices
- `customer_payments` - Payments from customers
- `payment_applications` - Application of payments to invoices

#### 6. Accounts Payable
- `suppliers` - Supplier master data
- `bills` - Supplier bills
- `supplier_payments` - Payments to suppliers
- `bill_payment_applications` - Application of payments to bills

#### 7. Fixed Assets
- `fixed_assets` - Fixed asset register
- `depreciation_schedules` - Depreciation calculations

#### 8. Inventory
- `inventory_items` - Item master data
- `inventory_transactions` - Inventory movements

#### 9. Treasury
- `bank_accounts` - Bank account register
- `bank_transactions` - Bank transactions

#### 10. Configuration
- `accounting_configuration` - Default accounts configuration
- `tax_configuration` - Tax setup

#### 11. Catalogs
- `document_types` - Document type catalog
- `payment_methods` - Payment method catalog
- `branches` - Branch locations
- `units_of_measure` - UOM catalog
- `warehouses` - Warehouse locations
- `company_modules` - Active modules per company

## Models Created

All models include:
- UUID primary keys using `HasUuids` trait
- Proper relationships (belongsTo, hasMany, belongsToMany)
- Type casting for dates, decimals, and booleans
- Mass assignment protection

### Main Models:
1. `Company` - Multi-company support
2. `User` - Authentication with company relationships
3. `AccountType` - Account classification
4. `AccountingSegment` - Flexible chart structure
5. `Account` - Chart of accounts
6. `AccountingPeriod` - Period management
7. `JournalEntry` - Journal entries
8. `JournalEntryLine` - Entry details
9. `Customer` - Customer management
10. `Supplier` - Supplier management
11. `Invoice` - Accounts receivable
12. `Bill` - Accounts payable
13. `BankAccount` - Bank accounts
14. `InventoryItem` - Inventory items
15. `PaymentMethod` - Payment methods
16. `DocumentType` - Document types
17. `CustomerPayment` - Customer payments
18. `SupplierPayment` - Supplier payments
19. Additional transaction models

## Database Seeder

The `DatabaseSeeder` creates a complete test environment:

### Test User
- **Email:** admin@example.com
- **Password:** password
- **Role:** Admin

### Test Company
- **Name:** Empresa Demo S.A. de C.V.
- **Country:** El Salvador
- **Currency:** USD
- **RFC/NRC/NIT:** Sample tax IDs

### Seeded Data Includes:

#### Account Types (6)
- Activo (Asset)
- Pasivo (Liability)
- Capital (Equity)
- Ingresos (Income)
- Costos (Costs)
- Gastos (Expenses)

#### Accounting Segments (4)
- TIPO - Account type
- GRUPO - Group
- CUENTA - Main account
- SUBCUENTA - Sub-account

#### Chart of Accounts (26 accounts)
Complete hierarchical structure:
- **Activo Corriente:** Caja, Bancos, Cuentas por Cobrar, IVA Crédito, Inventarios
- **Activo No Corriente:** Propiedad Planta y Equipo, Depreciación Acumulada
- **Pasivo Corriente:** Cuentas por Pagar, IVA Débito, Retenciones
- **Capital:** Capital Social, Utilidades Retenidas, Utilidad del Ejercicio
- **Ingresos:** Ventas, Ingresos por Servicios
- **Costos:** Costo de Ventas
- **Gastos:** Gastos de Administración, Venta, Financieros

#### Accounting Periods
- Annual period for current year
- 12 monthly periods for current year
- All periods open by default

#### Catalogs
- **Payment Methods:** Efectivo, Cheque, Transferencia, Tarjeta
- **Document Types:** Factura, CCF, Recibo, Nota de Crédito/Débito

#### Master Data
- **Customers:** 3 sample customers with credit limits
- **Suppliers:** 3 sample suppliers
- **Inventory Items:** 3 sample products/services
- **Bank Accounts:** 2 sample bank accounts

## Running Migrations

### Prerequisites
Ensure you have a MySQL database configured in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### Run Migrations
```bash
# Fresh migration with seed data
php artisan migrate:fresh --seed

# Or just migrations
php artisan migrate

# Or just seeders
php artisan db:seed
```

## Key Features

### 1. UUID Support
All tables use UUID primary keys for better security and distributed systems support.

```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Company extends Model
{
    use HasUuids;
    // ...
}
```

### 2. Multi-Company Architecture
Users can belong to multiple companies with different roles:

```php
$user->companies()->attach($companyId, ['role' => 'admin']);
$companies = $user->companies; // Get all companies for user
```

### 3. Hierarchical Accounts
The chart of accounts supports unlimited hierarchy levels:

```php
$account = Account::with('children', 'parent')->find($id);
$detailAccounts = Account::where('is_detail', true)->get();
```

### 4. Balanced Journal Entries
Journal entries automatically track debits and credits:

```php
$entry = JournalEntry::with('lines.account')->find($id);
$totalDebits = $entry->lines->sum('debit');
$totalCredits = $entry->lines->sum('credit');
```

### 5. Period Management
Accounting periods can be opened/closed:

```php
$period = AccountingPeriod::where('company_id', $companyId)
    ->where('status', 'open')
    ->where('fiscal_year', 2025)
    ->where('period_number', 1)
    ->first();
```

## API Development Notes

The backend is ready for API development. Consider adding:

1. **API Routes** in `routes/api.php`
2. **Controllers** for each resource
3. **Form Requests** for validation
4. **API Resources** for transformation
5. **Middleware** for company context
6. **Policies** for authorization

Example structure:
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── CompanyController.php
│   │   │   ├── AccountController.php
│   │   │   ├── JournalEntryController.php
│   │   │   └── ...
│   ├── Requests/
│   │   ├── StoreJournalEntryRequest.php
│   │   └── ...
│   ├── Resources/
│   │   ├── AccountResource.php
│   │   ├── JournalEntryResource.php
│   │   └── ...
```

## Testing

Run tests to verify the setup:

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=UserTest
```

## Next Steps

1. **Configure Database:** Set up MySQL and update `.env`
2. **Run Migrations:** Execute `php artisan migrate:fresh --seed`
3. **Create API Endpoints:** Build RESTful controllers
4. **Add Validation:** Create Form Request classes
5. **Implement Authentication:** Configure Sanctum for API tokens
6. **Add Authorization:** Create policies for multi-company access control
7. **Build Business Logic:** Implement accounting rules and validations

## Database Diagram

The complete schema follows the structure defined in `database_mysql_script.sql` with proper foreign key constraints and indexes for optimal performance.

All relationships are properly defined in Eloquent models for easy querying and eager loading.

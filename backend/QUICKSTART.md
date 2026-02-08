# Quick Start Guide - Laravel Accounting System

## Backend Setup (5 Minutes)

### 1. Install Dependencies (Already Done)
```bash
composer install
npm install
```

### 2. Configure Database (1 minute)
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=accounting_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 3. Run Migrations and Seeders (1 minute)
```bash
# Fresh install with test data
php artisan migrate:fresh --seed
```

This creates:
- ✅ Test user: **admin@example.com** / **password**
- ✅ Test company: Empresa Demo S.A. de C.V.
- ✅ 26 chart of accounts
- ✅ 13 accounting periods (current year)
- ✅ Sample customers, suppliers, inventory, bank accounts

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
php artisan serve
```
Laravel will run at: http://localhost:8000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Vite will run at: http://localhost:5173

## Database Structure

### What's Included (33 Tables)
- **Multi-Company:** companies, company_users, balance_signers
- **Chart of Accounts:** account_types, accounting_segments, accounts
- **Periods:** accounting_periods, journal_entry_prefixes, journal_entry_sequences
- **Journal Entries:** journal_entries, journal_entry_lines
- **AR:** customers, invoices, customer_payments, payment_applications
- **AP:** suppliers, bills, supplier_payments, bill_payment_applications
- **Assets:** fixed_assets, depreciation_schedules
- **Inventory:** inventory_items, inventory_transactions
- **Treasury:** bank_accounts, bank_transactions
- **Config:** accounting_configuration, tax_configuration
- **Catalogs:** document_types, payment_methods, branches, units_of_measure, warehouses, company_modules

### Test Data Created
```
User: admin@example.com (password: password)
Company: Empresa Demo S.A. de C.V.
├── Account Types: 6 (Asset, Liability, Capital, Income, Cost, Expense)
├── Accounts: 26 (hierarchical chart)
├── Periods: 13 (1 annual + 12 monthly for 2025)
├── Customers: 3 with credit limits
├── Suppliers: 3 with payment terms
├── Inventory: 3 items
├── Bank Accounts: 2
├── Payment Methods: 4
└── Document Types: 5
```

## Common API Queries

### Get User's Companies
```php
$user = User::find($userId);
$companies = $user->companies()->withPivot('role')->get();
```

### Get Chart of Accounts
```php
$accounts = Account::where('company_id', $companyId)
    ->with('accountType', 'parent')
    ->where('active', true)
    ->orderBy('code')
    ->get();
```

### Get Detail Accounts Only
```php
$detailAccounts = Account::where('company_id', $companyId)
    ->where('is_detail', true)
    ->where('active', true)
    ->get();
```

### Get Open Periods
```php
$openPeriods = AccountingPeriod::where('company_id', $companyId)
    ->where('status', 'open')
    ->where('fiscal_year', 2025)
    ->orderBy('period_number')
    ->get();
```

### Create Journal Entry
```php
use Illuminate\Support\Str;

$entry = JournalEntry::create([
    'id' => Str::uuid(),
    'company_id' => $companyId,
    'entry_number' => 'D-2025-001',
    'entry_date' => now(),
    'entry_type' => 'diario',
    'description' => 'Sample entry',
    'status' => 'draft',
    'created_by' => $userId,
]);

$entry->lines()->createMany([
    [
        'id' => Str::uuid(),
        'account_id' => $debitAccountId,
        'debit' => 1000.00,
        'credit' => 0,
        'description' => 'Debit entry',
        'line_number' => 1,
    ],
    [
        'id' => Str::uuid(),
        'account_id' => $creditAccountId,
        'debit' => 0,
        'credit' => 1000.00,
        'description' => 'Credit entry',
        'line_number' => 2,
    ],
]);
```

### Get Customer Balance
```php
$customer = Customer::with('invoices')->find($customerId);
$totalOutstanding = $customer->invoices()
    ->whereIn('status', ['pending', 'partial', 'overdue'])
    ->sum('balance');
```

## Next Steps for Development

### 1. Create API Controllers
```bash
php artisan make:controller Api/CompanyController --api
php artisan make:controller Api/AccountController --api
php artisan make:controller Api/JournalEntryController --api
php artisan make:controller Api/CustomerController --api
php artisan make:controller Api/InvoiceController --api
```

### 2. Create Form Requests
```bash
php artisan make:request StoreJournalEntryRequest
php artisan make:request UpdateJournalEntryRequest
php artisan make:request StoreInvoiceRequest
```

### 3. Create API Resources
```bash
php artisan make:resource AccountResource
php artisan make:resource JournalEntryResource
php artisan make:resource InvoiceResource
```

### 4. Add API Routes
In `routes/api.php`:
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('companies', CompanyController::class);
    Route::apiResource('accounts', AccountController::class);
    Route::apiResource('journal-entries', JournalEntryController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('invoices', InvoiceController::class);
});
```

### 5. Create Policies
```bash
php artisan make:policy CompanyPolicy --model=Company
php artisan make:policy AccountPolicy --model=Account
php artisan make:policy JournalEntryPolicy --model=JournalEntry
```

### 6. Add Tests
```bash
php artisan make:test Api/JournalEntryTest
php artisan make:test Api/AccountTest
php artisan make:test Api/InvoiceTest
```

## Important Security Notes

### Multi-Company Context
**ALWAYS** filter queries by `company_id`:
```php
// GOOD ✅
$accounts = Account::where('company_id', $companyId)->get();

// BAD ❌ - could leak data across companies
$accounts = Account::all();
```

### UUID Usage
Always generate UUIDs when creating records:
```php
use Illuminate\Support\Str;

Model::create([
    'id' => Str::uuid(),
    'company_id' => $companyId,
    // ... other fields
]);
```

### Journal Entry Validation
Ensure entries are balanced:
```php
$totalDebit = $entry->lines->sum('debit');
$totalCredit = $entry->lines->sum('credit');

if ($totalDebit !== $totalCredit) {
    throw new \Exception('Journal entry must be balanced');
}
```

## Common Commands

### Database
```bash
# Fresh migration with seed data
php artisan migrate:fresh --seed

# Just migrations
php artisan migrate

# Just seeders
php artisan db:seed

# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback
```

### Cache
```bash
# Clear all caches
php artisan optimize:clear

# Or individually
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Testing
```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=JournalEntryTest

# Run with coverage
php artisan test --coverage
```

## Troubleshooting

### Database Connection Failed
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists: `CREATE DATABASE accounting_db;`

### Migration Errors
```bash
# Reset migrations
php artisan migrate:fresh --seed

# Clear config cache
php artisan config:clear
```

### Port Already in Use
```bash
# Use different port
php artisan serve --port=8001
```

## Documentation

- **Complete Backend Docs:** `LARAVEL_BACKEND_SETUP.md`
- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Full README:** `README.md`

## Models Created (19)

All models include UUID support, relationships, and proper casting:
- Company, User, AccountType, AccountingSegment, Account
- AccountingPeriod, JournalEntry, JournalEntryLine
- Customer, Supplier, Invoice, Bill
- CustomerPayment, SupplierPayment, BankAccount, BankTransaction
- InventoryItem, InventoryTransaction, PaymentMethod, DocumentType

Happy coding! 🚀


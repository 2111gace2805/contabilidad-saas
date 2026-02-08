# REST API Documentation

## Overview

This is the complete REST API documentation for the accounting system. All endpoints require authentication using Laravel Sanctum unless otherwise specified.

## Authentication

### Login
```
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "user": { ... },
  "token": "1|abcd..."
}
```

### Register
```
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### Logout
```
POST /api/logout
Authorization: Bearer {token}
```

### Get Current User
```
GET /api/user
Authorization: Bearer {token}
```

## Multi-Company Context

Most endpoints require a company context. Pass the company ID in the request header:

```
X-Company-Id: {company-uuid}
```

The middleware will verify that the authenticated user has access to the specified company.

## Companies

### List Companies
```
GET /api/companies
Authorization: Bearer {token}

Response:
[
  {
    "id": "uuid",
    "name": "Company Name",
    "rfc": "RFC123",
    "currency": "USD",
    ...
  }
]
```

### Create Company
```
POST /api/companies
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Company",
  "rfc": "RFC123",
  "currency": "USD",
  "address": "123 Main St",
  ...
}
```

### Get Company
```
GET /api/companies/{id}
Authorization: Bearer {token}
```

### Update Company
```
PUT /api/companies/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Company Name"
}
```

### Delete Company
```
DELETE /api/companies/{id}
Authorization: Bearer {token}
```

### Select Company
```
POST /api/companies/{id}/select
Authorization: Bearer {token}

Response:
{
  "message": "Company selected",
  "company": { ... }
}
```

## Chart of Accounts

### List Accounts
```
GET /api/accounts
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response: Array of accounts with relationships
```

### Get Hierarchical Accounts
```
GET /api/accounts/hierarchy
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response: Tree structure of accounts
```

### Create Account
```
POST /api/accounts
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "code": "1000",
  "name": "Cash",
  "account_type_id": "uuid",
  "parent_id": null,
  "level": 1,
  "is_detail": true,
  "active": true
}
```

### Get Account
```
GET /api/accounts/{id}
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Update Account
```
PUT /api/accounts/{id}
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "name": "Updated Account Name"
}
```

### Delete Account
```
DELETE /api/accounts/{id}
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

## Account Types

### List Account Types
```
GET /api/account-types
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Account Type
```
POST /api/account-types
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "code": "ACT",
  "name": "Activo",
  "category": "ACTIVO",
  "active": true
}

Categories: ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO
```

### Get, Update, Delete Account Type
```
GET /api/account-types/{id}
PUT /api/account-types/{id}
DELETE /api/account-types/{id}
```

## Accounting Segments

### List Segments
```
GET /api/accounting-segments
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Segment
```
POST /api/accounting-segments
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "code": "SEG01",
  "name": "Segment Name",
  "active": true
}
```

### Get, Update, Delete Segment
```
GET /api/accounting-segments/{id}
PUT /api/accounting-segments/{id}
DELETE /api/accounting-segments/{id}
```

## Accounting Periods

### List Periods
```
GET /api/accounting-periods
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Period
```
POST /api/accounting-periods
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "year": 2024,
  "month": 1,
  "status": "open"
}

Status: open, closed
```

### Close Period
```
POST /api/accounting-periods/{id}/close
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Open Period
```
POST /api/accounting-periods/{id}/open
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Get, Update Period
```
GET /api/accounting-periods/{id}
PUT /api/accounting-periods/{id}
```

## Journal Entries

### List Journal Entries
```
GET /api/journal-entries?status=draft&date_from=2024-01-01&date_to=2024-12-31&per_page=15
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- status: draft, posted, voided
- date_from: YYYY-MM-DD
- date_to: YYYY-MM-DD
- per_page: pagination size (default: 15)

Response: Paginated journal entries with lines
```

### Create Journal Entry
```
POST /api/journal-entries
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "entry_date": "2024-01-15",
  "entry_type": "General",
  "description": "Opening balance",
  "lines": [
    {
      "account_id": "uuid",
      "debit": 1000.00,
      "credit": 0.00,
      "description": "Cash"
    },
    {
      "account_id": "uuid",
      "debit": 0.00,
      "credit": 1000.00,
      "description": "Capital"
    }
  ]
}

Note: Debits must equal credits
```

### Get Journal Entry
```
GET /api/journal-entries/{id}
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Update Journal Entry
```
PUT /api/journal-entries/{id}
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

Note: Only draft entries can be updated
```

### Post Journal Entry
```
POST /api/journal-entries/{id}/post
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response:
{
  "message": "Journal entry posted successfully",
  "entry": { ... }
}
```

### Void Journal Entry
```
POST /api/journal-entries/{id}/void
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response:
{
  "message": "Journal entry voided successfully",
  "entry": { ... }
}
```

### Delete Journal Entry
```
DELETE /api/journal-entries/{id}
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Note: Only draft entries can be deleted
```

## Customers

### List Customers
```
GET /api/customers?search=john&per_page=15
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- search: search by name, code, rfc, email
- per_page: pagination size
```

### Create Customer
```
POST /api/customers
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "name": "John Doe",
  "code": "CUST001",
  "rfc": "RFC123",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "credit_limit": 10000.00,
  "credit_days": 30,
  "active": true
}
```

### Get, Update, Delete Customer
```
GET /api/customers/{id}
PUT /api/customers/{id}
DELETE /api/customers/{id}
```

## Suppliers

### List Suppliers
```
GET /api/suppliers?search=acme&per_page=15
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Supplier
```
POST /api/suppliers
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "name": "ACME Corp",
  "code": "SUP001",
  "rfc": "RFC456",
  "email": "acme@example.com",
  "phone": "555-5678",
  "address": "456 Supplier Ave",
  "credit_days": 30,
  "active": true
}
```

### Get, Update, Delete Supplier
```
GET /api/suppliers/{id}
PUT /api/suppliers/{id}
DELETE /api/suppliers/{id}
```

## Invoices (Accounts Receivable)

### List Invoices
```
GET /api/invoices?customer_id=uuid&status=issued&per_page=15
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- customer_id: filter by customer
- status: draft, issued, paid, cancelled
- per_page: pagination size
```

### Create Invoice
```
POST /api/invoices
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "customer_id": "uuid",
  "invoice_number": "INV-001",
  "invoice_date": "2024-01-15",
  "due_date": "2024-02-15",
  "subtotal": 1000.00,
  "tax": 100.00,
  "total": 1100.00,
  "balance": 1100.00,
  "status": "draft"
}
```

### Get, Update, Delete Invoice
```
GET /api/invoices/{id}
PUT /api/invoices/{id}
DELETE /api/invoices/{id}

Note: Only draft invoices can be deleted
```

## Bills (Accounts Payable)

### List Bills
```
GET /api/bills?supplier_id=uuid&status=received&per_page=15
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- supplier_id: filter by supplier
- status: draft, received, paid, cancelled
- per_page: pagination size
```

### Create Bill
```
POST /api/bills
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "supplier_id": "uuid",
  "bill_number": "BILL-001",
  "bill_date": "2024-01-15",
  "due_date": "2024-02-15",
  "subtotal": 500.00,
  "tax": 50.00,
  "total": 550.00,
  "balance": 550.00,
  "status": "draft"
}
```

### Get, Update, Delete Bill
```
GET /api/bills/{id}
PUT /api/bills/{id}
DELETE /api/bills/{id}

Note: Only draft bills can be deleted
```

## Inventory Items

### List Inventory Items
```
GET /api/inventory-items?search=widget&category=product&per_page=15
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- search: search by code, name, description
- category: filter by category
- per_page: pagination size
```

### Create Inventory Item
```
POST /api/inventory-items
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "code": "ITEM001",
  "name": "Widget",
  "description": "A useful widget",
  "category": "Products",
  "unit_of_measure": "EA",
  "unit_cost": 10.00,
  "unit_price": 15.00,
  "quantity_on_hand": 100,
  "reorder_level": 20,
  "active": true
}
```

### Get, Update, Delete Inventory Item
```
GET /api/inventory-items/{id}
PUT /api/inventory-items/{id}
DELETE /api/inventory-items/{id}
```

## Bank Accounts

### List Bank Accounts
```
GET /api/bank-accounts
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Bank Account
```
POST /api/bank-accounts
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "account_id": "uuid",
  "bank_name": "Bank of America",
  "account_number": "123456789",
  "account_type": "Checking",
  "currency": "USD",
  "balance": 10000.00,
  "active": true
}
```

### Get, Update, Delete Bank Account
```
GET /api/bank-accounts/{id}
PUT /api/bank-accounts/{id}
DELETE /api/bank-accounts/{id}
```

## Payment Methods (Catalog)

### List Payment Methods
```
GET /api/payment-methods
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Payment Method
```
POST /api/payment-methods
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "code": "CASH",
  "name": "Cash",
  "active": true
}
```

### Get, Update, Delete Payment Method
```
GET /api/payment-methods/{id}
PUT /api/payment-methods/{id}
DELETE /api/payment-methods/{id}
```

## Document Types (Catalog)

### List Document Types
```
GET /api/document-types
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
```

### Create Document Type
```
POST /api/document-types
Authorization: Bearer {token}
X-Company-Id: {company-uuid}
Content-Type: application/json

{
  "code": "INV",
  "name": "Invoice",
  "category": "Sales",
  "active": true
}
```

### Get, Update, Delete Document Type
```
GET /api/document-types/{id}
PUT /api/document-types/{id}
DELETE /api/document-types/{id}
```

## Dashboard

### Get Dashboard Statistics
```
GET /api/dashboard
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response:
{
  "customers": 50,
  "suppliers": 30,
  "accounts": 100,
  "journal_entries": 500,
  "receivables": {
    "total": 50000.00,
    "overdue": 5000.00
  },
  "payables": {
    "total": 30000.00,
    "overdue": 3000.00
  },
  "recent_entries": [ ... ],
  "recent_invoices": [ ... ],
  "recent_bills": [ ... ]
}
```

### Get Dashboard Summary
```
GET /api/dashboard/summary
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response:
{
  "accounts_by_type": [ ... ],
  "journal_entries_by_status": [ ... ]
}
```

## Reports

### Balance Sheet
```
GET /api/reports/balance-sheet?date=2024-01-31
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- date: YYYY-MM-DD (default: today)

Response:
{
  "date": "2024-01-31",
  "balances": [
    {
      "account": { ... },
      "balance": 1000.00
    }
  ]
}
```

### Income Statement
```
GET /api/reports/income-statement?date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- date_from: YYYY-MM-DD (default: start of year)
- date_to: YYYY-MM-DD (default: today)

Response:
{
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "balances": [ ... ]
}
```

### Trial Balance
```
GET /api/reports/trial-balance?date=2024-01-31
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Response:
{
  "date": "2024-01-31",
  "balances": [
    {
      "account": { ... },
      "debits": 1000.00,
      "credits": 500.00,
      "balance": 500.00
    }
  ],
  "total_debits": 10000.00,
  "total_credits": 10000.00
}
```

### General Ledger
```
GET /api/reports/general-ledger?account_id=uuid&date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer {token}
X-Company-Id: {company-uuid}

Query Parameters:
- account_id: required
- date_from: YYYY-MM-DD (default: start of month)
- date_to: YYYY-MM-DD (default: today)

Response:
{
  "account": { ... },
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "transactions": [
    {
      "date": "2024-01-15",
      "entry_number": 1,
      "description": "...",
      "debit": 1000.00,
      "credit": 0.00,
      "balance": 1000.00
    }
  ]
}
```

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "message": "Company ID required"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "Unauthorized access to this company"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message"
    ]
  }
}
```

### 500 Server Error
```json
{
  "message": "Error message",
  "error": "Detailed error description"
}
```

## Notes

1. All authenticated requests must include `Authorization: Bearer {token}` header
2. Most endpoints require `X-Company-Id: {company-uuid}` header for multi-company support
3. Pagination is available on list endpoints using `per_page` query parameter
4. Dates are in `YYYY-MM-DD` format
5. Amounts are decimal with 2 decimal places
6. UUIDs are used for all primary keys

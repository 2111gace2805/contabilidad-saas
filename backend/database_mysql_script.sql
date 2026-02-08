-- =====================================================
-- SCRIPT COMPLETO DE BASE DE DATOS MYSQL
-- Sistema Contable Multi-Empresa
-- Adaptado de PostgreSQL/Supabase a MySQL
-- =====================================================

-- IMPORTANTE: Este script está adaptado para MySQL
-- Diferencias principales con PostgreSQL:
-- - UUID se maneja como CHAR(36)
-- - gen_random_uuid() se reemplaza por triggers o UUID()
-- - timestamptz se reemplaza por DATETIME
-- - text se reemplaza por TEXT o VARCHAR según el caso
-- - numeric(15,2) se reemplaza por DECIMAL(15,2)
-- - REFERENCES con ON DELETE CASCADE funciona igual
-- - CHECK constraints funcionan desde MySQL 8.0.16+

-- =====================================================
-- 1. TABLAS PRINCIPALES
-- =====================================================

-- Tabla de Empresas
CREATE TABLE IF NOT EXISTS companies (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  rfc VARCHAR(50) NOT NULL,
  nrc VARCHAR(50),
  nit VARCHAR(50),
  taxpayer_type ENUM('micro', 'pequeño', 'mediano', 'grande'),
  is_withholding_agent BOOLEAN DEFAULT FALSE,
  address TEXT,
  address_line2 TEXT,
  municipality VARCHAR(100),
  department VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'El Salvador',
  employer_registration VARCHAR(50),
  phone VARCHAR(50),
  business_activity VARCHAR(255),
  fiscal_year_start INT NOT NULL DEFAULT 1,
  currency VARCHAR(10) NOT NULL DEFAULT 'MXN',
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Usuarios por Empresa
-- NOTA: En MySQL no tenemos auth.users de Supabase
-- Deberás crear tu propia tabla de usuarios o usar un sistema de autenticación externo
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  role ENUM('admin', 'accountant', 'viewer') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_user (company_id, user_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_company_users_company ON company_users(company_id);
CREATE INDEX idx_company_users_user ON company_users(user_id);

-- Tabla de Firmantes de Balance
CREATE TABLE IF NOT EXISTS balance_signers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  signer_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  order_index INT NOT NULL CHECK (order_index >= 1 AND order_index <= 6),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_order (company_id, order_index),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_balance_signers_company ON balance_signers(company_id);

-- =====================================================
-- 2. CATÁLOGO CONTABLE
-- =====================================================

-- Tipos de Cuenta
CREATE TABLE IF NOT EXISTS account_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  nature ENUM('deudora', 'acreedora') NOT NULL,
  affects_balance BOOLEAN DEFAULT FALSE,
  affects_results BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_account_types_company ON account_types(company_id);

-- Segmentos Contables (para estructura flexible)
CREATE TABLE IF NOT EXISTS accounting_segments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_segment_id CHAR(36),
  level INT NOT NULL DEFAULT 1,
  digit_length INT DEFAULT 2 CHECK (digit_length > 0),
  sequence INT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_segment_id) REFERENCES accounting_segments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_accounting_segments_company ON accounting_segments(company_id);
CREATE INDEX idx_accounting_segments_parent ON accounting_segments(parent_segment_id);

-- Cuentas Contables
CREATE TABLE IF NOT EXISTS accounts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  account_type_id CHAR(36) NOT NULL,
  parent_id CHAR(36),
  level INT NOT NULL DEFAULT 1,
  is_detail BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (account_type_id) REFERENCES account_types(id),
  FOREIGN KEY (parent_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_accounts_company ON accounts(company_id);
CREATE INDEX idx_accounts_parent ON accounts(parent_id);

-- =====================================================
-- 3. PERÍODOS CONTABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS accounting_periods (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  period_type ENUM('monthly', 'annual') NOT NULL,
  fiscal_year INT NOT NULL,
  period_number INT NOT NULL CHECK (period_number >= 0 AND period_number <= 12),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL CHECK (end_date > start_date),
  status ENUM('open', 'closed') NOT NULL DEFAULT 'open',
  closed_at DATETIME,
  closed_by CHAR(36),
  closing_entry_id CHAR(36),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (company_id, fiscal_year, period_number, period_type),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (closed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_accounting_periods_company_year ON accounting_periods(company_id, fiscal_year);
CREATE INDEX idx_accounting_periods_status ON accounting_periods(company_id, status);

-- =====================================================
-- 4. ASIENTOS CONTABLES (PÓLIZAS)
-- =====================================================

-- Pólizas/Asientos Contables
CREATE TABLE IF NOT EXISTS journal_entries (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  entry_number VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL,
  entry_type ENUM('diario', 'ingresos', 'egresos', 'ajuste') NOT NULL,
  description TEXT NOT NULL,
  status ENUM('draft', 'posted', 'void') NOT NULL DEFAULT 'draft',
  created_by CHAR(36) NOT NULL,
  posted_at DATETIME,
  voided_at DATETIME,
  voided_by CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_entry (company_id, entry_number),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (voided_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_entries_company ON journal_entries(company_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);

-- Líneas de Asiento
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  journal_entry_id CHAR(36) NOT NULL,
  account_id CHAR(36) NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0 CHECK (debit >= 0),
  credit DECIMAL(15,2) DEFAULT 0 CHECK (credit >= 0),
  description TEXT,
  line_number INT NOT NULL,
  CHECK (debit = 0 OR credit = 0),
  CHECK (debit > 0 OR credit > 0),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_entry_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_id);

-- Prefijos y Secuencias para Pólizas
CREATE TABLE IF NOT EXISTS journal_entry_prefixes (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  module VARCHAR(50) NOT NULL,
  prefix VARCHAR(10) NOT NULL,
  description VARCHAR(255) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_module (company_id, module),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_entry_prefixes_company_id ON journal_entry_prefixes(company_id);

CREATE TABLE IF NOT EXISTS journal_entry_sequences (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  accounting_period_id CHAR(36) NOT NULL,
  module VARCHAR(50) NOT NULL,
  last_number INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_period_module (company_id, accounting_period_id, module),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (accounting_period_id) REFERENCES accounting_periods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_journal_entry_sequences_company_id ON journal_entry_sequences(company_id);

-- =====================================================
-- 5. CLIENTES Y CUENTAS POR COBRAR
-- =====================================================

-- Clientes
CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  rfc VARCHAR(50),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  credit_limit DECIMAL(15,2) DEFAULT 0,
  credit_days INT DEFAULT 30,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customers_company ON customers(company_id);

-- Facturas de Clientes (CxC)
CREATE TABLE IF NOT EXISTS invoices (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'partial', 'paid', 'overdue', 'void') NOT NULL DEFAULT 'pending',
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_invoice (company_id, invoice_number),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- Pagos de Clientes
CREATE TABLE IF NOT EXISTS customer_payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  customer_id CHAR(36) NOT NULL,
  payment_number VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  reference VARCHAR(100),
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_payment (company_id, payment_number),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_customer_payments_company ON customer_payments(company_id);

-- Aplicación de Pagos
CREATE TABLE IF NOT EXISTS payment_applications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id CHAR(36) NOT NULL,
  invoice_id CHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES customer_payments(id) ON DELETE CASCADE,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. PROVEEDORES Y CUENTAS POR PAGAR
-- =====================================================

-- Proveedores
CREATE TABLE IF NOT EXISTS suppliers (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  rfc VARCHAR(50),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  credit_days INT DEFAULT 30,
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_suppliers_company ON suppliers(company_id);

-- Facturas de Proveedores (CxP)
CREATE TABLE IF NOT EXISTS bills (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  supplier_id CHAR(36) NOT NULL,
  bill_number VARCHAR(50) NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax DECIMAL(15,2) DEFAULT 0,
  total DECIMAL(15,2) NOT NULL,
  balance DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'partial', 'paid', 'overdue', 'void') NOT NULL DEFAULT 'pending',
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_bill (company_id, bill_number),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bills_company ON bills(company_id);
CREATE INDEX idx_bills_supplier ON bills(supplier_id);

-- Pagos a Proveedores
CREATE TABLE IF NOT EXISTS supplier_payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  supplier_id CHAR(36) NOT NULL,
  payment_number VARCHAR(50) NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  reference VARCHAR(100),
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_payment (company_id, payment_number),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_supplier_payments_company ON supplier_payments(company_id);

-- Aplicación de Pagos a Proveedores
CREATE TABLE IF NOT EXISTS bill_payment_applications (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  payment_id CHAR(36) NOT NULL,
  bill_id CHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES supplier_payments(id) ON DELETE CASCADE,
  FOREIGN KEY (bill_id) REFERENCES bills(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. ACTIVOS FIJOS
-- =====================================================

-- Activos Fijos
CREATE TABLE IF NOT EXISTS fixed_assets (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  asset_number VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(15,2) NOT NULL,
  salvage_value DECIMAL(15,2) DEFAULT 0,
  useful_life_years INT NOT NULL,
  depreciation_method ENUM('straight_line', 'declining_balance') NOT NULL DEFAULT 'straight_line',
  asset_account_id CHAR(36),
  depreciation_account_id CHAR(36),
  accumulated_depreciation_account_id CHAR(36),
  status ENUM('active', 'disposed', 'sold') NOT NULL DEFAULT 'active',
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_asset (company_id, asset_number),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_account_id) REFERENCES accounts(id),
  FOREIGN KEY (depreciation_account_id) REFERENCES accounts(id),
  FOREIGN KEY (accumulated_depreciation_account_id) REFERENCES accounts(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_fixed_assets_company ON fixed_assets(company_id);

-- Depreciaciones
CREATE TABLE IF NOT EXISTS depreciation_schedules (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  fixed_asset_id CHAR(36) NOT NULL,
  period_date DATE NOT NULL,
  depreciation_amount DECIMAL(15,2) NOT NULL,
  accumulated_depreciation DECIMAL(15,2) NOT NULL,
  net_book_value DECIMAL(15,2) NOT NULL,
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_asset_period (fixed_asset_id, period_date),
  FOREIGN KEY (fixed_asset_id) REFERENCES fixed_assets(id) ON DELETE CASCADE,
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_depreciation_schedules_asset ON depreciation_schedules(fixed_asset_id);

-- =====================================================
-- 8. INVENTARIO
-- =====================================================

-- Artículos de Inventario
CREATE TABLE IF NOT EXISTS inventory_items (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  item_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit_of_measure VARCHAR(50) NOT NULL,
  cost_method ENUM('average', 'fifo', 'lifo') NOT NULL DEFAULT 'average',
  current_quantity DECIMAL(15,4) DEFAULT 0,
  average_cost DECIMAL(15,4) DEFAULT 0,
  inventory_account_id CHAR(36),
  cogs_account_id CHAR(36),
  active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_item (company_id, item_code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (inventory_account_id) REFERENCES accounts(id),
  FOREIGN KEY (cogs_account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inventory_items_company ON inventory_items(company_id);

-- Movimientos de Inventario
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  item_id CHAR(36) NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type ENUM('purchase', 'sale', 'adjustment', 'transfer') NOT NULL,
  quantity DECIMAL(15,4) NOT NULL,
  unit_cost DECIMAL(15,4) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  reference_type VARCHAR(50),
  reference_id CHAR(36),
  notes TEXT,
  journal_entry_id CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inventory_transactions_company ON inventory_transactions(company_id);
CREATE INDEX idx_inventory_transactions_item ON inventory_transactions(item_id);

-- =====================================================
-- 9. TESORERÍA
-- =====================================================

-- Cuentas Bancarias
CREATE TABLE IF NOT EXISTS bank_accounts (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  account_id CHAR(36),
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_type ENUM('checking', 'savings', 'investment') NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'MXN',
  initial_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  current_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bank_accounts_company_id ON bank_accounts(company_id);
CREATE INDEX idx_bank_accounts_account_id ON bank_accounts(account_id);

-- Transacciones Bancarias
CREATE TABLE IF NOT EXISTS bank_transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  bank_account_id CHAR(36) NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference_number VARCHAR(100),
  description TEXT NOT NULL,
  counterparty_type ENUM('customer', 'supplier', 'other'),
  counterparty_id CHAR(36),
  journal_entry_id CHAR(36),
  created_by CHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_bank_transactions_company_id ON bank_transactions(company_id);
CREATE INDEX idx_bank_transactions_bank_account_id ON bank_transactions(bank_account_id);
CREATE INDEX idx_bank_transactions_transaction_date ON bank_transactions(transaction_date);

-- =====================================================
-- 10. CONFIGURACIÓN CONTABLE
-- =====================================================

-- Configuración de Cuentas Predeterminadas
CREATE TABLE IF NOT EXISTS accounting_configuration (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  default_inventory_account CHAR(36),
  default_purchase_expense_account CHAR(36),
  default_vat_payable_account CHAR(36),
  default_vat_receivable_account CHAR(36),
  default_accounts_payable_account CHAR(36),
  default_accounts_receivable_account CHAR(36),
  default_sales_revenue_account CHAR(36),
  default_cost_of_sales_account CHAR(36),
  default_cash_account CHAR(36),
  default_bank_account CHAR(36),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company (company_id),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (default_inventory_account) REFERENCES accounts(id),
  FOREIGN KEY (default_purchase_expense_account) REFERENCES accounts(id),
  FOREIGN KEY (default_vat_payable_account) REFERENCES accounts(id),
  FOREIGN KEY (default_vat_receivable_account) REFERENCES accounts(id),
  FOREIGN KEY (default_accounts_payable_account) REFERENCES accounts(id),
  FOREIGN KEY (default_accounts_receivable_account) REFERENCES accounts(id),
  FOREIGN KEY (default_sales_revenue_account) REFERENCES accounts(id),
  FOREIGN KEY (default_cost_of_sales_account) REFERENCES accounts(id),
  FOREIGN KEY (default_cash_account) REFERENCES accounts(id),
  FOREIGN KEY (default_bank_account) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_accounting_configuration_company ON accounting_configuration(company_id);

-- Configuración de Impuestos
CREATE TABLE IF NOT EXISTS tax_configuration (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  tax_code VARCHAR(50) NOT NULL,
  tax_name VARCHAR(255) NOT NULL,
  tax_type ENUM('debit', 'credit', 'withholding') NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  account_id CHAR(36) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  apply_condition VARCHAR(50) DEFAULT 'always',
  minimum_amount DECIMAL(15,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, tax_code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tax_configuration_company ON tax_configuration(company_id);

-- =====================================================
-- 11. CATÁLOGOS DE ADMINISTRACIÓN
-- =====================================================

-- Tipos de Documento
CREATE TABLE IF NOT EXISTS document_types (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_document_types_company ON document_types(company_id);

-- Métodos de Pago
CREATE TABLE IF NOT EXISTS payment_methods (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payment_methods_company ON payment_methods(company_id);

-- Sucursales
CREATE TABLE IF NOT EXISTS branches (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_branches_company ON branches(company_id);

-- Unidades de Medida
CREATE TABLE IF NOT EXISTS units_of_measure (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_units_of_measure_company ON units_of_measure(company_id);

-- Almacenes
CREATE TABLE IF NOT EXISTS warehouses (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_code (company_id, code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_warehouses_company ON warehouses(company_id);

-- =====================================================
-- 12. MÓDULOS ACTIVOS POR EMPRESA
-- =====================================================

CREATE TABLE IF NOT EXISTS company_modules (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id CHAR(36) NOT NULL,
  module_code VARCHAR(50) NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  activated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_module (company_id, module_code),
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_company_modules_company ON company_modules(company_id);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- NOTAS IMPORTANTES PARA MYSQL:
--
-- 1. AUTENTICACIÓN:
--    - Este script incluye una tabla básica 'users'
--    - Deberás implementar tu propio sistema de autenticación
--    - O integrar con un sistema externo (Auth0, Firebase, etc.)
--
-- 2. UUID:
--    - MySQL usa UUID() para generar UUIDs
--    - Los campos UUID se definen como CHAR(36)
--
-- 3. SEGURIDAD (RLS):
--    - MySQL NO tiene Row Level Security nativo como PostgreSQL
--    - Debes implementar la seguridad a nivel de aplicación
--    - Usa vistas y procedimientos almacenados para controlar acceso
--    - Filtra SIEMPRE por company_id en tus consultas
--
-- 4. PERMISOS:
--    - Crea usuarios de base de datos con permisos limitados
--    - No uses el usuario root en producción
--    - Implementa auditoría a nivel de aplicación
--
-- 5. MIGRACIONES ADICIONALES:
--    - Este script es la base
--    - Algunas migraciones específicas de PostgreSQL no están incluidas
--    - Adapta según tus necesidades específicas
--
-- 6. FUNCIONES Y TRIGGERS:
--    - MySQL puede tener triggers para validaciones
--    - Considera implementar funciones para validar períodos cerrados
--    - Ejemplo: BEFORE INSERT en journal_entries para validar período
--
-- 7. ÍNDICES:
--    - Los índices están incluidos
--    - Monitorea el rendimiento y ajusta según sea necesario
--    - Considera índices adicionales basados en tus consultas más frecuentes

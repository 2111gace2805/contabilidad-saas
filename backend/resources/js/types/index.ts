// Laravel API Response Types

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  active: boolean;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  nit: string | null;
  rfc?: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  fiscal_year_start: number;
  currency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  pivot?: {
    role: 'admin' | 'accountant' | 'viewer';
    user_id: number;
    company_id: number;
  };
}

export interface CompanyUser {
  id: number;
  company_id: number;
  user_id: number;
  role: string;
  created_at: string;
  updated_at: string;
  company?: Company;
}

export interface Account {
  id: number;
  company_id: number;
  account_type_id: number;
  code: string;
  name: string;
  description: string | null;
  parent_account_id: number | null;
  level: number;
  balance_type: 'debit' | 'credit';
  allows_transactions: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  account_type?: AccountType;
  parent_account?: Account;
  children?: Account[];
}

export interface AccountType {
  id: number;
  company_id: number;
  code: string;
  name: string;
  category: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  balance_type: 'debit' | 'credit';
  presentation_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountingSegment {
  id: number;
  company_id: number;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountingPeriod {
  id: number;
  company_id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
  closed_at: string | null;
  closed_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: number;
  company_id: number;
  period_id: number;
  document_type_id: number | null;
  entry_type?: string;
  entry_number: string;
  sequence_number?: number;
  type_number?: number;
  entry_date: string;
  description: string;
  reference: string | null;
  status: 'draft' | 'posted' | 'void';
  posted_at: string | null;
  posted_by: number | null;
  voided_at: string | null;
  voided_by: number | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  lines?: JournalEntryLine[];
  period?: AccountingPeriod;
  document_type?: DocumentType;
}

export interface JournalEntryType {
  id: number;
  company_id: number;
  code: string;
  name: string;
  active: boolean;
  has_entries?: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: number;
  journal_entry_id: number;
  account_id: number;
  segment_id: number | null;
  line_number: number;
  description: string | null;
  debit: string;
  credit: string;
  created_at: string;
  updated_at: string;
  account?: Account;
  segment?: AccountingSegment;
}

export interface Customer {
  id: number;
  company_id: number;
  code: string;
  name: string;
  business_name?: string | null;
  profile_type?: 'natural' | 'juridical';
  contact_name?: string | null;
  nit: string | null;
  rfc?: string | null;
  email?: string | null;
  email1?: string | null;
  email2?: string | null;
  email3?: string | null;
  phone: string | null;
  address: string | null;
  credit_limit: string;
  credit_days: number;
  nrc?: string | null;
  dui?: string | null;
  depa_id?: string | null;
  municipality_id?: number | null;
  district_id?: number | null;
  customer_type_id?: number | null;
  economic_activity_id?: string | null;
  is_gran_contribuyente?: boolean;
  is_exento_iva?: boolean;
  is_no_sujeto_iva?: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  company_id: number;
  code: string;
  name: string;
  nit: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  credit_days: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  company_id: number;
  customer_id: number | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  balance: string;
  status: 'draft' | 'pending' | 'partial' | 'paid' | 'overdue' | 'void' | 'cancelled' | 'issued';
  notes: string | null;
  tipo_dte?: string | null;
  dte_version?: number | null;
  dte_ambiente?: string | null;
  dte_numero_control?: string | null;
  dte_codigo_generacion?: string | null;
  dte_fec_emi?: string | null;
  dte_hor_emi?: string | null;
  dte_sello_recibido?: string | null;
  dte_firma_electronica?: string | null;
  dte_emisor?: Record<string, any> | null;
  dte_receptor?: Record<string, any> | null;
  dte_cuerpo_documento?: any[] | null;
  dte_resumen?: Record<string, any> | null;
  dte_apendice?: any[] | null;
  dte_raw_json?: string | null;
  customer_name_snapshot?: string | null;
  customer_tax_id_snapshot?: string | null;
  customer_phone_snapshot?: string | null;
  customer_email_snapshot?: string | null;
  customer_address_snapshot?: string | null;
  is_fiscal_credit?: boolean;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  lines?: InvoiceLine[];
}

export interface InvoiceLine {
  id: number;
  invoice_id: number;
  description: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: number;
  company_id: number;
  supplier_id: number | null;
  bill_number: string;
  bill_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  balance: string;
  status: 'draft' | 'pending' | 'received' | 'partial' | 'paid' | 'overdue' | 'void' | 'cancelled';
  notes: string | null;
  tipo_dte?: string | null;
  dte_version?: number | null;
  dte_ambiente?: string | null;
  dte_numero_control?: string | null;
  dte_codigo_generacion?: string | null;
  dte_fec_emi?: string | null;
  dte_hor_emi?: string | null;
  dte_sello_recibido?: string | null;
  dte_firma_electronica?: string | null;
  dte_emisor?: Record<string, any> | null;
  dte_receptor?: Record<string, any> | null;
  dte_cuerpo_documento?: any[] | null;
  dte_resumen?: Record<string, any> | null;
  dte_apendice?: any[] | null;
  dte_raw_json?: string | null;
  supplier_name_snapshot?: string | null;
  supplier_tax_id_snapshot?: string | null;
  supplier_phone_snapshot?: string | null;
  supplier_email_snapshot?: string | null;
  supplier_address_snapshot?: string | null;
  is_fiscal_credit?: boolean;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  lines?: BillLine[];
}

export interface BillLine {
  id: number;
  bill_id: number;
  description: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  company_id: number;
  item_code?: string;
  code: string;
  name: string;
  description: string | null;
  unit_of_measure: string;
  current_quantity: string;
  minimum_quantity: string;
  average_cost: string;
  inventory_account_id?: number | null;
  cogs_account_id?: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: number;
  company_id: number;
  account_id: number;
  bank_name: string;
  account_number: string;
  account_type: string;
  currency: string;
  current_balance: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  account?: Account;
}

export interface PaymentMethod {
  id: number;
  company_id: number;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentType {
  id: number;
  company_id: number;
  code: string;
  name: string;
  description: string | null;
  prefix: string;
  next_number: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_assets: number;
  total_liabilities: number;
  equity: number;
  revenue: number;
  expenses: number;
  net_income: number;
  receivables: number;
  payables: number;
  inventory_value: number;
  journal_entries_count: number;
  pending_voids_count?: number;
}

export interface BalanceSheetReport {
  date: string;
  assets: ReportSection[];
  liabilities: ReportSection[];
  equity: ReportSection[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
}

export interface IncomeStatementReport {
  start_date: string;
  end_date: string;
  revenue: ReportSection[];
  expenses: ReportSection[];
  total_revenue: number;
  total_expenses: number;
  net_income: number;
}

export interface TrialBalanceReport {
  date: string;
  accounts: TrialBalanceAccount[];
  total_debits: number;
  total_credits: number;
}

export interface TrialBalanceAccount {
  code: string;
  name: string;
  debit: number;
  credit: number;
}

export interface GeneralLedgerReport {
  account: Account;
  start_date: string;
  end_date: string;
  opening_balance: number;
  transactions: LedgerTransaction[];
  closing_balance: number;
}

export interface LedgerTransaction {
  date: string;
  entry_number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface ReportSection {
  name: string;
  accounts: ReportAccount[];
  total: number;
}

export interface ReportAccount {
  code: string;
  name: string;
  amount: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

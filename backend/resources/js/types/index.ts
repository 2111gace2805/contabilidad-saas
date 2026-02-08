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
  rfc: string;
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
  entry_number: string;
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
  rfc: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  credit_limit: string;
  payment_terms: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  company_id: number;
  code: string;
  name: string;
  rfc: string | null;
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
  customer_id: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  balance: string;
  status: 'draft' | 'pending' | 'paid' | 'void';
  notes: string | null;
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
  supplier_id: number;
  bill_number: string;
  bill_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  balance: string;
  status: 'draft' | 'pending' | 'paid' | 'void';
  notes: string | null;
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
  code: string;
  name: string;
  description: string | null;
  unit_of_measure: string;
  current_quantity: string;
  minimum_quantity: string;
  average_cost: string;
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

// Laravel API Client Helper
// This replaces the Supabase client

import type * as Types from '../types';

const API_BASE = '/api';

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private static companyId: number | null = null;

  static setCompanyId(id: number | null) {
    this.companyId = id;
  }

  private static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (this.companyId) {
      headers['X-Company-Id'] = String(this.companyId);
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw error;
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  static async patch<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }
}

// Authentication helpers
export const auth = {
  async login(email: string, password: string) {
    const data = await ApiClient.post<{ user: Types.User; token: string }>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async register(name: string, email: string, password: string) {
    const data = await ApiClient.post<{ user: Types.User; token: string }>('/auth/register', {
      name,
      email,
      password,
      password_confirmation: password,
    });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  async logout() {
    await ApiClient.post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  async getUser() {
    return ApiClient.get<Types.User>('/auth/user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },
};

// Company API
export const companies = {
  async getAll() {
    return ApiClient.get<Types.CompanyUser[]>('/companies');
  },

  async getById(id: number) {
    return ApiClient.get<Types.CompanyUser>(`/companies/${id}`);
  },

  async create(data: Partial<Types.Company>) {
    return ApiClient.post<Types.Company>('/companies', data);
  },

  async update(id: number, data: Partial<Types.Company>) {
    return ApiClient.put<Types.Company>(`/companies/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/companies/${id}`);
  },

  async checkCanDelete(id: number) {
    return ApiClient.get<{ can_delete: boolean; has_transactions: boolean; message?: string }>(`/companies/${id}/can-delete`);
  },

  async select(id: number) {
    return ApiClient.post<{ message: string }>(`/companies/${id}/select`);
  },
};

// Account API
export const accounts = {
  async getAll() {
    return ApiClient.get<Types.Account[]>('/accounts');
  },

  async getHierarchy() {
    return ApiClient.get<Types.Account[]>('/accounts/hierarchy');
  },

  async getById(id: number) {
    return ApiClient.get<Types.Account>(`/accounts/${id}`);
  },

  async create(data: Partial<Types.Account>) {
    return ApiClient.post<Types.Account>('/accounts', data);
  },

  async update(id: number, data: Partial<Types.Account>) {
    return ApiClient.put<Types.Account>(`/accounts/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/accounts/${id}`);
  },

  async import(data: any[]) {
    return ApiClient.post('/accounts/import', data);
  },

  async search(term: string) {
    // Server-side search endpoint: /accounts?search=term
    return ApiClient.get<Types.Account[]>(`/accounts?search=${encodeURIComponent(term)}`);
  },
};

// Account Types API
export const accountTypes = {
  async getAll() {
    return ApiClient.get<Types.AccountType[]>('/account-types');
  },

  async getById(id: number) {
    return ApiClient.get<Types.AccountType>(`/account-types/${id}`);
  },

  async create(data: Partial<Types.AccountType>) {
    return ApiClient.post<Types.AccountType>('/account-types', data);
  },

  async update(id: number, data: Partial<Types.AccountType>) {
    return ApiClient.put<Types.AccountType>(`/account-types/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/account-types/${id}`);
  },
};

// Accounting Segments API
export const segments = {
  async getAll() {
    return ApiClient.get<Types.AccountingSegment[]>('/accounting-segments');
  },

  async getById(id: number) {
    return ApiClient.get<Types.AccountingSegment>(`/accounting-segments/${id}`);
  },

  async create(data: Partial<Types.AccountingSegment>) {
    return ApiClient.post<Types.AccountingSegment>('/accounting-segments', data);
  },

  async update(id: number, data: Partial<Types.AccountingSegment>) {
    return ApiClient.put<Types.AccountingSegment>(`/accounting-segments/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/accounting-segments/${id}`);
  },
};

// Accounting Periods API
export const periods = {
  async getAll() {
    return ApiClient.get<Types.AccountingPeriod[]>('/accounting-periods');
  },

  async getById(id: number) {
    return ApiClient.get<Types.AccountingPeriod>(`/accounting-periods/${id}`);
  },

  async create(data: Partial<Types.AccountingPeriod>) {
    return ApiClient.post<Types.AccountingPeriod>('/accounting-periods', data);
  },

  async update(id: number, data: Partial<Types.AccountingPeriod>) {
    return ApiClient.put<Types.AccountingPeriod>(`/accounting-periods/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/accounting-periods/${id}`);
  },

  async close(id: number) {
    return ApiClient.post<Types.AccountingPeriod>(`/accounting-periods/${id}/close`);
  },

  async open(id: number) {
    return ApiClient.post<Types.AccountingPeriod>(`/accounting-periods/${id}/open`);
  },
};

// Journal Entries API
export const journalEntries = {
  async getAll(params?: string | Record<string, any>) {
    let endpoint = '/journal-entries';
    if (params) {
      const queryString = typeof params === 'string' ? params : new URLSearchParams(params).toString();
      endpoint += `?${queryString}`;
    }
    return ApiClient.get<Types.JournalEntry[] | { data: Types.JournalEntry[] }>(endpoint);
  },

  async getById(id: number) {
    return ApiClient.get<Types.JournalEntry>(`/journal-entries/${id}`);
  },

  async create(data: Partial<Types.JournalEntry> & { lines?: Partial<Types.JournalEntryLine>[] }) {
    return ApiClient.post<Types.JournalEntry>('/journal-entries', data);
  },

  async update(id: number, data: Partial<Types.JournalEntry> & { lines?: Partial<Types.JournalEntryLine>[] }) {
    return ApiClient.put<Types.JournalEntry>(`/journal-entries/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/journal-entries/${id}`);
  },

  async post(id: number) {
    return ApiClient.post<Types.JournalEntry>(`/journal-entries/${id}/post`);
  },

  async requestVoid(id: number, reason: string) {
    return ApiClient.post<Types.JournalEntry>(`/journal-entries/${id}/request-void`, { reason });
  },

  async authorizeVoid(id: number) {
    return ApiClient.post<Types.JournalEntry>(`/journal-entries/${id}/authorize-void`);
  },

  async getPendingVoids() {
    return ApiClient.get<Types.JournalEntry[]>('/journal-entries/pending-voids');
  },
};

// Journal Entry Types API
export const journalEntryTypes = {
  async getAll() {
    return ApiClient.get<Types.JournalEntryType[]>('/journal-entry-types');
  },

  async create(data: Partial<Types.JournalEntryType>) {
    return ApiClient.post<Types.JournalEntryType>('/journal-entry-types', data);
  },

  async update(id: number, data: Partial<Types.JournalEntryType>) {
    return ApiClient.put<Types.JournalEntryType>(`/journal-entry-types/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/journal-entry-types/${id}`);
  },
};

// Customers API
export const customers = {
  async getAll() {
    return ApiClient.get<Types.Customer[]>('/customers');
  },

  async getById(id: number) {
    return ApiClient.get<Types.Customer>(`/customers/${id}`);
  },

  async create(data: Partial<Types.Customer>) {
    return ApiClient.post<Types.Customer>('/customers', data);
  },

  async update(id: number, data: Partial<Types.Customer>) {
    return ApiClient.put<Types.Customer>(`/customers/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/customers/${id}`);
  },
};

// Suppliers API
export const suppliers = {
  async getAll() {
    return ApiClient.get<Types.Supplier[]>('/suppliers');
  },

  async getById(id: number) {
    return ApiClient.get<Types.Supplier>(`/suppliers/${id}`);
  },

  async create(data: Partial<Types.Supplier>) {
    return ApiClient.post<Types.Supplier>('/suppliers', data);
  },

  async update(id: number, data: Partial<Types.Supplier>) {
    return ApiClient.put<Types.Supplier>(`/suppliers/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/suppliers/${id}`);
  },
};

// Invoices API
export const invoices = {
  async getAll() {
    return ApiClient.get<Types.Invoice[]>('/invoices');
  },

  async getById(id: number) {
    return ApiClient.get<Types.Invoice>(`/invoices/${id}`);
  },

  async create(data: Partial<Types.Invoice> & { lines?: Partial<Types.InvoiceLine>[] }) {
    return ApiClient.post<Types.Invoice>('/invoices', data);
  },

  async update(id: number, data: Partial<Types.Invoice> & { lines?: Partial<Types.InvoiceLine>[] }) {
    return ApiClient.put<Types.Invoice>(`/invoices/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/invoices/${id}`);
  },
};

// Catalogs (billing/customer related)
export const catalogs = {
  async getDepartments() {
    return ApiClient.get<{ id: string; name: string }[]>('/catalogs/departments');
  },

  async getMunicipalities(params?: { depa_id?: string }) {
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return ApiClient.get<any[]>(`/catalogs/municipalities${qs}`);
  },

  async getDistricts(params?: { municipality_id?: string }) {
    const qs = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return ApiClient.get<any[]>(`/catalogs/districts${qs}`);
  },

  async getCustomerTypes() {
    return ApiClient.get<any[]>('/catalogs/customer-types');
  },

  async getEconomicActivities() {
    return ApiClient.get<any[]>('/catalogs/economic-activities');
  },
};

// Bills API
export const bills = {
  async getAll() {
    return ApiClient.get<Types.Bill[]>('/bills');
  },

  async getById(id: number) {
    return ApiClient.get<Types.Bill>(`/bills/${id}`);
  },

  async create(data: Partial<Types.Bill> & { lines?: Partial<Types.BillLine>[] }) {
    return ApiClient.post<Types.Bill>('/bills', data);
  },

  async update(id: number, data: Partial<Types.Bill> & { lines?: Partial<Types.BillLine>[] }) {
    return ApiClient.put<Types.Bill>(`/bills/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/bills/${id}`);
  },
};

// Inventory Items API
export const inventoryItems = {
  async getAll() {
    return ApiClient.get<Types.InventoryItem[]>('/inventory-items');
  },

  async getById(id: number) {
    return ApiClient.get<Types.InventoryItem>(`/inventory-items/${id}`);
  },

  async create(data: Partial<Types.InventoryItem>) {
    return ApiClient.post<Types.InventoryItem>('/inventory-items', data);
  },

  async update(id: number, data: Partial<Types.InventoryItem>) {
    return ApiClient.put<Types.InventoryItem>(`/inventory-items/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/inventory-items/${id}`);
  },
};

// Bank Accounts API
export const bankAccounts = {
  async getAll() {
    return ApiClient.get<Types.BankAccount[]>('/bank-accounts');
  },

  async getById(id: number) {
    return ApiClient.get<Types.BankAccount>(`/bank-accounts/${id}`);
  },

  async create(data: Partial<Types.BankAccount>) {
    return ApiClient.post<Types.BankAccount>('/bank-accounts', data);
  },

  async update(id: number, data: Partial<Types.BankAccount>) {
    return ApiClient.put<Types.BankAccount>(`/bank-accounts/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/bank-accounts/${id}`);
  },
};

// Warehouses API
export const warehouses = {
  async getAll() {
    return ApiClient.get<any[]>('/warehouses');
  },

  async create(data: any) {
    return ApiClient.post<any>('/warehouses', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put<any>(`/warehouses/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/warehouses/${id}`);
  },
};

// Branches API
export const branches = {
  async getAll() {
    return ApiClient.get<any[]>('/branches');
  },

  async create(data: any) {
    return ApiClient.post<any>('/branches', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put<any>(`/branches/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/branches/${id}`);
  },
};

// Units of Measure API
export const unitsOfMeasure = {
  async getAll() {
    return ApiClient.get<any[]>('/units-of-measure');
  },

  async create(data: any) {
    return ApiClient.post<any>('/units-of-measure', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put<any>(`/units-of-measure/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/units-of-measure/${id}`);
  },
};

// Payment Methods API
export const paymentMethods = {
  async getAll() {
    return ApiClient.get<any[]>('/payment-methods');
  },

  async create(data: any) {
    return ApiClient.post<any>('/payment-methods', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put<any>(`/payment-methods/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/payment-methods/${id}`);
  },
};

// Document Types API
export const documentTypes = {
  async getAll() {
    return ApiClient.get<any[]>('/document-types');
  },

  async create(data: any) {
    return ApiClient.post<any>('/document-types', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put<any>(`/document-types/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/document-types/${id}`);
  },
};

// Accounting Segments API
export const accountingSegments = {
  async getAll() {
    return ApiClient.get<any[]>('/accounting-segments');
  },

  async create(data: any) {
    return ApiClient.post<any>('/accounting-segments', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put<any>(`/accounting-segments/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/accounting-segments/${id}`);
  },
};

// Accounting Periods API
export const accountingPeriods = {
  async getAll() {
    return ApiClient.get<any[]>('/accounting-periods');
  },

  async create(data: any) {
    return ApiClient.post<any>('/accounting-periods', data);
  },

  async generateYear(year: number) {
    return ApiClient.post<any>('/accounting-periods/generate-year', { year });
  },

  async close(id: number) {
    return ApiClient.post<any>(`/accounting-periods/${id}/close`, {});
  },

  async reopen(id: number) {
    return ApiClient.post<any>(`/accounting-periods/${id}/reopen`, {});
  },

  async delete(id: number) {
    return ApiClient.delete(`/accounting-periods/${id}`);
  },
};

// Taxes API
export const taxes = {
  async getAll(params?: any) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return ApiClient.get(`/taxes${query}`);
  },

  async getById(id: number) {
    return ApiClient.get(`/taxes/${id}`);
  },

  async create(data: any) {
    return ApiClient.post('/taxes', data);
  },

  async update(id: number, data: any) {
    return ApiClient.put(`/taxes/${id}`, data);
  },

  async delete(id: number) {
    return ApiClient.delete(`/taxes/${id}`);
  },
};

// Dashboard API
export const dashboard = {
  async getStats() {
    return ApiClient.get<Types.DashboardStats>('/dashboard');
  },

  async getSummary() {
    return ApiClient.get<Types.DashboardStats>('/dashboard/summary');
  },
};

// Reports API
export const reports = {
  async balanceSheet(params?: { date?: string }) {
    const query = params?.date ? `?date=${params.date}` : '';
    return ApiClient.get<Types.BalanceSheetReport>(`/reports/balance-sheet${query}`);
  },

  async incomeStatement(params?: { start_date?: string; end_date?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return ApiClient.get<Types.IncomeStatementReport>(`/reports/income-statement${query ? `?${query}` : ''}`);
  },

  async trialBalance(params?: { date?: string }) {
    const query = params?.date ? `?date=${params.date}` : '';
    return ApiClient.get<Types.TrialBalanceReport>(`/reports/trial-balance${query}`);
  },

  async generalLedger(params?: { account_id?: number; start_date?: string; end_date?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return ApiClient.get<Types.GeneralLedgerReport>(`/reports/general-ledger${query ? `?${query}` : ''}`);
  },
};

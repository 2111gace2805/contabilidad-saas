import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { ApiClient } from '../../lib/api';
import { FileText, Download, Filter } from 'lucide-react';

interface TrialBalanceItem {
  code: string;
  name: string;
  debit: number;
  credit: number;
  balance_debit: number;
  balance_credit: number;
  account_type_code: string;
}

interface BalanceSheetItem {
  code: string;
  name: string;
  amount: number;
  level: number;
}

interface AccountType {
  id: string;
  code: string;
  name: string;
}

interface PurchaseBookItem {
  invoice_date: string;
  invoice_number: string;
  supplier_name: string;
  supplier_tax_id: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  tax_name: string;
}

interface SalesBookItem {
  invoice_date: string;
  invoice_number: string;
  customer_name: string;
  customer_tax_id: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  tax_name: string;
}

interface CashFlowItem {
  entry_date: string;
  entry_number: string;
  description: string;
  account_code: string;
  account_name: string;
  inflow: number;
  outflow: number;
}

interface JournalBookItem {
  entry_date: string;
  entry_number: string;
  description: string;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
}

interface LedgerItem {
  entry_date: string;
  entry_number: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

type ReportType =
  | 'trial-balance'
  | 'balance-sheet'
  | 'income-statement'
  | 'purchase-book'
  | 'sales-book'
  | 'cash-flow'
  | 'journal-book'
  | 'general-ledger'
  | 'account-ledger';

export function Reports() {
  const { selectedCompany } = useCompany();
  const [reportType, setReportType] = useState<ReportType>('trial-balance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [selectedAccountTypes, setSelectedAccountTypes] = useState<string[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accounts, setAccounts] = useState<{ id: string; code: string; name: string; }[]>([]);

  const [trialBalance, setTrialBalance] = useState<TrialBalanceItem[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<{ assets: BalanceSheetItem[], liabilities: BalanceSheetItem[], equity: BalanceSheetItem[] }>({ assets: [], liabilities: [], equity: [] });
  const [incomeStatement, setIncomeStatement] = useState<{ revenue: BalanceSheetItem[], expenses: BalanceSheetItem[] }>({ revenue: [], expenses: [] });
  const [purchaseBook, setPurchaseBook] = useState<PurchaseBookItem[]>([]);
  const [salesBook, setSalesBook] = useState<SalesBookItem[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowItem[]>([]);
  const [journalBook, setJournalBook] = useState<JournalBookItem[]>([]);
  const [generalLedger, setGeneralLedger] = useState<Map<string, LedgerItem[]>>(new Map());
  const [accountLedger, setAccountLedger] = useState<{ account: any, items: LedgerItem[] } | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadAccountTypes();
      loadAccounts();
    }
  }, [selectedCompany]);

  const loadAccountTypes = async () => {
    if (!selectedCompany) return;

    try {
      const res = await ApiClient.get<any>('/account-types?per_page=100');
      // normalize response - Laravel pagination returns { data: [...] }
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setAccountTypes(list);
    } catch (error) {
      console.error('Error loading account types:', error);
    }
  };

  const loadAccounts = async () => {
    if (!selectedCompany) return;

    try {
      const res = await ApiClient.get<any>('/accounts?per_page=1000');
      // normalize response - Laravel pagination returns { data: [...] }
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setAccounts(list.map((a: any) => ({ id: String(a.id), code: a.code, name: a.name })));
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadTrialBalance = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      // Use backend report endpoint
      const res = await ApiClient.get<any>(`/reports/trial-balance?date=${encodeURIComponent(endDate)}`);
      const payload = res && res.balances ? res.balances : (Array.isArray(res) ? res : (res?.data ?? []));

      const balances = (payload as any[]).map((row: any) => {
        const account = row.account ?? row.account_data ?? {};
        const accountType = account.account_type ?? account.accountType ?? {};
        const code = account.code ?? '';
        const name = account.name ?? '';
        const debit = Number(row.debits ?? row.debit ?? 0);
        const credit = Number(row.credits ?? row.credit ?? 0);
        const balance = Number(row.balance ?? debit - credit);

        if (selectedAccountTypes.length > 0 && !selectedAccountTypes.includes(accountType.code)) {
          return null;
        }

        return {
          code,
          name,
          debit,
          credit,
          balance_debit: balance > 0 ? balance : 0,
          balance_credit: balance < 0 ? Math.abs(balance) : 0,
          account_type_code: accountType.code ?? '',
        } as TrialBalanceItem;
      }).filter(Boolean) as TrialBalanceItem[];

      balances.sort((a, b) => a.code.localeCompare(b.code));
      setTrialBalance(balances);
    } catch (error) {
      console.error('Error loading trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalanceSheet = async () => {
    if (!selectedCompany || !endDate) return;

    setLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select(`
          id,
          code,
          name,
          level,
          account_types!inner(code, affects_balance)
        `)
        .eq('company_id', selectedCompany.id)
        .eq('active', true)
        .eq('account_types.affects_balance', true)
        .order('code');

      if (accountsError) throw accountsError;

      const { data: linesData, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`
          account_id,
          debit,
          credit,
          journal_entries!inner(company_id, entry_date, status)
        `)
        .eq('journal_entries.company_id', selectedCompany.id)
        .eq('journal_entries.status', 'posted')
        .lte('journal_entries.entry_date', endDate);

      if (linesError) throw linesError;

      const accountBalances = new Map<string, number>();
      linesData?.forEach((line: any) => {
        const current = accountBalances.get(line.account_id) || 0;
        accountBalances.set(line.account_id, current + Number(line.debit) - Number(line.credit));
      });

      const assets: BalanceSheetItem[] = [];
      const liabilities: BalanceSheetItem[] = [];
      const equity: BalanceSheetItem[] = [];

      accountsData?.forEach((account: any) => {
        const balance = accountBalances.get(account.id) || 0;
        if (Math.abs(balance) < 0.01) return;

        const item: BalanceSheetItem = {
          code: account.code,
          name: account.name,
          amount: Math.abs(balance),
          level: account.level,
        };

        const typeCode = account.account_types.code;
        if (typeCode === 'ACTIVO') {
          assets.push(item);
        } else if (typeCode === 'PASIVO') {
          liabilities.push(item);
        } else if (typeCode === 'CAPITAL') {
          equity.push(item);
        }
      });

      setBalanceSheet({ assets, liabilities, equity });
    } catch (error) {
      console.error('Error loading balance sheet:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeStatement = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select(`
          id,
          code,
          name,
          level,
          account_types!inner(code, affects_results)
        `)
        .eq('company_id', selectedCompany.id)
        .eq('active', true)
        .eq('account_types.affects_results', true)
        .order('code');

      if (accountsError) throw accountsError;

      const { data: linesData, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`
          account_id,
          debit,
          credit,
          journal_entries!inner(company_id, entry_date, status)
        `)
        .eq('journal_entries.company_id', selectedCompany.id)
        .eq('journal_entries.status', 'posted')
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate);

      if (linesError) throw linesError;

      const accountBalances = new Map<string, number>();
      linesData?.forEach((line: any) => {
        const current = accountBalances.get(line.account_id) || 0;
        accountBalances.set(line.account_id, current + Number(line.credit) - Number(line.debit));
      });

      const revenue: BalanceSheetItem[] = [];
      const expenses: BalanceSheetItem[] = [];

      accountsData?.forEach((account: any) => {
        const balance = accountBalances.get(account.id) || 0;
        if (Math.abs(balance) < 0.01) return;

        const item: BalanceSheetItem = {
          code: account.code,
          name: account.name,
          amount: Math.abs(balance),
          level: account.level,
        };

        const typeCode = account.account_types.code;
        if (typeCode === 'INGRESOS') {
          revenue.push(item);
        } else if (typeCode === 'EGRESOS' || typeCode === 'COSTOS') {
          expenses.push(item);
        }
      });

      setIncomeStatement({ revenue, expenses });
    } catch (error) {
      console.error('Error loading income statement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseBook = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select(`
          id,
          invoice_date,
          invoice_number,
          subtotal,
          tax_amount,
          total,
          suppliers(name, tax_id),
          taxes(name)
        `)
        .eq('company_id', selectedCompany.id)
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .order('invoice_date');

      if (error) throw error;

      const items: PurchaseBookItem[] = data?.map((inv: any) => ({
        invoice_date: inv.invoice_date,
        invoice_number: inv.invoice_number,
        supplier_name: inv.suppliers?.name || 'N/A',
        supplier_tax_id: inv.suppliers?.tax_id || 'N/A',
        subtotal: Number(inv.subtotal),
        tax_amount: Number(inv.tax_amount),
        total: Number(inv.total),
        tax_name: inv.taxes?.name || 'N/A',
      })) || [];

      setPurchaseBook(items);
    } catch (error) {
      console.error('Error loading purchase book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesBook = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sale_invoices')
        .select(`
          id,
          invoice_date,
          invoice_number,
          subtotal,
          tax_amount,
          total,
          customers(name, tax_id),
          taxes(name)
        `)
        .eq('company_id', selectedCompany.id)
        .gte('invoice_date', startDate)
        .lte('invoice_date', endDate)
        .order('invoice_date');

      if (error) throw error;

      const items: SalesBookItem[] = data?.map((inv: any) => ({
        invoice_date: inv.invoice_date,
        invoice_number: inv.invoice_number,
        customer_name: inv.customers?.name || 'N/A',
        customer_tax_id: inv.customers?.tax_id || 'N/A',
        subtotal: Number(inv.subtotal),
        tax_amount: Number(inv.tax_amount),
        total: Number(inv.total),
        tax_name: inv.taxes?.name || 'N/A',
      })) || [];

      setSalesBook(items);
    } catch (error) {
      console.error('Error loading sales book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCashFlow = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('id, code, name')
        .eq('company_id', selectedCompany.id)
        .eq('active', true)
        .or('code.like.1101%,code.like.1102%');

      if (accountsError) throw accountsError;

      const cashAccountIds = accountsData?.map(acc => acc.id) || [];

      if (cashAccountIds.length === 0) {
        setCashFlow([]);
        setLoading(false);
        return;
      }

      const { data: linesData, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`
          account_id,
          debit,
          credit,
          description,
          journal_entries!inner(entry_date, entry_number, status, company_id),
          accounts!inner(code, name)
        `)
        .eq('journal_entries.company_id', selectedCompany.id)
        .eq('journal_entries.status', 'posted')
        .in('account_id', cashAccountIds)
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate)
        .order('journal_entries.entry_date');

      if (linesError) throw linesError;

      const items: CashFlowItem[] = linesData?.map((line: any) => ({
        entry_date: line.journal_entries.entry_date,
        entry_number: line.journal_entries.entry_number,
        description: line.description || line.journal_entries.description || '',
        account_code: line.accounts.code,
        account_name: line.accounts.name,
        inflow: Number(line.debit),
        outflow: Number(line.credit),
      })) || [];

      setCashFlow(items);
    } catch (error) {
      console.error('Error loading cash flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJournalBook = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data: linesData, error } = await supabase
        .from('journal_entry_lines')
        .select(`
          debit,
          credit,
          description,
          journal_entries!inner(entry_date, entry_number, description, status, company_id),
          accounts!inner(code, name)
        `)
        .eq('journal_entries.company_id', selectedCompany.id)
        .eq('journal_entries.status', 'posted')
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate)
        .order('journal_entries.entry_date')
        .order('journal_entries.entry_number');

      if (error) throw error;

      const items: JournalBookItem[] = linesData?.map((line: any) => ({
        entry_date: line.journal_entries.entry_date,
        entry_number: line.journal_entries.entry_number,
        description: line.description || line.journal_entries.description || '',
        account_code: line.accounts.code,
        account_name: line.accounts.name,
        debit: Number(line.debit),
        credit: Number(line.credit),
      })) || [];

      setJournalBook(items);
    } catch (error) {
      console.error('Error loading journal book:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGeneralLedger = async () => {
    if (!selectedCompany || !startDate || !endDate) return;

    setLoading(true);
    try {
      const { data: linesData, error } = await supabase
        .from('journal_entry_lines')
        .select(`
          account_id,
          debit,
          credit,
          description,
          journal_entries!inner(entry_date, entry_number, description, status, company_id),
          accounts!inner(code, name)
        `)
        .eq('journal_entries.company_id', selectedCompany.id)
        .eq('journal_entries.status', 'posted')
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate)
        .order('accounts.code')
        .order('journal_entries.entry_date')
        .order('journal_entries.entry_number');

      if (error) throw error;

      const ledgerMap = new Map<string, LedgerItem[]>();

      linesData?.forEach((line: any) => {
        const accountKey = `${line.accounts.code}|${line.accounts.name}`;

        if (!ledgerMap.has(accountKey)) {
          ledgerMap.set(accountKey, []);
        }

        const items = ledgerMap.get(accountKey)!;
        const previousBalance = items.length > 0 ? items[items.length - 1].balance : 0;
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        const balance = previousBalance + debit - credit;

        items.push({
          entry_date: line.journal_entries.entry_date,
          entry_number: line.journal_entries.entry_number,
          description: line.description || line.journal_entries.description || '',
          debit,
          credit,
          balance,
        });
      });

      setGeneralLedger(ledgerMap);
    } catch (error) {
      console.error('Error loading general ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountLedger = async () => {
    if (!selectedCompany || !startDate || !endDate || !selectedAccountId) return;

    setLoading(true);
    try {
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('id, code, name')
        .eq('id', selectedAccountId)
        .maybeSingle();

      if (accountError) throw accountError;
      if (!accountData) {
        setAccountLedger(null);
        setLoading(false);
        return;
      }

      const { data: linesData, error: linesError } = await supabase
        .from('journal_entry_lines')
        .select(`
          debit,
          credit,
          description,
          journal_entries!inner(entry_date, entry_number, description, status, company_id)
        `)
        .eq('account_id', selectedAccountId)
        .eq('journal_entries.company_id', selectedCompany.id)
        .eq('journal_entries.status', 'posted')
        .gte('journal_entries.entry_date', startDate)
        .lte('journal_entries.entry_date', endDate)
        .order('journal_entries.entry_date')
        .order('journal_entries.entry_number');

      if (linesError) throw linesError;

      const items: LedgerItem[] = [];
      let balance = 0;

      linesData?.forEach((line: any) => {
        const debit = Number(line.debit);
        const credit = Number(line.credit);
        balance += debit - credit;

        items.push({
          entry_date: line.journal_entries.entry_date,
          entry_number: line.journal_entries.entry_number,
          description: line.description || line.journal_entries.description || '',
          debit,
          credit,
          balance,
        });
      });

      setAccountLedger({ account: accountData, items });
    } catch (error) {
      console.error('Error loading account ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    switch (reportType) {
      case 'trial-balance':
        loadTrialBalance();
        break;
      case 'balance-sheet':
        loadBalanceSheet();
        break;
      case 'income-statement':
        loadIncomeStatement();
        break;
      case 'purchase-book':
        loadPurchaseBook();
        break;
      case 'sales-book':
        loadSalesBook();
        break;
      case 'cash-flow':
        loadCashFlow();
        break;
      case 'journal-book':
        loadJournalBook();
        break;
      case 'general-ledger':
        loadGeneralLedger();
        break;
      case 'account-ledger':
        loadAccountLedger();
        break;
    }
  };

  if (!selectedCompany) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">Selecciona una empresa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Reportes Financieros</h2>
        <p className="text-slate-600">Estados financieros y libros contables</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <optgroup label="Estados Financieros">
                <option value="trial-balance">Balanza de Comprobación</option>
                <option value="balance-sheet">Balance General</option>
                <option value="income-statement">Estado de Resultados</option>
                <option value="cash-flow">Flujo de Efectivo</option>
              </optgroup>
              <optgroup label="Libros Fiscales">
                <option value="purchase-book">Libro de Compras (IVA)</option>
                <option value="sales-book">Libro de Ventas (IVA)</option>
              </optgroup>
              <optgroup label="Libros Contables">
                <option value="journal-book">Libro Diario</option>
                <option value="general-ledger">Libro Mayor</option>
                <option value="account-ledger">Auxiliar de Cuenta</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Generando...' : 'Generar'}
            </button>
          </div>
        </div>

        {reportType === 'account-ledger' && (
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Cuenta</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Seleccione una cuenta...</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'trial-balance' && accountTypes.length > 0 && (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <label className="text-sm font-medium text-slate-700">Filtrar por Tipos de Cuenta</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {accountTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAccountTypes.includes(type.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccountTypes([...selectedAccountTypes, type.code]);
                      } else {
                        setSelectedAccountTypes(selectedAccountTypes.filter(code => code !== type.code));
                      }
                    }}
                    className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{type.name}</span>
                </label>
              ))}
              {selectedAccountTypes.length > 0 && (
                <button
                  onClick={() => setSelectedAccountTypes([])}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {reportType === 'trial-balance' && trialBalance.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Balanza de Comprobación</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Cuenta</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Debe</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Haber</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Saldo Deudor</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Saldo Acreedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalance.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm font-mono text-slate-700">{item.code}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.balance_debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.balance_credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="px-4 py-3 text-sm text-slate-800">TOTALES</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${trialBalance.reduce((sum, item) => sum + item.debit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${trialBalance.reduce((sum, item) => sum + item.credit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${trialBalance.reduce((sum, item) => sum + item.balance_debit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${trialBalance.reduce((sum, item) => sum + item.balance_credit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'balance-sheet' && (balanceSheet.assets.length > 0 || balanceSheet.liabilities.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Balance General</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200">
            <div className="p-6">
              <h4 className="font-bold text-slate-800 mb-4">ACTIVO</h4>
              {balanceSheet.assets.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-800" style={{ paddingLeft: `${item.level * 1}rem` }}>
                    {item.code} - {item.name}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3 mt-2 font-bold text-slate-800 border-t-2 border-slate-300">
                <span>TOTAL ACTIVO</span>
                <span>${balanceSheet.assets.reduce((sum, item) => sum + item.amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-slate-800 mb-4">PASIVO Y CAPITAL</h4>
              <div className="mb-6">
                <h5 className="font-semibold text-slate-700 mb-2">Pasivo</h5>
                {balanceSheet.liabilities.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-800" style={{ paddingLeft: `${item.level * 1}rem` }}>
                      {item.code} - {item.name}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <h5 className="font-semibold text-slate-700 mb-2">Capital Contable</h5>
                {balanceSheet.equity.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-800" style={{ paddingLeft: `${item.level * 1}rem` }}>
                      {item.code} - {item.name}
                    </span>
                    <span className="text-sm font-medium text-slate-800">
                      ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-3 mt-2 font-bold text-slate-800 border-t-2 border-slate-300">
                <span>TOTAL PASIVO Y CAPITAL</span>
                <span>
                  ${(
                    balanceSheet.liabilities.reduce((sum, item) => sum + item.amount, 0) +
                    balanceSheet.equity.reduce((sum, item) => sum + item.amount, 0)
                  ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'income-statement' && (incomeStatement.revenue.length > 0 || incomeStatement.expenses.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Estado de Resultados</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-4">INGRESOS</h4>
              {incomeStatement.revenue.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-800" style={{ paddingLeft: `${item.level * 1}rem` }}>
                    {item.code} - {item.name}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-semibold text-slate-800 border-t border-slate-300">
                <span>TOTAL INGRESOS</span>
                <span>${incomeStatement.revenue.reduce((sum, item) => sum + item.amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-4">EGRESOS</h4>
              {incomeStatement.expenses.map((item, index) => (
                <div key={index} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-800" style={{ paddingLeft: `${item.level * 1}rem` }}>
                    {item.code} - {item.name}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-3 font-semibold text-slate-800 border-t border-slate-300">
                <span>TOTAL EGRESOS</span>
                <span>${incomeStatement.expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex justify-between py-4 text-lg font-bold text-slate-800 border-t-2 border-slate-800">
              <span>UTILIDAD/PÉRDIDA NETA</span>
              <span className={
                incomeStatement.revenue.reduce((sum, item) => sum + item.amount, 0) -
                incomeStatement.expenses.reduce((sum, item) => sum + item.amount, 0) >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }>
                ${(
                  incomeStatement.revenue.reduce((sum, item) => sum + item.amount, 0) -
                  incomeStatement.expenses.reduce((sum, item) => sum + item.amount, 0)
                ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {reportType === 'purchase-book' && purchaseBook.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Libro de Compras (IVA)</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Factura</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Proveedor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">NIT/DUI</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Subtotal</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">IVA</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseBook.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-slate-800">
                      {new Date(item.invoice_date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.invoice_number}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.supplier_name}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.supplier_tax_id}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.tax_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-slate-800">TOTALES</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${purchaseBook.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${purchaseBook.reduce((sum, item) => sum + item.tax_amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${purchaseBook.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'sales-book' && salesBook.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Libro de Ventas (IVA)</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Factura</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">NIT/DUI</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Subtotal</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">IVA</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesBook.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-slate-800">
                      {new Date(item.invoice_date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.invoice_number}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.customer_name}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.customer_tax_id}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.tax_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      ${item.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-slate-800">TOTALES</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${salesBook.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${salesBook.reduce((sum, item) => sum + item.tax_amount, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${salesBook.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'cash-flow' && cashFlow.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Flujo de Efectivo</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Póliza</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Cuenta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Descripción</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Entradas</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Salidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashFlow.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-slate-800">
                      {new Date(item.entry_date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.entry_number}</td>
                    <td className="px-4 py-2 text-sm font-mono text-slate-700">
                      {item.account_code} - {item.account_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                      {item.inflow > 0 && `$${item.inflow.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-red-600 font-medium">
                      {item.outflow > 0 && `$${item.outflow.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-slate-800">TOTALES</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">
                    ${cashFlow.reduce((sum, item) => sum + item.inflow, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-red-600">
                    ${cashFlow.reduce((sum, item) => sum + item.outflow, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-slate-800">FLUJO NETO</td>
                  <td colSpan={2} className={`px-4 py-3 text-sm text-right ${
                    cashFlow.reduce((sum, item) => sum + item.inflow - item.outflow, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${cashFlow.reduce((sum, item) => sum + item.inflow - item.outflow, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'journal-book' && journalBook.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Libro Diario</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Póliza</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Cuenta</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Descripción</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Debe</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Haber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalBook.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-slate-800">
                      {new Date(item.entry_date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.entry_number}</td>
                    <td className="px-4 py-2 text-sm font-mono text-slate-700">
                      {item.account_code} - {item.account_name}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      {item.debit > 0 && `$${item.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      {item.credit > 0 && `$${item.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={4} className="px-4 py-3 text-sm text-slate-800">TOTALES</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${journalBook.reduce((sum, item) => sum + item.debit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${journalBook.reduce((sum, item) => sum + item.credit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'general-ledger' && generalLedger.size > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Libro Mayor</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="p-6 space-y-8">
            {Array.from(generalLedger.entries()).map(([accountKey, items]) => {
              const [code, name] = accountKey.split('|');
              return (
                <div key={accountKey} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h4 className="font-bold text-slate-800">{code} - {name}</h4>
                  </div>
                  <table className="w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Fecha</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Póliza</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">Descripción</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Debe</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Haber</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-700">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-xs text-slate-800">
                            {new Date(item.entry_date).toLocaleDateString('es-MX')}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-800">{item.entry_number}</td>
                          <td className="px-4 py-2 text-xs text-slate-800">{item.description}</td>
                          <td className="px-4 py-2 text-xs text-right text-slate-800">
                            {item.debit > 0 && `$${item.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="px-4 py-2 text-xs text-right text-slate-800">
                            {item.credit > 0 && `$${item.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="px-4 py-2 text-xs text-right font-medium text-slate-800">
                            ${item.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={3} className="px-4 py-2 text-xs text-slate-800">TOTALES</td>
                        <td className="px-4 py-2 text-xs text-right text-slate-800">
                          ${items.reduce((sum, item) => sum + item.debit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-xs text-right text-slate-800">
                          ${items.reduce((sum, item) => sum + item.credit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2 text-xs text-right text-slate-800">
                          ${items[items.length - 1].balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reportType === 'account-ledger' && accountLedger && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">Auxiliar de Cuenta</h3>
            <p className="text-sm text-slate-600">
              {selectedCompany.name} - {accountLedger.account.code} - {accountLedger.account.name}
            </p>
            <p className="text-sm text-slate-600">
              Del {new Date(startDate).toLocaleDateString('es-MX')} al {new Date(endDate).toLocaleDateString('es-MX')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Póliza</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Descripción</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Debe</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Haber</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accountLedger.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-slate-800">
                      {new Date(item.entry_date).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.entry_number}</td>
                    <td className="px-4 py-2 text-sm text-slate-800">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      {item.debit > 0 && `$${item.debit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-slate-800">
                      {item.credit > 0 && `$${item.credit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-slate-800">
                      ${item.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="px-4 py-3 text-sm text-slate-800">TOTALES</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${accountLedger.items.reduce((sum, item) => sum + item.debit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${accountLedger.items.reduce((sum, item) => sum + item.credit, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">
                    ${accountLedger.items[accountLedger.items.length - 1]?.balance.toLocaleString('es-MX', { minimumFractionDigits: 2 }) || '0.00'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

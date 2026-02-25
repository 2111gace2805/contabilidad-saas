import { useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { ApiClient } from '../../lib/api';
import { Download, FileText } from 'lucide-react';

type ReportType =
  | 'trial-balance'
  | 'balance-sheet'
  | 'income-statement'
  | 'purchase-book'
  | 'sales-book-consumer'
  | 'sales-book-taxpayer'
  | 'cash-flow'
  | 'journal-book'
  | 'general-ledger'
  | 'account-ledger'
  | 'accounts-receivable'
  | 'accounts-payable'
  | 'inventory'
  | 'fiscal';

type ExportFormat = 'csv' | 'excel' | 'xml' | 'json';

interface Option {
  value: ReportType;
  label: string;
}

interface AccountOption {
  id: string;
  code: string;
  name: string;
}

const REPORT_OPTIONS: Option[] = [
  { value: 'trial-balance', label: 'Balance de Comprobación' },
  { value: 'balance-sheet', label: 'Balance General' },
  { value: 'income-statement', label: 'Estado de Resultados' },
  { value: 'purchase-book', label: 'Libro IVA Compras' },
  { value: 'sales-book-consumer', label: 'Libro IVA Ventas Consumidor Final' },
  { value: 'sales-book-taxpayer', label: 'Libro IVA Ventas Contribuyente' },
  { value: 'cash-flow', label: 'Flujo de Efectivo' },
  { value: 'journal-book', label: 'Libro Diario' },
  { value: 'general-ledger', label: 'Libro Mayor General' },
  { value: 'account-ledger', label: 'Libro Mayor por Cuenta' },
  { value: 'accounts-receivable', label: 'Cuentas por Cobrar' },
  { value: 'accounts-payable', label: 'Cuentas por Pagar' },
  { value: 'inventory', label: 'Existencias en Inventario' },
  { value: 'fiscal', label: 'Reporte Fiscal (IVA/ISR)' },
];

const EXPORT_FORMATS: ExportFormat[] = ['csv', 'excel', 'xml', 'json'];

function getApiBase(): string {
  const runtimeBase = import.meta.env.VITE_API_URL as string | undefined;
  if (runtimeBase) return runtimeBase.endsWith('/') ? runtimeBase.slice(0, -1) : runtimeBase;
  if (window.location.port === '5173') {
    return `${window.location.protocol}//${window.location.hostname}:8000/api`;
  }
  return `${window.location.origin}/api`;
}

function toRows(payload: any): Array<Record<string, any>> {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload;
  }

  const keys = ['items', 'balances', 'transactions', 'assets', 'liabilities', 'equity', 'revenue', 'expenses'];
  for (const key of keys) {
    if (Array.isArray(payload[key])) {
      if (['assets', 'liabilities', 'equity', 'revenue', 'expenses'].includes(key)) {
        return payload[key].map((row: any) => ({ section: key, ...row }));
      }
      return payload[key];
    }
  }

  if (payload.account && Array.isArray(payload.transactions)) {
    return payload.transactions.map((row: any) => ({
      account_code: payload.account?.code,
      account_name: payload.account?.name,
      ...row,
    }));
  }

  return [payload];
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value.toLocaleString('es-SV', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function Reports() {
  const { selectedCompany } = useCompany();
  const [reportType, setReportType] = useState<ReportType>('trial-balance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), 0, 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadAccounts();
    }
  }, [selectedCompany]);

  const columns = useMemo(() => {
    if (rows.length === 0) return [] as string[];
    const allKeys = new Set<string>();
    rows.forEach((row) => Object.keys(row).forEach((k) => allKeys.add(k)));
    return Array.from(allKeys);
  }, [rows]);

  const loadAccounts = async () => {
    try {
      const res = await ApiClient.get<any>('/accounts?per_page=1000');
      const list = Array.isArray(res) ? res : (res?.data ?? []);
      setAccounts(list.map((a: any) => ({ id: String(a.id), code: a.code, name: a.name })));
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const getEndpoint = (): string => {
    const params = new URLSearchParams();
    if (startDate) params.append('date_from', startDate);
    if (endDate) params.append('date_to', endDate);

    switch (reportType) {
      case 'trial-balance': {
        const query = endDate ? `date=${encodeURIComponent(endDate)}` : '';
        return `/reports/trial-balance${query ? `?${query}` : ''}`;
      }
      case 'balance-sheet': {
        const query = endDate ? `date=${encodeURIComponent(endDate)}` : '';
        return `/reports/balance-sheet${query ? `?${query}` : ''}`;
      }
      case 'income-statement':
        return `/reports/income-statement?${params.toString()}`;
      case 'purchase-book':
        return `/reports/purchase-book?${params.toString()}`;
      case 'sales-book-consumer':
        return `/reports/sales-book-consumer?${params.toString()}`;
      case 'sales-book-taxpayer':
        return `/reports/sales-book-taxpayer?${params.toString()}`;
      case 'cash-flow':
        return `/reports/cash-flow?${params.toString()}`;
      case 'journal-book':
        return `/reports/journal-book?${params.toString()}`;
      case 'general-ledger':
        return `/reports/general-ledger?${params.toString()}`;
      case 'account-ledger': {
        const accountParams = new URLSearchParams(params);
        if (selectedAccountId) accountParams.append('account_id', selectedAccountId);
        return `/reports/general-ledger?${accountParams.toString()}`;
      }
      case 'accounts-receivable':
        return `/reports/accounts-receivable?${params.toString()}`;
      case 'accounts-payable':
        return `/reports/accounts-payable?${params.toString()}`;
      case 'inventory':
        return '/reports/inventory';
      case 'fiscal':
        return `/reports/fiscal?${params.toString()}`;
      default:
        return '/reports/trial-balance';
    }
  };

  const runReport = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const endpoint = getEndpoint();
      const payload = await ApiClient.get<any>(endpoint);
      setRows(toRows(payload));

      const baseSummary: Record<string, any> = {};
      Object.keys(payload || {}).forEach((key) => {
        if (!Array.isArray(payload[key]) && typeof payload[key] !== 'object') {
          baseSummary[key] = payload[key];
        }
      });
      setSummary(baseSummary);
    } catch (error) {
      console.error('Error loading report:', error);
      setRows([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: ExportFormat) => {
    if (!selectedCompany) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const params = new URLSearchParams();
      if (startDate) params.append('date_from', startDate);
      if (endDate) params.append('date_to', endDate);
      if (reportType === 'account-ledger' && selectedAccountId) params.append('account_id', selectedAccountId);

      const url = `${getApiBase()}/reports/export/${reportType}/${format}${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
          'X-Company-Id': String(selectedCompany.id),
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed (${response.status})`);
      }

      const blob = await response.blob();
      const fileExt = format === 'excel' ? 'xls' : format;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${reportType}.${fileExt}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-company-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Reportes Contables</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {REPORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {reportType === 'account-ledger' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Todas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={runReport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-company-primary px-4 py-2 text-sm font-medium text-white opacity-95 hover:opacity-100 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {loading ? 'Generando...' : 'Generar'}
          </button>

          {EXPORT_FORMATS.map((format) => (
            <button
              key={format}
              onClick={() => downloadReport(format)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Resultados</h3>

        {Object.keys(summary).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="rounded-md border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm font-semibold text-gray-900">{formatCellValue(value)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    {column.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((row, index) => (
                <tr key={`${index}-${row.id ?? ''}`}>
                  {columns.map((column) => (
                    <td key={`${index}-${column}`} className="px-3 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && rows.length === 0 && (
          <p className="text-sm text-gray-500 mt-3">No hay datos para los filtros seleccionados.</p>
        )}
      </div>
    </div>
  );
}

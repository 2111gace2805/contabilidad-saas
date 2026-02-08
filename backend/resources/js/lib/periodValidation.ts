import { ApiClient } from './api';

export interface AccountingPeriod {
  id: string | number;
  company_id: string | number;
  period_type: 'monthly' | 'annual';
  fiscal_year: number;
  period_number: number;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed';
  closed_at: string | null;
  closed_by: string | null;
  closing_entry_id: string | null;
  notes: string | null;
  created_at: string;
}

export async function isPeriodClosed(
  companyId: string | number,
  transactionDate: string | Date
): Promise<boolean> {
  try {
    const dateStr = transactionDate instanceof Date
      ? transactionDate.toISOString().split('T')[0]
      : transactionDate;

    const response = await ApiClient.get<any[]>(
      `/accounting-periods?is_closed=1&start_date_lte=${dateStr}&end_date_gte=${dateStr}`
    );

    const periods = Array.isArray(response) ? response : (response.data || []);
    return periods.length > 0;
  } catch (error) {
    console.error('Error checking period:', error);
    return false;
  }
}

export async function validatePeriodForTransaction(
  companyId: string | number,
  transactionDate: string | Date
): Promise<{ valid: boolean; message?: string }> {
  const closed = await isPeriodClosed(companyId, transactionDate);

  if (closed) {
    return {
      valid: false,
      message: 'No se pueden crear o modificar transacciones en periodos cerrados. Verifique que el periodo contable esté abierto.'
    };
  }

  return { valid: true };
}

export async function getOpenPeriods(companyId: string | number): Promise<AccountingPeriod[]> {
  try {
    const response = await ApiClient.get<any[]>('/accounting-periods?is_closed=0');
    const periods = Array.isArray(response) ? response : (response.data || []);
    return periods.sort((a, b) => {
      if (a.fiscal_year !== b.fiscal_year) return b.fiscal_year - a.fiscal_year;
      return b.period_number - a.period_number;
    });
  } catch (error) {
    console.error('Error loading open periods:', error);
    return [];
  }
}

export async function getAllPeriods(companyId: string | number): Promise<AccountingPeriod[]> {
  try {
    const response = await ApiClient.get<any[]>('/accounting-periods');
    const periods = Array.isArray(response) ? response : (response.data || []);
    return periods.sort((a, b) => {
      if (a.fiscal_year !== b.fiscal_year) return b.fiscal_year - a.fiscal_year;
      return b.period_number - a.period_number;
    });
  } catch (error) {
    console.error('Error loading periods:', error);
    return [];
  }
}

export function canModifyEntry(entryStatus: string, entryDate: string, periodClosed: boolean): boolean {
  if (entryStatus === 'posted') return false;
  if (periodClosed) return false;
  return true;
}

export function canDeleteEntry(entryStatus: string, entryDate: string, periodClosed: boolean): boolean {
  if (entryStatus !== 'draft') return false;
  if (periodClosed) return false;
  return true;
}

export function getStatusBadgeColor(status: 'open' | 'closed'): string {
  return status === 'open'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
}

export function getEntryStatusBadgeColor(status: string): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'posted':
      return 'bg-blue-100 text-blue-800';
    case 'void':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function formatPeriodName(period: AccountingPeriod): string {
  if (period.period_type === 'annual') {
    return `Año Fiscal ${period.fiscal_year}`;
  }
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return `${monthNames[period.period_number - 1]} ${period.fiscal_year}`;
}

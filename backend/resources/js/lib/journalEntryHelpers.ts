import { ApiClient, journalEntries } from './api';

export type EntryType = 'PD' | 'PV' | 'PC' | 'PB' | 'PCJ' | 'PA';

export interface JournalEntryLine {
  account_id: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface CreateJournalEntryParams {
  companyId: string;
  entryDate: string;
  entryType: EntryType;
  description: string;
  lines: JournalEntryLine[];
  sourceModule?: string;
  sourceId?: string;
  createdBy: string;
}

export async function getNextEntryNumber(
  companyId: string,
  entryType: EntryType,
  entryDate: string
): Promise<string> {
  try {
    const res = await ApiClient.post<{ next_number: string }>(`/rpc/get_next_entry_number`, {
      p_company_id: companyId,
      p_entry_type: entryType,
      p_entry_date: entryDate,
    });
    // backend may return { next_number: '...' } or raw string
    if (typeof res === 'string') return res;
    return (res && (res.next_number || res)) as any;
  } catch (err: any) {
    throw err;
  }
}

export async function createAutomaticJournalEntry(
  params: CreateJournalEntryParams
): Promise<string> {
  const {
    companyId,
    entryDate,
    entryType,
    description,
    lines,
    sourceModule,
    sourceId,
    createdBy,
  } = params;

  const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(
      `La partida no está balanceada. Débitos: ${totalDebit}, Créditos: ${totalCredit}`
    );
  }

  const entryNumber = await getNextEntryNumber(companyId, entryType, entryDate);

  const payload = {
    company_id: companyId,
    entry_number: entryNumber,
    entry_date: entryDate,
    entry_type: entryType,
    description,
    status: 'posted',
    auto_generated: true,
    source_module: sourceModule,
    source_id: sourceId,
    created_by: createdBy,
    posted_at: new Date().toISOString(),
    lines: lines.map((line) => ({
      account_id: line.account_id,
      debit: line.debit,
      credit: line.credit,
      description: line.description || description,
    })),
  };

  try {
    const created = await journalEntries.create(payload as any);
    return (created as any).id;
  } catch (err: any) {
    throw err;
  }
}

export async function getAccountByCode(
  companyId: string,
  accountCode: string
): Promise<string | null> {
  try {
    const res = await ApiClient.get<any[]>(`/accounts?company_id=${companyId}&code=${encodeURIComponent(accountCode)}`);
    if (Array.isArray(res) && res.length > 0) return res[0].id;
    if (res && res.id) return res.id;
    return null;
  } catch (err: any) {
    throw err;
  }
}

export async function getTaxAccount(
  companyId: string,
  taxCode: string
): Promise<string | null> {
  try {
    const res = await ApiClient.get<any[]>(`/tax-configurations?company_id=${companyId}&tax_code=${encodeURIComponent(taxCode)}&is_active=1`);
    if (Array.isArray(res) && res.length > 0) return res[0].account_id;
    if (res && res.account_id) return res.account_id;
    return null;
  } catch (err: any) {
    throw err;
  }
}

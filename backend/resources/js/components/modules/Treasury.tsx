import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { bankAccounts as bankApi } from '../../lib/api';
import { accounts as accountsApi } from '../../lib/api';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import type { BankAccount } from '../../types';

export function Treasury() {
  const { selectedCompany } = useCompany();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<Array<{ id: number; code: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    account_id: '',
    bank_name: '',
    account_number: '',
    account_type: 'checking' as 'checking' | 'savings',
    currency: 'USD',
    balance: '0',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadAccounts();
    }
  }, [selectedCompany]);

  const loadAccounts = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [response, accountsResponse] = await Promise.all([
        bankApi.getAll(),
        accountsApi.getAll(),
      ]);
      const list = Array.isArray(response) ? response : (response.data || []);
      const accountList = Array.isArray(accountsResponse) ? accountsResponse : (accountsResponse.data || []);
      setAccounts(list);
      setLedgerAccounts(accountList.filter((a: any) => a?.is_detail));
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: any) => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return '0.00';
    return numeric.toFixed(2);
  };

  const handleSave = async () => {
    try {
      const data = {
        account_id: formData.account_id ? Number(formData.account_id) : null,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        account_type: formData.account_type,
        currency: formData.currency,
        balance: formData.balance,
      };

      if (editing) {
        await bankApi.update(editing.id, data);
      } else {
        await bankApi.create(data);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ account_id: '', bank_name: '', account_number: '', account_type: 'checking', currency: 'USD', balance: '0' });
      loadAccounts();
    } catch (error: any) {
      console.error('Error saving account:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditing(account);
    setFormData({
      account_id: account.account_id ? String(account.account_id) : '',
      bank_name: account.bank_name,
      account_number: account.account_number,
      account_type: account.account_type,
      currency: account.currency,
      balance: String((account as any).current_balance ?? (account as any).balance ?? '0'),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar cuenta "${name}"?`)) return;

    try {
      await bankApi.delete(id);
      loadAccounts();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Tesorería / Bancos</h2>
          <p className="text-slate-600">Gestión de cuentas bancarias</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ account_id: '', bank_name: '', account_number: '', account_type: 'checking', currency: 'USD', balance: '0' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Cuenta
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Banco</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">N° Cuenta</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Moneda</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Saldo</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                    No hay cuentas bancarias registradas
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{account.bank_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{account.account_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{account.account_type === 'checking' ? 'Corriente' : 'Ahorros'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{account.currency}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">${formatAmount((account as any).current_balance ?? (account as any).balance)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(account)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account.id, account.bank_name)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editing ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Contable *</label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {ledgerAccounts.map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Banco *</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Banco Nacional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">N° de Cuenta *</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo *</label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value as 'checking' | 'savings' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="checking">Corriente</option>
                    <option value="savings">Ahorros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Moneda *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="MXN">MXN</option>
                    <option value="GTQ">GTQ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setFormData({ account_id: '', bank_name: '', account_number: '', account_type: 'checking', currency: 'USD', balance: '0' });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

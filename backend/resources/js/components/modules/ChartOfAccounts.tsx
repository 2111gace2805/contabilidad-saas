import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { accounts as accountsApi, accountTypes as accountTypesApi, segments as segmentsApi } from '../../lib/api';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { saveFormData, loadFormData, clearFormData, getFormKey } from '../../lib/formPersistence';
import { usePersistedState } from '../../hooks/usePersistedState';
import type { Account, AccountType, AccountingSegment } from '../../types';

export function ChartOfAccounts() {
  const { selectedCompany } = useCompany();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [segments, setSegments] = useState<AccountingSegment[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = usePersistedState('chart_accounts_modal', false);
  const [showSegmentHelper, setShowSegmentHelper] = useState(false);
  const [editingAccount, setEditingAccount] = usePersistedState<Account | null>('chart_accounts_editing', null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    account_type_id: '',
    parent_account_id: '',
    allows_transactions: false,
  });

  const getAllAccounts = (accts: Account[]): Account[] => {
    const result: Account[] = [];
    const traverse = (accounts: Account[]) => {
      accounts.forEach(acc => {
        result.push(acc);
        if (acc.children && acc.children.length > 0) {
          traverse(acc.children);
        }
      });
    };
    traverse(accts);
    return result;
  };

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (showModal && selectedCompany && !editingAccount) {
      const formKey = getFormKey(selectedCompany.id, 'account');
      const savedData = loadFormData<typeof formData>(formKey);
      if (savedData) {
        setFormData(savedData);
      }
    }
  }, [showModal, selectedCompany, editingAccount]);

  useEffect(() => {
    if (showModal && selectedCompany && !editingAccount) {
      const formKey = getFormKey(selectedCompany.id, 'account');
      saveFormData(formKey, formData);
    }
  }, [formData, showModal, selectedCompany, editingAccount]);

  const loadData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [accountsData, typesData, segmentsData] = await Promise.all([
        accountsApi.getHierarchy(),
        accountTypesApi.getAll(),
        segmentsApi.getAll(),
      ]);

      setAccountTypes(typesData);
      setSegments(segmentsData);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildAccountTree = (flatAccounts: Account[]): Account[] => {
    const accountMap = new Map<number, Account>();
    flatAccounts.forEach(acc => accountMap.set(acc.id, { ...acc, children: [] }));

    const tree: Account[] = [];
    flatAccounts.forEach(acc => {
      const account = accountMap.get(acc.id)!;
      if (acc.parent_account_id) {
        const parent = accountMap.get(acc.parent_account_id);
        if (parent) {
          parent.children!.push(account);
        }
      } else {
        tree.push(account);
      }
    });

    return tree;
  };

  const toggleNode = (accountId: number) => {
    const newExpanded = new Set(expandedNodes);
    const key = String(accountId);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    try {
      let calculatedLevel = 1;
      if (formData.parent_account_id) {
        const allAccounts = getAllAccounts(accounts);
        const parentAccount = allAccounts.find(a => a.id === Number(formData.parent_account_id));
        calculatedLevel = parentAccount ? parentAccount.level + 1 : 1;
      }

      const accountType = accountTypes.find(t => t.id === Number(formData.account_type_id));
      const accountData = {
        code: formData.code,
        name: formData.name,
        account_type_id: Number(formData.account_type_id),
        parent_account_id: formData.parent_account_id ? Number(formData.parent_account_id) : null,
        allows_transactions: formData.allows_transactions,
        level: calculatedLevel,
        balance_type: accountType?.balance_type || 'debit',
        active: true,
      };

      if (editingAccount) {
        await accountsApi.update(editingAccount.id, accountData);
      } else {
        await accountsApi.create(accountData);
      }

      const formKey = getFormKey(selectedCompany.id, 'account');
      clearFormData(formKey);

      setShowModal(false);
      setEditingAccount(null);
      setFormData({ code: '', name: '', account_type_id: '', parent_account_id: '', allows_transactions: false });
      loadData();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Error al guardar cuenta: ' + (error as any).message);
    }
  };

  const openModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        code: account.code,
        name: account.name,
        account_type_id: String(account.account_type_id),
        parent_account_id: account.parent_account_id ? String(account.parent_account_id) : '',
        allows_transactions: account.allows_transactions,
      });
    } else {
      setEditingAccount(null);
      setFormData({ code: '', name: '', account_type_id: '', parent_account_id: '', allows_transactions: false });
    }
    setShowModal(true);
  };

  const handleCancel = () => {
    if (selectedCompany) {
      const formKey = getFormKey(selectedCompany.id, 'account');
      clearFormData(formKey);
    }
    setShowModal(false);
    setEditingAccount(null);
    setFormData({ code: '', name: '', account_type_id: '', parent_account_id: '', allows_transactions: false });
  };

  const handleDelete = async (accountId: number, accountName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la cuenta "${accountName}"?`)) return;

    try {
      await accountsApi.delete(accountId);
      alert('Cuenta eliminada correctamente');
      loadData();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const renderAccount = (account: Account, depth: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(String(account.id));
    const accountType = accountTypes.find(t => t.id === account.account_type_id);

    return (
      <div key={account.id}>
        <div
          className={`flex items-center gap-2 py-2 px-4 hover:bg-slate-50 ${
            depth > 0 ? 'border-l-2 border-slate-200' : ''
          }`}
          style={{ paddingLeft: `${depth * 2 + 1}rem` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleNode(account.id)} className="text-slate-600">
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}
          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
            <span className="font-mono text-sm text-slate-700">{account.code}</span>
            <span className="col-span-2 text-slate-800">{account.name}</span>
            <span className="text-sm text-slate-600">{accountType?.name}</span>
            <div className="flex items-center justify-between">
              {account.is_detail && (
                <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                  Imputable
                </span>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => openModal(account)}
                  className="text-slate-600 hover:text-slate-800"
                  title="Editar cuenta"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id, account.name)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar cuenta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {account.children!.map(child => renderAccount(child, depth + 1))}
          </div>
        )}
      </div>
    );
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
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Catálogo Contable</h2>
            <p className="text-slate-600">Plan de cuentas NIF</p>
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Cuenta
          </button>
        </div>
        {accounts.length === 0 && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Antes de crear cuentas, asegúrate de haber configurado los segmentos contables en el módulo <strong>"Config. Catálogo"</strong>.
              Esto te permitirá estructurar correctamente tu catálogo de cuentas.
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 font-medium text-slate-700 text-sm">
          <span className="pl-8">Código</span>
          <span className="col-span-2">Nombre de Cuenta</span>
          <span>Tipo</span>
          <span>Estado</span>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Cargando...</div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-slate-600">No hay cuentas registradas</div>
          ) : (
            accounts.map(account => renderAccount(account))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Código *</label>
                  {formData.account_type_id && segments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowSegmentHelper(!showSegmentHelper)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Info className="w-3 h-3" />
                      {showSegmentHelper ? 'Ocultar' : 'Ver'} estructura de segmentos
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: 1-01-01-000001-00000001-0000000001"
                />
                {showSegmentHelper && formData.account_type_id && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                    <p className="font-medium text-blue-900 mb-2">Estructura de Segmentos Disponibles:</p>
                    {segments
                      .filter(s => !s.account_type_id || s.account_type_id === formData.account_type_id)
                      .sort((a, b) => a.level - b.level)
                      .map((segment, index) => (
                        <div key={segment.id} className="flex items-start gap-2 py-1 text-blue-800">
                          <span className="font-mono font-semibold">{segment.level}.</span>
                          <div className="flex-1">
                            <span className="font-medium">{segment.name}</span>
                            <span className="text-blue-600"> ({segment.digit_length} dígitos)</span>
                            {segment.description && (
                              <p className="text-blue-700 text-xs mt-0.5">{segment.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    {segments.filter(s => !s.account_type_id || s.account_type_id === formData.account_type_id).length === 0 && (
                      <p className="text-blue-700">
                        No hay segmentos configurados para este tipo de cuenta.
                        Ve a <strong>"Config. Catálogo"</strong> para crear segmentos.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: Caja General"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cuenta *</label>
                <select
                  value={formData.account_type_id}
                  onChange={(e) => setFormData({ ...formData, account_type_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">Seleccionar...</option>
                  {accountTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.nature === 'deudora' ? 'Deudora' : 'Acreedora'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Padre (opcional)</label>
                <select
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">Ninguna (cuenta principal)</option>
                  {getAllAccounts(accounts)
                    .filter(acc => !editingAccount || acc.id !== editingAccount.id)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_detail}
                    onChange={(e) => setFormData({ ...formData, is_detail: e.target.checked })}
                    className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Cuenta Imputable / Cuenta Detalle</span>
                    <p className="text-xs text-slate-500">Marca esta opción si se pueden registrar movimientos directamente en esta cuenta</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCancel}
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

import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { ApiClient } from '../../lib/api';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface AccountType {
  id: number;
  code: string;
  name: string;
  category: string;
  normal_balance: 'debit' | 'credit';
}

export function AccountTypesManagement() {
  const { selectedCompany } = useCompany();
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AccountType | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'asset' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
    normal_balance: 'debit' as 'debit' | 'credit',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadAccountTypes();
    }
  }, [selectedCompany]);

  const loadAccountTypes = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await ApiClient.get<any>('/account-types?per_page=100');
      const list = Array.isArray(response) ? response : (response.data || []);
      setAccountTypes(list);
    } catch (error) {
      console.error('Error loading account types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await ApiClient.put(`/account-types/${editing.id}`, formData);
      } else {
        await ApiClient.post('/account-types', formData);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', category: 'asset', normal_balance: 'debit' });
      loadAccountTypes();
    } catch (error: any) {
      console.error('Error saving account type:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (type: AccountType) => {
    setEditing(type);
    setFormData({
      code: type.code,
      name: type.name,
      category: type.category as any,
      normal_balance: type.normal_balance,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar tipo de cuenta "${name}"?`)) return;

    try {
      await ApiClient.delete(`/account-types/${id}`);
      loadAccountTypes();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: any = {
      asset: 'Activo',
      liability: 'Pasivo',
      equity: 'Patrimonio',
      revenue: 'Ingreso',
      expense: 'Gasto',
    };
    return labels[category] || category;
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Tipos de Cuenta</h2>
          <p className="text-slate-600">Configuración de clasificaciones contables</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ code: '', name: '', category: 'asset', normal_balance: 'debit' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Tipo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Categoría</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Balance Normal</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : accountTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                    No hay tipos de cuenta configurados
                  </td>
                </tr>
              ) : (
                accountTypes.map((type) => (
                  <tr key={type.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{type.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{type.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{getCategoryLabel(type.category)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {type.normal_balance === 'debit' ? 'Débito' : 'Crédito'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(type)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id, type.name)}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editing ? 'Editar Tipo de Cuenta' : 'Nuevo Tipo de Cuenta'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="ACT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Activo Corriente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="asset">Activo</option>
                  <option value="liability">Pasivo</option>
                  <option value="equity">Patrimonio</option>
                  <option value="revenue">Ingreso</option>
                  <option value="expense">Gasto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Balance Normal *</label>
                <select
                  value={formData.normal_balance}
                  onChange={(e) => setFormData({ ...formData, normal_balance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="debit">Débito</option>
                  <option value="credit">Crédito</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setFormData({ code: '', name: '', category: 'asset', normal_balance: 'debit' });
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

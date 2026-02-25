import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { ApiClient } from '../../lib/api';
import { Plus, Edit2, Trash2, Tag, X } from 'lucide-react';
import { Card } from '../common/Card';
import { DataTable } from '../common/DataTable';

// UI styles follow `documentacion/GUIA_DISENO_ESTILOS.md` —
// cards: "bg-white border border-slate-200 rounded-lg shadow-sm p-6";
// tables: thead "bg-slate-50 border-b border-slate-200", tbody "bg-white divide-y divide-slate-200";
// rows: "hover:bg-slate-50".


interface AccountType {
  id: number;
  code: string;
  name: string;
  nature: 'deudora' | 'acreedora';
  affects_balance?: boolean;
  affects_results?: boolean;
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
    nature: 'deudora' as 'deudora' | 'acreedora',
    affects_balance: true,
    affects_results: false,
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
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Código y nombre son obligatorios');
      return;
    }

    try {
      const payload: any = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        nature: formData.nature,
        affects_balance: formData.affects_balance,
        affects_results: formData.affects_results,
      };

      if (editing) {
        await ApiClient.put(`/account-types/${editing.id}`, payload);
      } else {
        await ApiClient.post('/account-types', payload);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', nature: 'deudora', affects_balance: true, affects_results: false });
      loadAccountTypes();
    } catch (error: any) {
      console.error('Error saving account type:', error);
      // show backend validation errors if any
      if (error?.response?.data?.errors) {
        const errs = error.response.data.errors;
        const messages = Object.keys(errs).map(k => `${k}: ${errs[k].join(', ')}`).join('\n');
        alert('Error al guardar:\n' + messages);
      } else {
        alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
      }
    }
  };

  const handleEdit = (type: AccountType) => {
    setEditing(type);
    setFormData({
      code: type.code,
      name: type.name,
      nature: type.nature || 'deudora',
      affects_balance: Boolean(type.affects_balance),
      affects_results: Boolean(type.affects_results),
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

  const getNatureLabel = (nature: string) => {
    return nature === 'deudora' ? 'Deudora' : 'Acreedora';
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Tipos de Cuenta</h1>
      <Card
        title="Lista de Tipos de Cuenta"
        headerRight={
          <button
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            onClick={() => {
              setEditing(null);
              setFormData({ code: '', name: '', nature: 'deudora', affects_balance: true, affects_results: false });
              setShowModal(true);
            }}
          >
            <Plus className="w-5 h-5 inline-block mr-2" /> Nuevo Tipo
          </button>
        }
      >
        <DataTable
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'nature', label: 'Naturaleza' },
            { key: 'actions', label: 'Acciones' },
          ]}
        >
          {accountTypes.map((type) => (
            <tr key={type.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{getNatureLabel(type.nature)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="Editar" onClick={() => handleEdit(type)}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar" onClick={() => handleDelete(type.id, type.name)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">{editing ? 'Editar Tipo de Cuenta' : 'Nuevo Tipo de Cuenta'}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej. 1, 2, 3..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej. Activo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Naturaleza *</label>
                <select
                  value={formData.nature}
                  onChange={(e) => setFormData({ ...formData, nature: e.target.value as 'deudora' | 'acreedora' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="deudora">Deudora</option>
                  <option value="acreedora">Acreedora</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.affects_balance}
                    onChange={(e) => setFormData({ ...formData, affects_balance: e.target.checked })}
                  />
                  Afecta balance
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.affects_results}
                    onChange={(e) => setFormData({ ...formData, affects_results: e.target.checked })}
                  />
                  Afecta resultados
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
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

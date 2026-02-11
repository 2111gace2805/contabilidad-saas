import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { ApiClient } from '../../lib/api';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
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
  category?: string;
  normal_balance: 'debit' | 'credit';
  nature?: string; // backend uses 'nature' as 'deudora'|'acreedora'
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
      // Map frontend fields to backend expected fields
      const payload: any = {
        code: formData.code,
        name: formData.name,
        nature: formData.normal_balance === 'debit' ? 'deudora' : 'acreedora',
        affects_balance: true,
        affects_results: formData.category === 'revenue' || formData.category === 'expense',
      };

      if (editing) {
        await ApiClient.put(`/account-types/${editing.id}`, payload);
      } else {
        await ApiClient.post('/account-types', payload);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', category: 'asset', normal_balance: 'debit' });
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
      category: (type.category as any) || 'asset',
      normal_balance: type.nature === 'deudora' ? 'debit' : 'credit',
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Tipos de Partida</h1>
      <Card
        title="Lista de Tipos de Partida"
        headerRight={
          <button
            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-5 h-5 inline-block mr-2" /> Nuevo Tipo
          </button>
        }
      >
        <DataTable
          columns={[
            { key: 'code', label: 'Código' },
            { key: 'name', label: 'Nombre' },
            { key: 'category', label: 'Categoría' },
            { key: 'normal_balance', label: 'Balance Normal' },
            { key: 'actions', label: 'Acciones' },
          ]}
        >
          {accountTypes.map((type) => (
            <tr key={type.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{getCategoryLabel(type.category || '')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.normal_balance}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="Editar" onClick={() => setEditing(type)}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Eliminar" onClick={() => console.log('Eliminar', type)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}

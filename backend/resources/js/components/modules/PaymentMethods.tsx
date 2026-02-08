import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { paymentMethods as paymentMethodsApi } from '../../lib/api';
import { CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';

export function PaymentMethods() {
  const { selectedCompany } = useCompany();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadPaymentMethods();
    }
  }, [selectedCompany]);

  const loadPaymentMethods = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await paymentMethodsApi.getAll();
      const list = Array.isArray(response) ? response : (response.data || []);
      setPaymentMethods(list);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await paymentMethodsApi.update(editing.id, formData);
      } else {
        await paymentMethodsApi.create(formData);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', description: '' });
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (method: any) => {
    setEditing(method);
    setFormData({
      code: method.code,
      name: method.name,
      description: method.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar forma de pago "${name}"?`)) return;

    try {
      await paymentMethodsApi.delete(id);
      loadPaymentMethods();
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Formas de Pago</h2>
          <p className="text-slate-600">Configuración de métodos de pago</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ code: '', name: '', description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Forma de Pago
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Descripción</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : paymentMethods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                    No hay formas de pago configuradas
                  </td>
                </tr>
              ) : (
                paymentMethods.map((method) => (
                  <tr key={method.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{method.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{method.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{method.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(method)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(method.id, method.name)}
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
              {editing ? 'Editar Forma de Pago' : 'Nueva Forma de Pago'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="EFE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Efectivo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={2}
                  placeholder="Descripción opcional"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setFormData({ code: '', name: '', description: '' });
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

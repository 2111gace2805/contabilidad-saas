import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { branches as branchesApi } from '../../lib/api';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';

type BranchFormData = {
  code: string;
  name: string;
  address: string;
  phone: string;
}

export function Branches() {
  const { selectedCompany } = useCompany();
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);

  const [formData, setFormData] = useState<BranchFormData>({
    code: '',
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadBranches();
    }
  }, [selectedCompany]);

  const loadBranches = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await branchesApi.getAll();
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    try {
      const branchData = {
        code: formData.code,
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        is_active: true,
      };

      if (editingBranch) {
        await branchesApi.update(editingBranch.id, branchData);
      } else {
        await branchesApi.create(branchData);
      }

      setShowModal(false);
      setEditingBranch(null);
      setFormData({ code: '', name: '', address: '', phone: '' });
      loadBranches();
    } catch (error: any) {
      console.error('Error saving branch:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingBranch(null);
    setFormData({ code: '', name: '', address: '', phone: '' });
  };

  const openModal = (branch?: any) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        code: branch.code,
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
      });
    } else {
      setEditingBranch(null);
      setFormData({ code: '', name: '', address: '', phone: '' });
    }
    setShowModal(true);
  };

  const handleDelete = async (branchId: number, branchName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la sucursal "${branchName}"?`)) return;

    try {
      await branchesApi.delete(branchId);
      loadBranches();
    } catch (error: any) {
      console.error('Error deleting branch:', error);
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Sucursales</h2>
          <p className="text-slate-600">Gestión de sucursales y puntos de venta</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Sucursal
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Dirección</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Teléfono</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Estado</th>
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
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                    No hay sucursales registradas
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{branch.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{branch.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{branch.address || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{branch.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          branch.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {branch.is_active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openModal(branch)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar sucursal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(branch.id, branch.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar sucursal"
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Ej: SUC001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Ej: Sucursal Centro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={2}
                  placeholder="Calle, número, colonia, ciudad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="(55) 1234-5678"
                />
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

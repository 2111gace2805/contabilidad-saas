import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { suppliers as suppliersApi } from '../../lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { saveFormData, loadFormData, clearFormData, getFormKey } from '../../lib/formPersistence';
import { usePersistedState } from '../../hooks/usePersistedState';
import type { Supplier } from '../../types';

type SupplierFormData = {
  code: string;
  name: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  credit_days: number;
}

export function Suppliers() {
  const { selectedCompany } = useCompany();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = usePersistedState('suppliers_modal', false);
  const [editingSupplier, setEditingSupplier] = usePersistedState<Supplier | null>('suppliers_editing', null);

  const [formData, setFormData] = useState<SupplierFormData>({
    code: '',
    name: '',
    nit: '',
    email: '',
    phone: '',
    address: '',
    credit_days: 30,
  });

  useEffect(() => {
    if (selectedCompany) {
      loadSuppliers();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (showModal && selectedCompany && !editingSupplier) {
      const formKey = getFormKey(selectedCompany.id, 'supplier');
      const savedData = loadFormData<typeof formData>(formKey);
      if (savedData) {
        setFormData(savedData);
      }
    }
  }, [showModal, selectedCompany, editingSupplier]);

  useEffect(() => {
    if (showModal && selectedCompany && !editingSupplier) {
      const formKey = getFormKey(selectedCompany.id, 'supplier');
      saveFormData(formKey, formData);
    }
  }, [formData, showModal, selectedCompany, editingSupplier]);

  const loadSuppliers = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await suppliersApi.getAll();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    try {
      const supplierData = {
        code: formData.code,
        name: formData.name,
        nit: formData.nit || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        credit_days: formData.credit_days,
        active: true,
      };

      if (editingSupplier) {
        await suppliersApi.update(editingSupplier.id, supplierData);
      } else {
        await suppliersApi.create(supplierData);
      }

      const formKey = getFormKey(selectedCompany.id, 'supplier');
      clearFormData(formKey);

      setShowModal(false);
      setEditingSupplier(null);
      setFormData({ code: '', name: '', nit: '', email: '', phone: '', address: '', credit_days: 30 });
      loadSuppliers();
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleCancel = () => {
    if (selectedCompany) {
      const formKey = getFormKey(selectedCompany.id, 'supplier');
      clearFormData(formKey);
    }
    setShowModal(false);
    setEditingSupplier(null);
    setFormData({ code: '', name: '', nit: '', email: '', phone: '', address: '', credit_days: 30 });
  };

  const openModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        code: supplier.code,
        name: supplier.name,
        nit: supplier.nit || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        credit_days: supplier.credit_days,
      });
    } else {
      setEditingSupplier(null);
      setFormData({ code: '', name: '', nit: '', email: '', phone: '', address: '', credit_days: 30 });
    }
    setShowModal(true);
  };

  const handleDelete = async (supplierId: number, supplierName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el proveedor "${supplierName}"?`)) return;

    try {
      await suppliersApi.delete(supplierId);
      loadSuppliers();
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Proveedores</h2>
          <p className="text-slate-600">Directorio de proveedores</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">NIT</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Días Crédito</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    No hay proveedores registrados
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{supplier.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{supplier.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{supplier.nit || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{supplier.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{supplier.credit_days} días</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {supplier.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openModal(supplier)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar proveedor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id, supplier.name)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar proveedor"
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
              {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                    placeholder="Ej: PROV001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIT</label>
                  <input
                    type="text"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Ej: ABC123456XYZ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: Proveedor XYZ S.A. de C.V."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="correo@ejemplo.com"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Días de Crédito *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.credit_days}
                  onChange={(e) => setFormData({ ...formData, credit_days: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="30"
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

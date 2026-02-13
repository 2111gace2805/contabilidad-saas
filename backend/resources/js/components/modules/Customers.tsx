import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { customers as customersApi } from '../../lib/api';
import { Plus, Edit2, Trash2, Users as UsersIcon } from 'lucide-react';
import { saveFormData, loadFormData, clearFormData, getFormKey } from '../../lib/formPersistence';
import { usePersistedState } from '../../hooks/usePersistedState';
import type { Customer } from '../../types';

export function Customers() {
  const { selectedCompany } = useCompany();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = usePersistedState('customers_modal', false);
  const [editingCustomer, setEditingCustomer] = usePersistedState<Customer | null>('customers_editing', null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    business_name: '',
    profile_type: 'natural',
    rfc: '',
    email1: '',
    email2: '',
    email3: '',
    phone: '',
    address: '',
    credit_limit: '0',
    payment_terms: 30,
    nit: '',
    nrc: '',
    dui: '',
    depa_id: '',
    municipality_id: '',
    district_id: '',
    customer_type_id: '',
    economic_activity_id: '',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadCustomers();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (showModal && selectedCompany && !editingCustomer) {
      const formKey = getFormKey(selectedCompany.id, 'customer');
      const savedData = loadFormData<typeof formData>(formKey);
      if (savedData) {
        setFormData(savedData);
      }
    }
  }, [showModal, selectedCompany, editingCustomer]);

  useEffect(() => {
    if (showModal && selectedCompany && !editingCustomer) {
      const formKey = getFormKey(selectedCompany.id, 'customer');
      saveFormData(formKey, formData);
    }
  }, [formData, showModal, selectedCompany, editingCustomer]);

  const loadCustomers = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await customersApi.getAll();
      // El API devuelve { data: [...] }
      const customersList = Array.isArray(response) ? response : (response.data || []);
      setCustomers(customersList.filter((c: Customer) => c.active));
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.email1.trim()) {
      alert('El email principal (Email1) es obligatorio');
      return;
    }

    try {
      const customerData = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        business_name: formData.business_name.trim() || null,
        profile_type: formData.profile_type,
        rfc: formData.rfc.trim() || null,
        email1: formData.email1.trim() || null,
        email2: formData.email2.trim() || null,
        email3: formData.email3.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        credit_limit: formData.credit_limit,
        payment_terms: formData.payment_terms,
        nit: formData.nit.trim() || null,
        nrc: formData.nrc.trim() || null,
        dui: formData.dui.trim() || null,
        depa_id: formData.depa_id || null,
        municipality_id: formData.municipality_id || null,
        district_id: formData.district_id || null,
        customer_type_id: formData.customer_type_id || null,
        economic_activity_id: formData.economic_activity_id || null,
        active: true,
      };

      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, customerData);
      } else {
        await customersApi.create(customerData);
      }

      if (selectedCompany) {
        const formKey = getFormKey(selectedCompany.id, 'customer');
        clearFormData(formKey);
      }

      setShowModal(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
      alert('Cliente guardado exitosamente');
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error al guardar: ' + (error as any).message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      business_name: '',
      profile_type: 'natural',
      rfc: '',
      email1: '',
      email2: '',
      email3: '',
      phone: '',
      address: '',
      credit_limit: '0',
      payment_terms: 30,
      nit: '',
      nrc: '',
      dui: '',
      depa_id: '',
      municipality_id: '',
      district_id: '',
      customer_type_id: '',
      economic_activity_id: '',
    });
  };

  const handleCancel = () => {
    if (selectedCompany) {
      const formKey = getFormKey(selectedCompany.id, 'customer');
      clearFormData(formKey);
    }
    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        code: customer.code,
        name: customer.name,
        rfc: customer.rfc || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        credit_limit: customer.credit_limit,
        payment_terms: customer.payment_terms,
      });
    } else {
      setEditingCustomer(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleDelete = async (customerId: number, customerName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el cliente "${customerName}"?`)) return;

    try {
      await customersApi.delete(customerId);
      loadCustomers();
      alert('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error al eliminar: ' + (error as any).message);
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
        <div className="flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-slate-700" />
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Clientes</h2>
            <p className="text-slate-600">Gestión de clientes de la empresa</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre / Razón Social</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">NIT</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">NRC</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Teléfono</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-800">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        customer.profile_type === 'juridical' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {customer.profile_type === 'juridical' ? 'Jurídica' : 'Natural'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{customer.business_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{customer.nit || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{customer.nrc || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{customer.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{customer.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openModal(customer)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar cliente"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.business_name)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar cliente"
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase">
              {editingCustomer ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}
            </h3>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="CLI001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">RFC / NIT</label>
                <input
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="ABC123456XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="cliente@ejemplo.com"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Crédito</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="10000.00"
                />
              </div>

              <div className="col-span-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Días de Crédito</label>
                <input
                  type="number"
                  min="0"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200">
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

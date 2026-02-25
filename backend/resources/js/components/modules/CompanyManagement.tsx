import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { companies as companiesApi } from '../../lib/api';
import { Plus, Users, Building2, Trash2 } from 'lucide-react';
import { usePersistedState } from '../../hooks/usePersistedState';
import type { Company } from '../../types';

export function CompanyManagement() {
  const { user } = useAuth();
  const { companies, refreshCompanies } = useCompany();
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [showCreateModal, setShowCreateModal] = usePersistedState('company_create_modal', false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    fiscal_year_start: 1,
    currency: 'MXN',
  });

  // Missing UI state for user management modals and forms
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [userForm, setUserForm] = useState({ email: '', role: 'viewer' });
  const [companyUsers, setCompanyUsers] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<{ userId?: string; newRole?: string } | null>(null);

  // Minimal handlers to avoid runtime errors; replace with real API calls later
  const handleAddUser = async () => {
    try {
      // TODO: call API to assign user to company
      alert('Asignar usuario: funcionalidad pendiente de implementar.');
    } catch (err: any) {
      console.error('Error adding user:', err);
      alert('Error al asignar usuario: ' + (err?.message || ''));
    }
  };

  const handleUpdateRole = async () => {
    try {
      // TODO: call API to update user role
      alert('Actualizar rol: funcionalidad pendiente de implementar.');
      setEditingRole(null);
    } catch (err: any) {
      console.error('Error updating role:', err);
      alert('Error al actualizar rol: ' + (err?.message || ''));
    }
  };

  useEffect(() => {
    loadAllCompanies();
  }, []);

  const loadAllCompanies = async () => {
    setLoading(true);
    try {
      const data = await companiesApi.getAll();
      const list = (Array.isArray(data) ? data : [])
        .map((cu: any) => (cu && cu.company ? cu.company : cu))
        .filter(Boolean);
      setAllCompanies(list as Company[]);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!user) return;

    try {
      await companiesApi.create({
        name: formData.name,
        nit: formData.nit,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
        fiscal_year_start: formData.fiscal_year_start,
        currency: formData.currency,
        active: true,
      });

      setShowCreateModal(false);
  setFormData({ name: '', nit: '', address: '', phone: '', email: '', fiscal_year_start: 1, currency: 'MXN' });
      loadAllCompanies();
      refreshCompanies();
      alert('Empresa creada exitosamente. Ahora debes configurar el catálogo contable.');
    } catch (error: any) {
      console.error('Error creating company:', error);
      alert('Error al crear empresa: ' + error.message);
    }
  };

  const userIsAdmin = (companyId: number | string) => {
    return companies.some(c => String(c.id) === String(companyId));
  };

  const handleDeleteCompany = async (company: Company) => {
    if (!confirm(`¿Estás seguro de eliminar la empresa "${company.name}"?\n\nNOTA: Solo se pueden eliminar empresas sin movimientos.`)) return;

    try {
      // Intentar eliminar directamente - el backend rechazará si tiene transacciones
      console.log('Attempting to delete company:', company.id);
      await companiesApi.delete(company.id);
      
      alert('Empresa eliminada exitosamente');
      loadAllCompanies();
      refreshCompanies();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data
      });
      
      // Extraer el mensaje de error del backend
      let errorMsg = 'Error desconocido';
      
      if (error?.response?.status === 422) {
        errorMsg = error?.response?.data?.message || 'No se puede eliminar esta empresa porque tiene transacciones registradas.';
      } else if (error?.response?.data?.message) {
        errorMsg = error?.response?.data?.message;
      } else if (error?.message) {
        errorMsg = error?.message;
      }
      
      alert('Error al eliminar empresa:\n\n' + errorMsg);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Empresas</h2>
          <p className="text-slate-600">Crear empresas y asignar usuarios</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-8 text-slate-600">Cargando...</div>
        ) : allCompanies.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-slate-600">
            No hay empresas registradas. Crea tu primera empresa.
          </div>
        ) : (
          allCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                {userIsAdmin(company.id) && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Tu empresa
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">{company.name}</h3>

              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <p><span className="font-medium">NIT:</span> {company.nit || company.rfc}</p>
                <p><span className="font-medium">Moneda:</span> {company.currency}</p>
                <p><span className="font-medium">Ejercicio:</span> Mes {company.fiscal_year_start}</p>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => {
                    // open users modal for this company (load users later)
                    setShowUsersModal(true);
                    setCompanyUsers([]); // clear/placeholder until API implemented
                  }}
                  className="px-3 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm hover:bg-slate-200"
                >
                  <Users className="w-4 h-4 inline-block mr-2" /> Usuarios
                </button>
                {userIsAdmin(company.id) && (
                  <button
                    onClick={() => handleDeleteCompany(company)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    title="Eliminar empresa (solo si no tiene movimientos)"
                  >
                    <Trash2 className="w-4 h-4 inline-block" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Nueva Empresa</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Mi Empresa S.A. de C.V."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIT *</label>
                <input
                  type="text"
                  value={formData.nit}
                  onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="0614-290980-102-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Calle, Número, Colonia, Ciudad"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mes Inicio Fiscal *
                  </label>
                  <select
                    value={formData.fiscal_year_start}
                    onChange={(e) => setFormData({ ...formData, fiscal_year_start: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Moneda *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCompany}
                disabled={!formData.name || !formData.nit}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Empresa
              </button>
            </div>
          </div>
        </div>
      )}

      {showUsersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Usuarios de la Empresa</h3>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Asignar Nuevo Usuario</h4>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="accountant">Contador</option>
                  <option value="viewer">Visor</option>
                </select>
              </div>
              <button
                onClick={handleAddUser}
                className="mt-3 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm"
              >
                Asignar Usuario
              </button>
              <p className="mt-2 text-xs text-slate-500">
                Nota: Ingresa el UUID del usuario. Copia el ID del usuario desde Supabase → Authentication → Users.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Usuario</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companyUsers.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-slate-600">
                        No hay usuarios asignados
                      </td>
                    </tr>
                  ) : (
                    companyUsers.map((cu) => (
                      <tr key={cu.id}>
                        <td className="px-4 py-3 text-sm text-slate-800">{cu.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              cu.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : cu.role === 'accountant'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {cu.role === 'admin' ? 'Administrador' : cu.role === 'accountant' ? 'Contador' : 'Visor'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowUsersModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Cambiar Rol</h3>

            <div className="space-y-4">
              <p className="text-sm text-slate-600">Selecciona el nuevo rol para este usuario:</p>

              <select
                value={editingRole.newRole}
                onChange={(e) => setEditingRole({ ...editingRole, newRole: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              >
                <option value="admin">Administrador</option>
                <option value="accountant">Contador</option>
                <option value="viewer">Visor</option>
              </select>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditingRole(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
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

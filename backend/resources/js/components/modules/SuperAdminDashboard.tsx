import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ApiClient } from '../../lib/api';
import { Building2, Users, Plus, Trash2, UserPlus, Shield, Edit, Lock, Unlock } from 'lucide-react';
import UserAutocomplete from '../common/UserAutocomplete';

interface Company {
  id: number;
  name: string;
  rfc: string;
  currency: string;
  active: boolean;
  customers_count?: number;
  suppliers_count?: number;
  journal_entries_count?: number;
  users?: Array<{
    id: number;
    name: string;
    email: string;
    pivot: { role: string };
  }>;
  max_users: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  is_super_admin: boolean;
  active: boolean;
  companies?: Array<{ id: number; name: string }>;
}

export function SuperAdminDashboard() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'roles'>('companies');
  const [companyFilter, setCompanyFilter] = useState('');

  // Company Form
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    rfc: '',
    address: '',
    phone: '',
    currency: 'USD',
    fiscal_year_start: 1,
    admin_user_id: '',
    max_users: 3,
  });

  // User Form
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    is_super_admin: false,
  });

  // Password Change Form
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    password_confirmation: '',
  });

  // Assignment Form
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    user_id: '',
    company_id: '',
    role: 'viewer' as 'admin' | 'accountant' | 'viewer',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('SuperAdminDashboard: Loading data...');
      const [companiesRes, usersRes] = await Promise.all([
        ApiClient.get<Company[]>('/super-admin/companies'),
        ApiClient.get<User[]>('/super-admin/users'),
      ]);
      console.log('SuperAdminDashboard: Companies loaded:', companiesRes);
      console.log('SuperAdminDashboard: Users loaded:', usersRes);
      setCompanies(companiesRes);
      setUsers(usersRes);
    } catch (error: any) {
      console.error('Error loading data:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      alert('Error cargando datos: ' + (error?.response?.data?.message || error?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!companyForm.name || !companyForm.rfc) {
      alert('Nombre y RFC son obligatorios');
      return;
    }

    try {
      if (editingCompanyId) {
        await ApiClient.put(`/super-admin/companies/${editingCompanyId}`, companyForm);
        alert('Empresa actualizada exitosamente');
      } else {
        await ApiClient.post('/super-admin/companies', companyForm);
        alert('Empresa creada exitosamente');
      }
      setShowCompanyModal(false);
      setEditingCompanyId(null);
      setCompanyForm({ name: '', rfc: '', address: '', phone: '', currency: 'USD', fiscal_year_start: 1, admin_user_id: '', max_users: 3 });
      loadData();
    } catch (error: any) {
      console.error('Error creating company:', error);
      alert('Error: ' + (error?.response?.data?.message || error?.message || 'Error desconocido'));
    }
  };

  const openEditCompany = (company: Company) => {
    setEditingCompanyId(company.id);
    setCompanyForm({
      name: company.name || '',
      rfc: company.rfc || '',
      address: (company as any).address || '',
      phone: (company as any).phone || '',
      currency: company.currency || 'USD',
      fiscal_year_start: (company as any).fiscal_year_start || 1,
      admin_user_id: '',
      max_users: company.max_users || 3,
    });
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = async (company: Company) => {
    const hasData = (company.customers_count || 0) + (company.suppliers_count || 0) + (company.journal_entries_count || 0);

    if (hasData > 0) {
      alert('No se puede eliminar esta empresa porque tiene transacciones registradas.');
      return;
    }

    if (!confirm(`¿Eliminar empresa "${company.name}"?`)) return;

    try {
      await ApiClient.delete(`/super-admin/companies/${company.id}`);
      alert('Empresa eliminada');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + (error?.response?.data?.message || 'Error desconocido'));
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.name || !userForm.email || (!editingUser && !userForm.password)) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      if (editingUser) {
        // Update existing user
        await ApiClient.put(`/super-admin/users/${editingUser.id}`, {
          name: userForm.name,
          email: userForm.email,
        });
        alert('Usuario actualizado exitosamente');
      } else {
        // Create new user
        await ApiClient.post('/super-admin/users', userForm);
        alert('Usuario creado exitosamente');
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', is_super_admin: false });
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + (error?.response?.data?.message || 'Error desconocido'));
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '',
      is_super_admin: u.is_super_admin,
    });
    setShowUserModal(true);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.password || !passwordForm.password_confirmation) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (passwordForm.password !== passwordForm.password_confirmation) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (passwordForm.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      await ApiClient.put(`/super-admin/users/${passwordUser!.id}/password`, passwordForm);
      alert('Contraseña cambiada exitosamente');
      setShowPasswordModal(false);
      setPasswordUser(null);
      setPasswordForm({ password: '', password_confirmation: '' });
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + (error?.response?.data?.message || 'Error desconocido'));
    }
  };

  const openPasswordModal = (u: User) => {
    setPasswordUser(u);
    setPasswordForm({ password: '', password_confirmation: '' });
    setShowPasswordModal(true);
  };

  const handleAssignUser = async () => {
    if (!assignForm.user_id || !assignForm.company_id) {
      alert('Selecciona usuario y empresa');
      return;
    }

    try {
      await ApiClient.post('/super-admin/users/assign', assignForm);
      alert('Usuario asignado exitosamente');
      setShowAssignModal(false);
      setAssignForm({ user_id: '', company_id: '', role: 'viewer' });
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + (error?.response?.data?.message || 'Error desconocido'));
    }
  };

  if (!user?.is_super_admin) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h3>
          <p className="text-red-600">Esta sección es solo para Super Administradores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          Panel de Super Administrador
        </h2>
        <p className="text-slate-600">Gestión completa de empresas y usuarios del sistema</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'companies'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Building2 className="w-4 h-4 inline-block mr-2" />
              Empresas
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'roles'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Shield className="w-4 h-4 inline-block mr-2" />
              Roles
            </button>
          </nav>
        </div>
      </div>

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Empresas del Sistema</h3>
              <p className="text-sm text-slate-500">Filtra por nombre para encontrar empresas rápidamente</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                placeholder="Buscar empresas..."
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              />

              <button
                onClick={() => setShowCompanyModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
                Nueva Empresa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-8 text-slate-600">Cargando...</div>
            ) : companies.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-slate-600">No hay empresas</div>
            ) : (
              companies
                .filter((c) => c.name.toLowerCase().includes(companyFilter.toLowerCase()))
                .map((company) => (
                  <div key={company.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-slate-800 p-3 rounded-lg">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditCompany(company)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDeleteCompany(company)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        {company.active ? (
                          <button
                            onClick={async () => {
                              if ((company.journal_entries_count || 0) > 0) {
                                alert('No se puede deshabilitar esta empresa porque tiene transacciones registradas.');
                                return;
                              }

                              if (!confirm(`¿Deshabilitar la empresa "${company.name}"? Esto bloqueará el acceso a administradores y usuarios.`)) return;

                              try {
                                await ApiClient.put(`/super-admin/companies/${company.id}/disable`, {});
                                alert('Empresa deshabilitada');
                                loadData();
                              } catch (err: any) {
                                console.error('Error disabling company:', err);
                                alert('Error: ' + (err?.response?.data?.message || err?.message || 'Error desconocido'));
                              }
                            }}
                            className="text-slate-600 hover:text-slate-800"
                            title="Deshabilitar"
                          >
                            <Lock className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (!confirm(`¿Habilitar la empresa "${company.name}"?`)) return;
                              try {
                                await ApiClient.put(`/super-admin/companies/${company.id}/enable`, {});
                                alert('Empresa habilitada');
                                loadData();
                              } catch (err: any) {
                                console.error('Error enabling company:', err);
                                alert('Error: ' + (err?.response?.data?.message || err?.message || 'Error desconocido'));
                              }
                            }}
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Habilitar"
                          >
                            <Unlock className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2">{company.name}</h3>

                    <div className="space-y-1 text-sm text-slate-600 mb-4">
                      <p><span className="font-medium">RFC:</span> {company.rfc}</p>
                      <p><span className="font-medium">Moneda:</span> {company.currency}</p>
                      <p><span className="font-medium">Límite Usuarios:</span> {company.max_users}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-3">
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{company.customers_count || 0}</div>
                        <div className="text-xs text-slate-500">Clientes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{company.suppliers_count || 0}</div>
                        <div className="text-xs text-slate-500">Proveedores</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{company.journal_entries_count || 0}</div>
                        <div className="text-xs text-slate-500">Pólizas</div>
                      </div>
                    </div>

                    {company.users && company.users.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="text-xs text-slate-500 mb-2">Usuarios asignados:</div>
                        <div className="space-y-1">
                          {company.users.slice(0, 3).map((u) => (
                            <div key={u.id} className="text-xs text-slate-600">
                              {u.name} ({u.pivot.role})
                            </div>
                          ))}
                          {company.users.length > 3 && (
                            <div className="text-xs text-slate-500">+{company.users.length - 3} más</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Descripción de Roles en el Sistema
          </h3>

          <div className="grid grid-cols-1 gap-6">
            <div className="p-6 border border-purple-100 bg-purple-50/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Super Admin</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Nivel de gestión global del SaaS. Puede crear empresas, suspender servicios, gestionar todos los usuarios del sistema y asignar administradores. No tiene acceso a la operatividad diaria de la empresa para garantizar la privacidad de datos.
              </p>
            </div>

            <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Admin</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Dueño o Contador Jefe de la empresa. Tiene control total sobre el catálogo de cuentas, períodos contables y configuraciones del sistema. Es el único autorizado para validar y aprobar la anulación de pólizas contabilizadas.
              </p>
            </div>

            <div className="p-6 border border-blue-100 bg-blue-50/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Contador</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Personal operativo con acceso a todos los módulos: Pólizas, Clientes, Proveedores, Bancos e Inventarios. Puede registrar movimientos y generar reportes, pero no tiene permisos para modificar la estructura contable ni los settings de la empresa.
              </p>
            </div>

            <div className="p-6 border border-slate-100 bg-slate-50/30 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Visor</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Acceso de solo lectura a los módulos operativos y reportes. Ideal para auditores externos o gerencia que necesite consultar información sin riesgo de alteración de datos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800">Usuarios del Sistema</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4" />
                Asignar a Empresa
              </button>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
                Nuevo Usuario
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Empresas</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-600">Cargando...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-600">No hay usuarios</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-800">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{u.email}</td>
                      <td className="px-4 py-3 text-sm">
                        {u.is_super_admin ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Super Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            Usuario
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {u.companies && u.companies.length > 0 ? (
                          <span>
                            {u.companies.map((company) => company.name).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPasswordModal(u)}
                            className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            title="Cambiar contraseña"
                          >
                            <Lock className="w-4 h-4" />
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
      )}

      {/* Create Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Nueva Empresa</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="Mi Empresa S.A."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RFC *</label>
                  <input
                    type="text"
                    value={companyForm.rfc}
                    onChange={(e) => setCompanyForm({ ...companyForm, rfc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    placeholder="ABC123456XYZ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label>
                  <select
                    value={companyForm.currency}
                    onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="USD">USD</option>
                    <option value="MXN">MXN</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mes Inicio Fiscal</label>
                  <select
                    value={companyForm.fiscal_year_start}
                    onChange={(e) => setCompanyForm({ ...companyForm, fiscal_year_start: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Asignar Administrador</label>
                <UserAutocomplete
                  label="Asignar Administrador"
                  value={companyForm.admin_user_id}
                  onChange={(val) => setCompanyForm({ ...companyForm, admin_user_id: val as string })}
                  placeholder="Buscar usuario..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Máximo de Usuarios *</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 5, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, max_users: val })}
                      className={`flex-1 py-2 text-sm font-bold rounded-xl border transition-all ${companyForm.max_users === val
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 ml-1">
                  Total de cuentas de usuario permitidas para esta empresa.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCompanyModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCompany}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Crear Empresa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="juan@example.com"
                />
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña *</label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      placeholder="********"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userForm.is_super_admin}
                      onChange={(e) => setUserForm({ ...userForm, is_super_admin: e.target.checked })}
                      className="rounded"
                    />
                    <label className="text-sm text-slate-700">Es Super Administrador</label>
                  </div>
                </>
              )}

              {editingUser && (
                <p className="text-sm text-slate-600">
                  Para cambiar la contraseña, usa el botón <Lock className="w-3 h-3 inline" /> en la tabla de usuarios.
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setUserForm({ name: '', email: '', password: '', is_super_admin: false });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Cambiar Contraseña - {passwordUser.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="********"
                  minLength={8}
                />
                <p className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="********"
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordUser(null);
                  setPasswordForm({ password: '', password_confirmation: '' });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Asignar Usuario a Empresa</h3>

            <div className="space-y-4">
              <div>
                <UserAutocomplete
                  label="Usuario *"
                  value={assignForm.user_id}
                  onChange={(val) => setAssignForm({ ...assignForm, user_id: val as string })}
                  placeholder="Buscar usuario..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa *</label>
                <select
                  value={assignForm.company_id}
                  onChange={(e) => setAssignForm({ ...assignForm, company_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Seleccionar...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol *</label>
                <select
                  value={assignForm.role}
                  onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="admin">Administrador</option>
                  <option value="accountant">Contador</option>
                  <option value="viewer">Visor</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

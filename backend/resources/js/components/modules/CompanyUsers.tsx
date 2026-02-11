import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, Save, X, User as UserIcon, Shield, Mail } from 'lucide-react';
import axios from 'axios';
import { useCompany } from '../../contexts/CompanyContext';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'accountant' | 'viewer';
    is_active: boolean;
}

export default function CompanyUsers() {
    const { selectedCompany } = useCompany();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [form, setForm] = useState({
        name: '',
        email: '',
        role: 'viewer',
        password: '',
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedCompany) {
            fetchUsers();
        }
    }, [selectedCompany]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/company-users');
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingUser(null);
        setForm({ name: '', email: '', role: 'viewer', password: '' });
        setShowModal(true);
        setError(null);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setForm({ name: user.name, email: user.email, role: user.role, password: '' });
        setShowModal(true);
        setError(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario de la empresa?')) return;
        try {
            await axios.delete(`/api/company-users/${id}`);
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || "Error al eliminar usuario");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingUser) {
                await axios.put(`/api/company-users/${editingUser.id}`, form);
            } else {
                await axios.post('/api/company-users', form);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al guardar usuario");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Usuarios de la Empresa</h1>
                    <p className="text-slate-500 text-sm">Gestiona el acceso y roles de los usuarios en {selectedCompany?.name}</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                                <th className="px-6 py-4">Usuario</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Cargando usuarios...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No se encontraron usuarios</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{user.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'accountant' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'}
                      `}>
                                                {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    placeholder="juan@empresa.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="accountant">Contador</option>
                                    <option value="viewer">Observador</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    {form.role === 'admin' && "Acceso total a la configuración y usuarios de esta empresa."}
                                    {form.role === 'accountant' && "Puede crear y gestionar registros contables, pero no usuarios."}
                                    {form.role === 'viewer' && "Solo lectura de reportes y registros."}
                                </p>
                            </div>

                            {(!editingUser || form.password) && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        minLength={8}
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="********"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                >
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

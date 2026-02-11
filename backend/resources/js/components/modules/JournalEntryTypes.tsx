import React, { useState, useEffect } from 'react';
import {
    FileText,
    Plus,
    Trash2,
    Edit2,
    X,
    CheckCircle,
    AlertCircle,
    Hash,
    Type,
    Activity,
    ArrowRight
} from 'lucide-react';
import { journalEntryTypes as typeApi } from '../../lib/api';
import { useCompany } from '../../contexts/CompanyContext';
import { JournalEntryType } from '../../types';
import { Card } from '../common/Card';
import { DataTable } from '../common/DataTable';

export default function JournalEntryTypes() {
    const { selectedCompany } = useCompany();
    const [types, setTypes] = useState<JournalEntryType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<JournalEntryType | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        active: true,
    });
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const loadTypes = async () => {
        if (!selectedCompany) return;
        setLoading(true);
        try {
            const res = await typeApi.getAll();
            const list = Array.isArray(res) ? res : (res?.data ?? []);
            setTypes(list as JournalEntryType[]);
        } catch (error) {
            console.error('Error loading types:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTypes();
    }, [selectedCompany]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        try {
            if (editing) {
                await typeApi.update(editing.id, formData);
            } else {
                await typeApi.create(formData);
            }
            setShowModal(false);
            loadTypes();
        } catch (error: any) {
            if (error.errors) {
                setErrors(error.errors);
            } else {
                alert(error.message || 'Error guardando el tipo de partida');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este tipo de partida?')) return;
        try {
            await typeApi.delete(id);
            loadTypes();
        } catch (error: any) {
            alert(error.message || 'No se puede eliminar el tipo de partida (puede tener movimientos asociados)');
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Tipos de Partida</h1>

            <Card
                title="Lista de Tipos de Partida"
                headerRight={
                    <button
                        onClick={() => {
                            setEditing(null);
                            setFormData({ code: '', name: '', active: true });
                            setErrors({});
                            setShowModal(true);
                        }}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 inline-block mr-2" /> Nuevo Tipo
                    </button>
                }
            >
                <DataTable
                    columns={[
                        { key: 'code', label: 'Código' },
                        { key: 'name', label: 'Nombre' },
                        { key: 'state', label: 'Estado' },
                        { key: 'actions', label: 'Acciones' },
                    ]}
                >
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-4 border-slate-900/10 border-t-slate-900 rounded-full animate-spin" />
                                    <p className="text-sm text-slate-400">Cargando configuraciones...</p>
                                </div>
                            </td>
                        </tr>
                    ) : types.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-20 text-center">
                                <p className="text-slate-400">No hay tipos de partida definidos.</p>
                            </td>
                        </tr>
                    ) : (
                        types.map((type) => (
                            <tr key={type.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{type.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    {type.active ? (
                                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Activo</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">Inactivo</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditing(type);
                                                setFormData({ code: type.code, name: type.name, active: type.active });
                                                setErrors({});
                                                setShowModal(true);
                                            }}
                                            title="Editar"
                                            aria-label="Editar"
                                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {type.has_entries ? (
                                            <button
                                                disabled
                                                title="No se puede eliminar: tiene movimientos contables"
                                                aria-label="No se puede eliminar"
                                                className="p-2 text-slate-300 opacity-60 cursor-not-allowed rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                title="Eliminar"
                                                aria-label="Eliminar"
                                                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </DataTable>
            </Card>

            {/* Modal (kept but adjusted styles to match guide) */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-3">
                                <div className="bg-slate-900 text-white p-2 rounded-md shadow-sm">
                                    {editing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                {editing ? 'Editar Tipo' : 'Nuevo Tipo'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Código (Max 10 chars)</label>
                                <input
                                    type="text"
                                    disabled={!!editing}
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="Ej: PD, PI, PE..."
                                    className={`w-full px-4 py-2 bg-slate-50 border ${errors.code ? 'border-rose-200 ring-4 ring-rose-50' : 'border-slate-100'} rounded-lg focus:ring-2 focus:ring-slate-500 outline-none font-medium text-slate-700 transition-colors ${editing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {errors.code && <p className="text-sm text-rose-500 mt-2">{errors.code[0]}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del Tipo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Poliza de Diario"
                                    className={`w-full px-4 py-2 bg-slate-50 border ${errors.name ? 'border-rose-200 ring-4 ring-rose-50' : 'border-slate-100'} rounded-lg focus:ring-2 focus:ring-slate-500 outline-none font-medium text-slate-700 transition-colors`}
                                />
                                {errors.name && <p className="text-sm text-rose-500 mt-2">{errors.name[0]}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-500"
                                />
                                <label htmlFor="active" className="text-sm font-medium text-slate-700">Tipo Activo</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    {editing ? 'Actualizar' : 'Crear Tipo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { journalEntries as journalApi } from '../../lib/api';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react';
import type { JournalEntry } from '../../types';

export function JournalEntries() {
  const { selectedCompany } = useCompany();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState({
    entry_number: '',
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadEntries();
    }
  }, [selectedCompany]);

  const loadEntries = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await journalApi.getAll();
      const list = Array.isArray(response) ? response : (response.data || []);
      setEntries(list);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        entry_number: formData.entry_number,
        entry_date: formData.entry_date,
        description: formData.description,
      };

      if (editing) {
        await journalApi.update(editing.id, data);
      } else {
        await journalApi.create(data);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ entry_number: '', entry_date: new Date().toISOString().split('T')[0], description: '' });
      loadEntries();
      alert('Póliza guardada. Recuerda agregar las líneas de detalle.');
    } catch (error: any) {
      console.error('Error saving entry:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handlePost = async (entry: JournalEntry) => {
    if (!confirm(`¿Contabilizar póliza ${entry.entry_number}? Esta acción no se puede deshacer.`)) return;

    try {
      await journalApi.post(entry.id);
      loadEntries();
      alert('Póliza contabilizada exitosamente');
    } catch (error: any) {
      console.error('Error posting entry:', error);
      alert('Error al contabilizar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleVoid = async (entry: JournalEntry) => {
    if (!confirm(`¿Anular póliza ${entry.entry_number}?`)) return;

    try {
      await journalApi.void(entry.id);
      loadEntries();
      alert('Póliza anulada exitosamente');
    } catch (error: any) {
      console.error('Error voiding entry:', error);
      alert('Error al anular: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id: number, entryNumber: string) => {
    if (!confirm(`¿Eliminar póliza "${entryNumber}"?`)) return;

    try {
      await journalApi.delete(id);
      loadEntries();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      posted: { label: 'Contabilizada', className: 'bg-green-100 text-green-800' },
      void: { label: 'Anulada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Pólizas Contables</h2>
          <p className="text-slate-600">Asientos de diario y movimientos contables</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ entry_number: '', entry_date: new Date().toISOString().split('T')[0], description: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Póliza
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">N° Póliza</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                    No hay pólizas registradas
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{entry.entry_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{entry.entry_date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{entry.description}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(entry.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        {entry.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handlePost(entry)}
                              className="text-green-600 hover:text-green-800"
                              title="Contabilizar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id, entry.entry_number)}
                              className="text-red-600 hover:text-red-800"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {entry.status === 'posted' && (
                          <button
                            onClick={() => handleVoid(entry)}
                            className="text-orange-600 hover:text-orange-800"
                            title="Anular"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editing ? 'Editar Póliza' : 'Nueva Póliza'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">N° de Póliza *</label>
                  <input
                    type="text"
                    value={formData.entry_number}
                    onChange={(e) => setFormData({ ...formData, entry_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="P-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={3}
                  placeholder="Descripción de la póliza contable"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Esta versión simplificada solo crea la póliza. Las líneas de débito/crédito
                  se deben agregar posteriormente a través de una actualización.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setFormData({ entry_number: '', entry_date: new Date().toISOString().split('T')[0], description: '' });
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

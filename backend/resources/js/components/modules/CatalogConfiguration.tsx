import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { accountingSegments as segmentsApi } from '../../lib/api';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

interface Segment {
  id: number;
  segment_number: number;
  segment_name: string;
  length: number;
  is_active: boolean;
}

export function CatalogConfiguration() {
  const { selectedCompany } = useCompany();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Segment | null>(null);
  const [formData, setFormData] = useState({
    segment_number: '1',
    segment_name: '',
    length: '2',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadSegments();
    }
  }, [selectedCompany]);

  const loadSegments = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await segmentsApi.getAll();
      const list = Array.isArray(response) ? response : (response.data || []);
      setSegments(list);
    } catch (error) {
      console.error('Error loading segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        segment_number: parseInt(formData.segment_number),
        segment_name: formData.segment_name,
        length: parseInt(formData.length),
        is_active: true,
      };

      if (editing) {
        await segmentsApi.update(editing.id, data);
      } else {
        await segmentsApi.create(data);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ segment_number: '1', segment_name: '', length: '2' });
      loadSegments();
    } catch (error: any) {
      console.error('Error saving segment:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditing(segment);
    setFormData({
      segment_number: segment.segment_number.toString(),
      segment_name: segment.segment_name,
      length: segment.length.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar segmento "${name}"?`)) return;

    try {
      await segmentsApi.delete(id);
      loadSegments();
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Configuración del Catálogo de Cuentas</h2>
          <p className="text-slate-600">Define la estructura de segmentos del catálogo contable</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ segment_number: '1', segment_name: '', length: '2' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Segmento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">N° Segmento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Longitud</th>
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
              ) : segments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600">
                    No hay segmentos configurados
                  </td>
                </tr>
              ) : (
                segments.map((segment) => (
                  <tr key={segment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{segment.segment_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{segment.segment_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{segment.length} dígitos</td>
                    <td className="px-4 py-3 text-sm">
                      {segment.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(segment)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(segment.id, segment.segment_name)}
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
              {editing ? 'Editar Segmento' : 'Nuevo Segmento'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">N° de Segmento *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.segment_number}
                  onChange={(e) => setFormData({ ...formData, segment_number: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Segmento *</label>
                <input
                  type="text"
                  value={formData.segment_name}
                  onChange={(e) => setFormData({ ...formData, segment_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Tipo de Cuenta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitud (dígitos) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="2"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 Ejemplo: Si defines 3 segmentos con longitudes 2-2-2, tu catálogo será de la forma XX-XX-XX (01-01-01, 01-02-01, etc.)
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setFormData({ segment_number: '1', segment_name: '', length: '2' });
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

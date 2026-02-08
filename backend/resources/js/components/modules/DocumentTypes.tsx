import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { documentTypes as docTypesApi } from '../../lib/api';
import { FileText, Plus, Edit2, Trash2 } from 'lucide-react';

export function DocumentTypes() {
  const { selectedCompany } = useCompany();
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
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
      loadDocumentTypes();
    }
  }, [selectedCompany]);

  const loadDocumentTypes = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await docTypesApi.getAll();
      const list = Array.isArray(response) ? response : (response.data || []);
      setDocumentTypes(list);
    } catch (error) {
      console.error('Error loading document types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await docTypesApi.update(editing.id, formData);
      } else {
        await docTypesApi.create(formData);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', description: '' });
      loadDocumentTypes();
    } catch (error: any) {
      console.error('Error saving document type:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (docType: any) => {
    setEditing(docType);
    setFormData({
      code: docType.code,
      name: docType.name,
      description: docType.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar tipo de documento "${name}"?`)) return;

    try {
      await docTypesApi.delete(id);
      loadDocumentTypes();
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Tipos de Documento</h2>
          <p className="text-slate-600">Configuración de tipos de documentos contables</p>
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
          Nuevo Tipo
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
              ) : documentTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600">
                    No hay tipos de documento configurados
                  </td>
                </tr>
              ) : (
                documentTypes.map((docType) => (
                  <tr key={docType.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{docType.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{docType.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{docType.description || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(docType)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(docType.id, docType.name)}
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
              {editing ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="FAC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Factura"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={2}
                  placeholder="Descripción del tipo de documento"
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

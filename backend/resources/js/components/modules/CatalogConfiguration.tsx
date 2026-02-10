import { useEffect, useState, useRef } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { accountingSegments as segmentsApi, accounts as accountsApi } from '../../lib/api';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

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
      // Normalize backend fields to frontend Segment interface
      const normalized = list.map((s: any) => ({
        id: s.id,
        segment_number: s.code ?? '',
        segment_name: s.name ?? '',
        length: Number(s.digit_length ?? s.length ?? 0),
        is_active: Boolean(s.active ?? s.is_active ?? false),
      }));
      setSegments(normalized);
    } catch (error) {
      console.error('Error loading segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Basic frontend validation
    if (!formData.segment_number || formData.segment_number.trim() === '') {
      setFormErrors({ ...formErrors, segment_number: 'El número de segmento es obligatorio' });
      return;
    }

    if (!formData.segment_name || formData.segment_name.trim() === '') {
      setFormErrors({ ...formErrors, segment_name: 'El nombre del segmento es obligatorio' });
      return;
    }

    const len = Number(formData.length);
    if (!Number.isFinite(len) || len < 1) {
      setFormErrors({ ...formErrors, length: 'La longitud debe ser un número válido mayor o igual a 1' });
      return;
    }

    try {
      // Map frontend fields to backend expected fields
      const payload: any = {
        code: String(formData.segment_number),
        name: formData.segment_name,
        digit_length: len,
        active: true,
      };

      if (editing) {
        await segmentsApi.update(editing.id, payload);
      } else {
        await segmentsApi.create(payload);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ segment_number: '1', segment_name: '', length: '2' });
      loadSegments();
    } catch (error: any) {
      console.error('Error saving segment:', error);
      // backend returns { errors: { field: [..] } }
      if (error?.response?.data?.errors) {
        const errs = error.response.data.errors;
        const messages = Object.keys(errs).map(k => `${k}: ${errs[k].join(', ')}`).join('\n');
        alert('Error al guardar:\n' + messages);
      } else {
        alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
      }
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditing(segment);
    setFormData({
      segment_number: String(segment.segment_number ?? ''),
      segment_name: segment.segment_name ?? '',
      length: String(segment.length ?? '1'),
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

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const rows = content.split('\n').map(row => row.split(','));
          const headers = rows.shift();

          if (!headers || headers.length < 9) {
            alert('El archivo CSV no tiene la estructura correcta.');
            return;
          }

          const catalogData = rows.map(row => ({
            code: row[0],
            name: row[1],
            account_type: row[2],
            nature: row[3],
            parent_code: row[4],
            level: parseInt(row[5], 10),
            is_postable: row[6] === 'TRUE',
            affects_tax: row[7] === 'TRUE',
            tax_type: row[8] || null,
          }));

          setPreviewData(catalogData);
          setIsPreviewVisible(true);
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Error al procesar el archivo: ' + (error as any).message);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmUpload = async () => {
    try {
      await accountsApi.import(previewData);
      alert('Catálogo cargado correctamente');
      setPreviewData([]);
      setIsPreviewVisible(false);
      loadSegments();
    } catch (error) {
      console.error('Error uploading catalog:', error);
      alert('Error al cargar catálogo: ' + (error as any).message);
    }
  };

  const handleCancelUpload = () => {
    setPreviewData([]);
    setIsPreviewVisible(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.csv' });

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
                    <td className="px-4 py-3 text-sm text-slate-600">{(Number.isFinite(segment.length) ? segment.length : 0)} dígitos</td>
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

      <div className="mt-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Importar Catálogo</h3>
        <div
          {...getRootProps({
            className: 'border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-slate-400',
          })}
        >
          <input {...getInputProps()} />
          <p className="text-slate-600">Arrastra y suelta un archivo CSV aquí, o haz clic para seleccionar uno</p>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Nota: Este proceso es esencial al inicio de la configuración de la empresa para estructurar correctamente el catálogo contable.
        </p>

        <div className="mt-3">
          <a
            href="/plantilla.csv"
            download
            className="inline-block px-3 py-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200"
            title="Descargar plantilla CSV"
          >
            Descargar plantilla CSV
          </a>
          <span className="ml-3 text-sm text-slate-500">Descarga una plantilla para ver las columnas necesarias</span>
        </div>

        {isPreviewVisible && (
          <div className="mt-6">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Vista Previa del Catálogo</h4>
            <table className="w-full border-collapse border border-slate-300">
              <thead>
                <tr>
                  <th className="border border-slate-300 px-4 py-2">Código</th>
                  <th className="border border-slate-300 px-4 py-2">Nombre</th>
                  <th className="border border-slate-300 px-4 py-2">Tipo</th>
                  <th className="border border-slate-300 px-4 py-2">Naturaleza</th>
                  <th className="border border-slate-300 px-4 py-2">Código Padre</th>
                  <th className="border border-slate-300 px-4 py-2">Nivel</th>
                  <th className="border border-slate-300 px-4 py-2">Imputable</th>
                  <th className="border border-slate-300 px-4 py-2">Afecta Impuestos</th>
                  <th className="border border-slate-300 px-4 py-2">Tipo de Impuesto</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-slate-300 px-4 py-2">{row.code}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.name}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.account_type}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.nature}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.parent_code}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.level}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.is_postable ? 'Sí' : 'No'}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.affects_tax ? 'Sí' : 'No'}</td>
                    <td className="border border-slate-300 px-4 py-2">{row.tax_type || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmUpload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Cargar
              </button>
            </div>
          </div>
        )}
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
                  onChange={(e) => { setFormErrors({ ...formErrors, segment_number: '' }); setFormData({ ...formData, segment_number: e.target.value }); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${formErrors.segment_number ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="1"
                />
                {formErrors.segment_number && <p className="text-xs text-red-600 mt-1">{formErrors.segment_number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Segmento *</label>
                <input
                  type="text"
                  value={formData.segment_name}
                  onChange={(e) => { setFormErrors({ ...formErrors, segment_name: '' }); setFormData({ ...formData, segment_name: e.target.value }); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${formErrors.segment_name ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="Tipo de Cuenta"
                />
                {formErrors.segment_name && <p className="text-xs text-red-600 mt-1">{formErrors.segment_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Longitud (dígitos) *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.length}
                  onChange={(e) => { setFormErrors({ ...formErrors, length: '' }); setFormData({ ...formData, length: e.target.value }); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 ${formErrors.length ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="2"
                />
                {formErrors.length && <p className="text-xs text-red-600 mt-1">{formErrors.length}</p>}
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

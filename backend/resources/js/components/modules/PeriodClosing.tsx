import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { accountingPeriods as periodsApi } from '../../lib/api';
import { Calendar, Lock, Unlock, Plus, Trash2 } from 'lucide-react';

interface Period {
  id: number;
  year: number;
  month: number;
  period_name: string;
  start_date: string;
  end_date: string;
  is_closed: boolean;
}

export function PeriodClosing() {
  const { selectedCompany } = useCompany();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [yearToGenerate, setYearToGenerate] = useState(new Date().getFullYear());

  useEffect(() => {
    if (selectedCompany) {
      loadPeriods();
    }
  }, [selectedCompany]);

  const loadPeriods = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await periodsApi.getAll();
      const list = Array.isArray(response) ? response : (response.data || []);
      setPeriods(list);
    } catch (error) {
      console.error('Error loading periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClose = async (period: Period) => {
    const action = period.is_closed ? 'abrir' : 'cerrar';
    if (!confirm(`¿Seguro que deseas ${action} el período ${period.period_name}?`)) return;

    try {
      if (period.is_closed) {
        await periodsApi.reopen(period.id);
      } else {
        await periodsApi.close(period.id);
      }
      loadPeriods();
      alert(`Período ${action === 'cerrar' ? 'cerrado' : 'abierto'} exitosamente`);
    } catch (error: any) {
      console.error(`Error ${action} period:`, error);
      alert(`Error al ${action} período: ` + (error?.message || 'Error desconocido'));
    }
  };

  const handleGenerateYear = async () => {
    if (!yearToGenerate || yearToGenerate < 2000 || yearToGenerate > 2100) {
      alert('Por favor ingresa un año válido');
      return;
    }

    if (!confirm(`¿Generar 12 períodos para el año ${yearToGenerate}?`)) return;

    try {
      await periodsApi.generateYear(yearToGenerate);
      alert('Períodos generados exitosamente');
      setShowGenerateModal(false);
      loadPeriods();
    } catch (error: any) {
      console.error('Error generating year:', error);
      alert('Error al generar año: ' + (error?.response?.data?.message || error?.message || 'Error desconocido'));
    }
  };

  const handleDeletePeriod = async (period: Period) => {
    if (period.is_closed) {
      alert('No se puede eliminar un período cerrado. Primero debes reabrirlo.');
      return;
    }

    if (!confirm(`¿Eliminar período ${period.period_name}? Esta acción no se puede deshacer.`)) return;

    try {
      await periodsApi.delete(period.id);
      alert('Período eliminado exitosamente');
      loadPeriods();
    } catch (error: any) {
      console.error('Error deleting period:', error);
      alert('Error al eliminar período: ' + (error?.response?.data?.message || error?.message || 'Error desconocido'));
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Períodos Contables</h2>
          <p className="text-slate-600">Gestión y cierre de períodos fiscales</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Calendar className="w-4 h-4" />
          Generar Año
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Año</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Mes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Período</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha Inicio</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha Fin</th>
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
              ) : periods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    No hay períodos configurados
                  </td>
                </tr>
              ) : (
                periods.map((period) => (
                  <tr key={period.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{period.year}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{period.month}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{period.period_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{period.start_date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{period.end_date}</td>
                    <td className="px-4 py-3 text-sm">
                      {period.is_closed ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cerrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Abierto
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleClose(period)}
                          className={`p-1 ${
                            period.is_closed ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                          } rounded`}
                          title={period.is_closed ? 'Reabrir período' : 'Cerrar período'}
                        >
                          {period.is_closed ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeletePeriod(period)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                          title={period.is_closed ? 'Reabre el período para eliminarlo' : 'Eliminar período'}
                          disabled={period.is_closed}
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

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ℹ️ <strong>Importante:</strong> Un período cerrado no permite modificaciones en transacciones.
          Solo reabre períodos si es absolutamente necesario.
        </p>
      </div>

      {/* Generate Year Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Generar Períodos del Año</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Año *
                </label>
                <input
                  type="number"
                  value={yearToGenerate}
                  onChange={(e) => setYearToGenerate(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="2024"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Se generarán 12 períodos mensuales (Enero a Diciembre)
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateYear}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

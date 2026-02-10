import { useEffect, useState, Fragment } from 'react';
import { usePersistedState } from '../../hooks/usePersistedState';
import { useCompany } from '../../contexts/CompanyContext';
import { accountingPeriods as periodsApi, ApiClient } from '../../lib/api';
import { Calendar, Lock, Unlock, Plus, Trash2, Edit2, ChevronDown, ChevronRight } from 'lucide-react';

interface Period {
  id?: number;
  fiscal_year?: number;
  year: number;
  month?: number | null;
  period_number?: number | null;
  period_name?: string | null;
  is_closed: boolean;
}

export function PeriodClosing() {
  const { selectedCompany } = useCompany();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [yearToGenerate, setYearToGenerate] = useState(new Date().getFullYear());

  // Crear periodo individual (casos especiales)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createYear, setCreateYear] = useState(new Date().getFullYear());
  const [createMonth, setCreateMonth] = useState(new Date().getMonth() + 1);
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');

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

  // Abrir modal de edición / cambiar estado (abrir/cerrar)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleToggleClose = (period: Period) => {
    // Abrimos el modal para confirmar o editar antes de cerrar/abrir
    setEditingPeriod(period);
    setShowEditModal(true);
  };

  const handleSaveEditing = async (updated: { is_closed?: boolean }) => {
    if (!editingPeriod) return;
    try {
      if (typeof updated.is_closed !== 'undefined') {
        if (updated.is_closed && !editingPeriod.is_closed) {
          await periodsApi.close(editingPeriod.id);
        } else if (!updated.is_closed && editingPeriod.is_closed) {
          await periodsApi.reopen(editingPeriod.id);
        }
      }

      setShowEditModal(false);
      setEditingPeriod(null);
      loadPeriods();
      alert('Periodo actualizado correctamente');
    } catch (error: any) {
      console.error('Error saving period:', error);
      alert('Error al guardar periodo: ' + (error?.response?.data?.message || error?.message || 'Error desconocido'));
    }
  };

  const handleOpenEdit = (period: Period) => {
    setEditingPeriod(period);
    setShowEditModal(true);
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

    // Verificamos si existen movimientos en el periodo
    try {
      const res = await ApiClient.get<any>(`/journal-entries?year=${period.year}&month=${period.month}&per_page=1`);
      if (res && (res.total || (res.data && res.data.length > 0))) {
        const total = res.total ?? (res.data ? res.data.length : 0);
        if (total > 0) {
          alert('No se puede eliminar el período porque existen movimientos en ese periodo.');
          return;
        }
      }
    } catch (err) {
      console.warn('Error al verificar movimientos del periodo:', err);
      // Continuamos y dejamos que el backend valide si es posible eliminar
    }

    if (!confirm(`¿Eliminar período ${period.year}-${String(period.month).padStart(2,'0')}? Esta acción no se puede deshacer.`)) return;

    try {
      await periodsApi.delete(period.id);
      alert('Período eliminado exitosamente');
      loadPeriods();
    } catch (error: any) {
      console.error('Error deleting period:', error);
      alert('Error al eliminar período: ' + (error?.response?.data?.message || error?.message || 'Error desconocido'));
    }
  };

  // Formatea una fecha a dd-mmm-yyyy (ej. 09-feb-2026)
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Sin definir';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Sin definir';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\s+/g, '-');
  };

  // Persistimos qué años están expandidos para que la UI sea manejable cuando crezca
  const [expandedYears, setExpandedYears] = usePersistedState<number[]>('periods_expanded_years', [new Date().getFullYear()]);

  const toggleYear = (year: number) => {
    setExpandedYears((prev = []) => {
      const set = new Set(prev);
      if (set.has(year)) set.delete(year);
      else set.add(year);
      return Array.from(set).sort((a,b) => b - a);
    });
  };

  const expandAllYears = () => {
    const years = Array.from(new Set(periods.map(p => p.year))).sort((a,b) => b - a);
    setExpandedYears(years);
  };

  const collapseAllYears = () => setExpandedYears([]);

  const groupedByYear = (): Array<{ year: number; periods: Period[] }> => {
    const map = new Map<number, Period[]>();
    periods.forEach(p => {
      if (!map.has(p.year)) map.set(p.year, []);
      map.get(p.year)!.push(p);
    });

    return Array.from(map.entries()).map(([year, list]) => ({ year, periods: list.sort((a,b) => a.month - b.month) })).sort((a,b) => b.year - a.year);
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
          >
            <Calendar className="w-4 h-4" />
            Generar Año
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50"
          >
            <Plus className="w-4 h-4" />
            Crear Período
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Año</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Mes</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Período</th>
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
                groupedByYear().map((group) => (
                  <Fragment key={`year-${group.year}`}>
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-3 text-sm font-medium text-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggleYear(group.year)} className="text-slate-600">
                              {expandedYears.includes(group.year) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <span className="text-slate-800 font-bold">{group.year}</span>
                            <span className="ml-3 text-sm text-slate-600">({group.periods.length} períodos)</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => expandAllYears()} className="text-sm text-slate-600 hover:underline">Expandir todos</button>
                            <button onClick={() => collapseAllYears()} className="text-sm text-slate-600 hover:underline">Colapsar todos</button>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {expandedYears.includes(group.year) && group.periods.map((period) => (
                      <tr key={`period-${period.id ?? `${period.year}-${period.period_number ?? period.month ?? '00'}`}`} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{period.year}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{(period.period_number === 0 || !period.month) ? 'Anual' : String(period.month).padStart(2,'0')}</td>
                        <td className="px-4 py-3 text-sm text-slate-800">{period.period_name || ((period.period_number === 0 || !period.month) ? 'Anual' : `${period.year}-${String(period.month).padStart(2,'0')}`)}</td>
                        <td className="px-4 py-3 text-sm">
                          {period.is_closed ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cerrado</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Abierto</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleOpenEdit(period)}
                              className="p-1 text-slate-600 hover:bg-slate-50 rounded"
                              title="Editar período"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleClose(period)}
                              className={`p-1 ${period.is_closed ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'} rounded`}
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
                    ))}
                  </Fragment>
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
        <p className="text-xs text-slate-600 mt-2">Al crear o generar períodos, por defecto quedan <strong>abiertos</strong>. Un período sólo puede ser eliminado si no tiene movimientos en el rango de fechas.</p>
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
                  Se generarán 12 períodos mensuales (Enero a Diciembre). Por defecto quedan <strong>abiertos</strong>.
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
                onClick={async () => {
                  try {
                    await handleGenerateYear();
                    // After generating, open the year so user sees periods
                    setExpandedYears((prev) => Array.from(new Set([...prev, yearToGenerate])));
                  } catch (err) {
                    // handleGenerateYear already alerts on error
                  }
                }}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Single Period Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Crear Período (Caso Especial)</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Año *</label>
                  <input type="number" value={createYear} min={2000} max={2100} onChange={(e) => setCreateYear(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Mes *</label>
                  <input type="number" value={createMonth} min={1} max={12} onChange={(e) => setCreateMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Fecha Inicio *</label>
                <input type="date" value={createStartDate} onChange={(e) => setCreateStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">Fecha Fin *</label>
                <input type="date" value={createEndDate} onChange={(e) => setCreateEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
              </div>

              <p className="text-xs text-slate-500">Por defecto el período se crea <strong>abierto</strong>. Puedes cerrarlo posteriormente.</p>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={async () => {
                  if (!createYear || createMonth < 1 || createMonth > 12 || !createStartDate || !createEndDate) {
                    alert('Por favor completa los campos correctamente');
                    return;
                  }
                  try {
                    await periodsApi.create({ year: createYear, month: createMonth, start_date: createStartDate, end_date: createEndDate, is_closed: false });
                    alert('Periodo creado correctamente');
                    setShowCreateModal(false);
                    // expand the year so the user can see the just-created period
                    setExpandedYears((prev) => Array.from(new Set([...prev, createYear])));
                    loadPeriods();
                  } catch (err: any) {
                    console.error('Error creating period:', err);
                    alert('Error al crear periodo: ' + (err?.response?.data?.message || err?.message || 'Error desconocido'));
                  }
                }} className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Crear</button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Period Modal */}
      {showEditModal && editingPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Editar Período</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Año</label>
                  <input type="number" value={editingPeriod.year} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Mes</label>
                  <input type="number" value={editingPeriod.month} readOnly className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="edit-closed" defaultChecked={editingPeriod.is_closed} />
                <label htmlFor="edit-closed" className="text-sm text-slate-700">Marcar como cerrado</label>
              </div>

              <p className="text-xs text-slate-500">Si marcas como cerrado y el período tiene transacciones válidas, la acción podría ser restringida por el servidor.</p>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => { setShowEditModal(false); setEditingPeriod(null); }} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Cancelar</button>
              <button onClick={async () => {
                const isClosed = (document.getElementById('edit-closed') as HTMLInputElement).checked;
                await handleSaveEditing({ is_closed: isClosed });
              }} className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Guardar</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

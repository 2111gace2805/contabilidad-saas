import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { journalEntries as journalApi } from '../../lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { Card } from '../common/Card';
import { DataTable } from '../common/DataTable';

// UI styles for this component follow `documentacion/GUIA_DISENO_ESTILOS.md`.
// Use card: "bg-white border border-slate-200 rounded-lg shadow-sm p-6" and
// tables with: thead "bg-slate-50 border-b border-slate-200" and
// tbody "bg-white divide-y divide-slate-200" and rows "hover:bg-slate-50".

import { AccountAutocomplete } from '../common/AccountAutocomplete';
import { journalEntryTypes as journalTypesApi } from '../../lib/api';
import type { JournalEntry } from '../../types';

export function JournalEntries() {
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);

  // Voiding state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [entryToVoid, setEntryToVoid] = useState<JournalEntry | null>(null);

  const [formData, setFormData] = useState({
    entry_number: '',
    entry_date: new Date().toISOString().split('T')[0],
    entry_type: 'PD',
    description: '',
  });

  const [journalTypes, setJournalTypes] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Lines (details) for the journal entry
  const [lines, setLines] = useState<any[]>([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0 });

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const debit = lines.reduce((s, l) => s + (Number(l.debit || 0) || 0), 0);
    const credit = lines.reduce((s, l) => s + (Number(l.credit || 0) || 0), 0);
    setTotals({ debit, credit });
  }, [lines]);

  useEffect(() => {
    if (selectedCompany) {
      loadEntries();
    }
  }, [selectedCompany]);

  useEffect(() => {
    // load available journal entry types for the selector
    const load = async () => {
      try {
        const res = await journalTypesApi.getAll();
        const list = Array.isArray(res) ? res : (res.data || []);
        setJournalTypes(list);
      } catch (err) {
        console.error('Error loading journal entry types:', err);
      }
    };

    load();
  }, [selectedCompany]);

  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    entry_type: '',
    entry_number: '',
    description: '',
  });

  const loadEntries = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.entry_type) params.append('entry_type', filters.entry_type);
      if (filters.entry_number) params.append('entry_number', filters.entry_number);
      if (filters.description) params.append('description', filters.description);

      const response = await journalApi.getAll(params.toString());
      const list = Array.isArray(response) ? response : (response.data || []);
      setEntries(list);
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEntries();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handlePost = async (entry: JournalEntry) => {
    if (!confirm(`¿Contabilizar póliza? Se le asignará un correlativo permanente y no podrá ser editada.`)) return;

    try {
      const full = await journalApi.getById(entry.id);
      const e = (full && ((full as any).data || full)) as JournalEntry;
      if (!(e.lines || []).length) {
        alert('No es posible contabilizar: la póliza no tiene líneas.');
        return;
      }

      const debit = (e.lines || []).reduce((s, l) => s + (Number(l.debit || 0) || 0), 0);
      const credit = (e.lines || []).reduce((s, l) => s + (Number(l.credit || 0) || 0), 0);

      if (Math.abs(debit - credit) > 0.01) {
        alert('No es posible contabilizar: las líneas no están cuadradas.');
        return;
      }

      await journalApi.post(entry.id);
      loadEntries();
      alert('Póliza contabilizada exitosamente');
    } catch (error: any) {
      console.error('Error posting entry:', error);
      alert('Error al contabilizar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleRequestVoid = async () => {
    if (!entryToVoid || voidReason.length < 10) {
      alert('Debes ingresar un motivo válido (mínimo 10 caracteres).');
      return;
    }

    try {
      await journalApi.requestVoid(entryToVoid.id, voidReason);
      setShowVoidModal(false);
      setVoidReason('');
      setEntryToVoid(null);
      loadEntries();
      alert('Solicitud de anulación enviada a revisión por el administrador.');
    } catch (error: any) {
      console.error('Error requesting void:', error);
      alert('Error al solicitar anulación: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleAuthorizeVoid = async (id: number) => {
    if (!confirm('¿Autorizar la anulación definitiva de esta póliza?')) return;

    try {
      await journalApi.authorizeVoid(id);
      loadEntries();
      alert('Póliza anulada exitosamente.');
    } catch (error: any) {
      console.error('Error authorizing void:', error);
      alert('Error al autorizar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`¿Eliminar este borrador?`)) return;

    try {
      await journalApi.delete(id);
      loadEntries();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const getStatusBadge = (status: string) => {
    const s = String(status).toUpperCase();
    const statusConfig = {
      DRAFT: { label: 'Borrador', className: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200' },
      POSTED: { label: 'Contabilizada', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
      PENDING_VOID: { label: 'Pendiente Anulación', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
      VOID: { label: 'Anulada', className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' },
      VOIDED: { label: 'Anulada', className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100' },
    };

    const config = statusConfig[s as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleSave = async (asPosted: boolean = false) => {
    if (!formData.entry_date) {
      alert('Ingrese fecha de la póliza');
      return;
    }

    const nonBlankLines = (lines || []).filter(l => l.account_id || Number(l.debit) !== 0 || Number(l.credit) !== 0);

    if (nonBlankLines.length === 0) {
      alert('La póliza debe tener al menos un movimiento contable.');
      return;
    }

    // Check for missing accounts
    if (nonBlankLines.some(l => !l.account_id)) {
      alert('Todas las líneas con montos deben tener una cuenta contable seleccionada.');
      return;
    }

    // New Validation: Ensure each line has either debit or credit, but not both
    for (const line of nonBlankLines) {
      const d = Number(line.debit || 0);
      const c = Number(line.credit || 0);
      if ((d !== 0 && c !== 0) || (d === 0 && c === 0)) {
        alert('Cada línea contable debe tener un cargo o un abono (no ambos ni ninguno).');
        return;
      }
    }

    if (asPosted && (Math.abs(totals.debit - totals.credit) >= 0.01 || totals.debit <= 0)) {
      alert('No es posible contabilizar: la póliza debe estar cuadrada y con montos mayores a cero.');
      return;
    }

    try {
      const payload = {
        ...formData,
        status: asPosted ? 'posted' : 'draft',
        lines: nonBlankLines.map((l, idx) => ({
          account_id: l.account_id,
          line_number: idx + 1,
          description: l.description || '',
          debit: l.debit || 0,
          credit: l.credit || 0,
        })),
      };

      if (editing) {
        await journalApi.update(editing.id, payload);
      } else {
        await journalApi.create(payload);
      }

      setShowModal(false);
      loadEntries();
      alert(asPosted ? 'Póliza contabilizada exitosamente.' : 'Borrador guardado correctamente.');
    } catch (error: any) {
      console.error('Error saving:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Libro Diario</h1>
          <p className="text-slate-600">
            Gestión de pólizas contables y control de movimientos.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setFormData({
              entry_number: '',
              entry_date: new Date().toISOString().split('T')[0],
              entry_type: 'PD',
              description: '',
            });
            setLines([
              { line_number: 1, account_id: undefined, description: '', debit: '0.00', credit: '0.00' },
              { line_number: 2, account_id: undefined, description: '', debit: '0.00', credit: '0.00' }
            ]);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Póliza
        </button>
      </div>

      {/* Grid / Table Section */}
      <Card
        title="Pólizas Contables"
        headerRight={
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar en todas las columnas..."
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none"
              value={filters.description}
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={loadEntries}
            >
              Filtrar
            </button>
          </div>
        }
      >
        <DataTable
          columns={[
            { key: 'entry_number', label: 'Número' },
            { key: 'correlativo', label: 'Correlativo' },
            { key: 'entry_date', label: 'Fecha' },
            { key: 'entry_type', label: 'Tipo' },
            { key: 'description', label: 'Descripción' },
            { key: 'status', label: 'Estado' },
            { key: 'actions', label: 'Acciones' },
          ]}
        >
          {entries.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.entry_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.correlativo}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.entry_date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.entry_type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{entry.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{getStatusBadge(entry.status)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                <div className="flex items-center gap-2">
                  <button className="text-blue-600 hover:text-blue-800" title="Editar" onClick={() => handleEdit(entry)}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-800" title="Contabilizar" onClick={() => handlePost(entry)}>
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Anular" onClick={() => handleVoid(entry)}>
                    <XCircle className="w-4 h-4" />
                  </button>
                  {String(entry.status).toUpperCase() === 'DRAFT' && (
                    <button className="text-rose-600 hover:text-rose-800" title="Eliminar" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-slate-600">
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, entries.length)}-
            {Math.min(currentPage * pageSize, entries.length)} de {entries.length} entradas
          </span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </button>
            <button
              className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-50"
              disabled={currentPage === Math.ceil(entries.length / pageSize)}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(entries.length / pageSize)))}
            >
              Siguiente
            </button>
          </div>
        </div>
      </Card>

      {/* Main Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {editing ? (
                    editing.status.toUpperCase() === 'DRAFT' ? 'Editar Borrador' : 'Detalle de Póliza'
                  ) : 'Nueva Póliza Contable'}
                </h3>
                {editing && (
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(editing.status)}
                    {editing.sequence_number && (
                      <span className="text-xs font-mono text-slate-500">
                        #{String(editing.sequence_number).padStart(7, '0')}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Header Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Registro</label>
                  <input
                    type="date"
                    readOnly={editing && editing.status.toUpperCase() !== 'DRAFT'}
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Partida</label>
                  <select
                    disabled={editing && editing.status.toUpperCase() !== 'DRAFT'}
                    value={formData.entry_type}
                    onChange={(e) => setFormData({ ...formData, entry_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    {journalTypes.length > 0 ? (
                      journalTypes.map((t: any) => (
                        <option key={t.id} value={t.code}>{`${t.code} - ${t.name}`}</option>
                      ))
                    ) : (
                      // fallback to known defaults
                      <>
                        <option value="PD">PD - Diario</option>
                        <option value="PI">PI - Ingresos</option>
                        <option value="PE">PE - Egresos</option>
                        <option value="PA">PA - Ajuste</option>
                        <option value="PB">PB - Bancos</option>
                        <option value="PC">PC - Caja</option>
                        <option value="PCIERRE">PCIERRE - Cierre</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correlativo</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono text-slate-600">
                    {editing?.entry_number || 'Generado autom.'}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Concepto / Descripción</label>
                  <textarea
                    readOnly={editing && editing.status.toUpperCase() !== 'DRAFT'}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm disabled:bg-slate-50 disabled:text-slate-500 min-h-[80px]"
                    placeholder="Descripción obligatoria de la operación..."
                  />
                </div>
              </div>

              {/* Transactions Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-700">Detalle de Movimientos</h4>
                  {(!editing || editing.status.toUpperCase() === 'DRAFT') && (
                    <button
                      onClick={() => {
                        const nextNum = (lines.length ? Math.max(...lines.map(l => Number(l.line_number || 0))) : 0) + 1;
                        setLines([...lines, { line_number: nextNum, account_id: undefined, description: '', debit: '0.00', credit: '0.00' }]);
                      }}
                      className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Línea
                    </button>
                  )}
                </div>

                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase w-1/3">Cuenta Contable</th>
                      <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase">Referencia / Detalle</th>
                      <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase text-right w-32">Debe</th>
                      <th className="px-4 py-2 text-xs font-medium text-slate-500 uppercase text-right w-32">Haber</th>
                      {(!editing || editing.status.toUpperCase() === 'DRAFT') && <th className="w-10"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((line, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50/50">
                        <td className="px-4 py-2 align-top">
                          <AccountAutocomplete
                            disabled={editing && editing.status.toUpperCase() !== 'DRAFT'}
                            value={line.account_id || ''}
                            onChange={(accountId) => {
                              const newLines = [...lines];
                              newLines[idx] = { ...newLines[idx], account_id: accountId as number };
                              setLines(newLines);
                            }}
                          />
                        </td>
                        <td className="px-4 py-2 align-top">
                          <input
                            type="text"
                            readOnly={editing && editing.status.toUpperCase() !== 'DRAFT'}
                            value={line.description || ''}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx] = { ...newLines[idx], description: e.target.value };
                              setLines(newLines);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
                            placeholder="Descripción opcional"
                          />
                        </td>
                        <td className="px-4 py-2 align-top">
                          <input
                            type="number"
                            step="0.01"
                            readOnly={editing && editing.status.toUpperCase() !== 'DRAFT'}
                            value={line.debit}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx] = { ...newLines[idx], debit: e.target.value };
                              setLines(newLines);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-right outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
                          />
                        </td>
                        <td className="px-4 py-2 align-top">
                          <input
                            type="number"
                            step="0.01"
                            readOnly={editing && editing.status.toUpperCase() !== 'DRAFT'}
                            value={line.credit}
                            onChange={(e) => {
                              const newLines = [...lines];
                              newLines[idx] = { ...newLines[idx], credit: e.target.value };
                              setLines(newLines);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-right outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50"
                          />
                        </td>
                        {(!editing || editing.status.toUpperCase() === 'DRAFT') && (
                          <td className="px-2 py-2 text-center align-top pt-3">
                            <button
                              onClick={() => {
                                const newLines = [...lines];
                                newLines.splice(idx, 1);
                                setLines(newLines);
                              }}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              title="Eliminar línea"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Totales</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 border-t-2 border-slate-300">
                        ${totals.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900 border-t-2 border-slate-300">
                        ${totals.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      {(!editing || editing.status.toUpperCase() === 'DRAFT') && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                {Math.abs(totals.debit - totals.credit) < 0.01 && totals.debit > 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Partida Cuadrada
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-600 text-sm font-medium">
                    <XCircle className="w-4 h-4" /> Partida Descuadrada (Diferencia: ${(Math.abs(totals.debit - totals.credit)).toFixed(2)})
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                Cerrar
              </button>

              {(!editing || editing.status.toUpperCase() === 'DRAFT') && (
                <>
                  <button
                    onClick={() => handleSave(false)}
                    className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                  >
                    Guardar Borrador
                  </button>
                  <button
                    disabled={Math.abs(totals.debit - totals.credit) >= 0.01 || totals.debit <= 0}
                    onClick={() => handleSave(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Contabilizar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Void Request Modal */}
      {showVoidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500" />
                Solicitar Anulación
              </h3>
              <button
                onClick={() => { setShowVoidModal(false); setVoidReason(''); }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800">
                  Las pólizas contabilizadas son inmutables. Esta acción solicitará una anulación que debe ser aprobada por un administrador.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Anulación</label>
                <textarea
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Por favor explique por qué se anula este registro..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none text-sm min-h-[100px]"
                ></textarea>
                <div className="text-right mt-1">
                  <span className={`text-xs ${voidReason.length < 10 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {voidReason.length} / 10 caracteres mín.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowVoidModal(false); setVoidReason(''); }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                disabled={voidReason.length < 10}
                onClick={handleRequestVoid}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Solicitar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { auditLogs } from '../../lib/api';
import type { AuditLog } from '../../types';

export function AuditLogs() {
  const { user } = useAuth();
  const { selectedCompany, userRole } = useCompany();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const canView = Boolean(user?.is_super_admin || userRole === 'admin');

  useEffect(() => {
    if (canView) {
      loadLogs();
    }
  }, [canView, selectedCompany?.id]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await auditLogs.getAll({ per_page: 100, action: action || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined });
      const list = Array.isArray((response as any)?.data) ? (response as any).data : [];
      setLogs(list);
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      alert(error?.message || 'No se pudo cargar auditoría.');
    } finally {
      setLoading(false);
    }
  };

  if (!canView) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium">Solo administradores pueden ver auditoría.</p>
      </div>
    );
  }

  if (!user?.is_super_admin && !selectedCompany) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium">Selecciona una empresa</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-1">Logs y Auditoría</h2>
        <p className="text-slate-600">Registro de acciones de usuarios y cambios contables.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Acción</label>
          <input
            type="text"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="ej: journal_entry"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Desde</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Hasta</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div className="flex items-end gap-2">
          <button onClick={loadLogs} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Filtrar</button>
          <button
            onClick={() => {
              setAction('');
              setDateFrom('');
              setDateTo('');
              setTimeout(loadLogs, 0);
            }}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Usuario</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Empresa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Acción</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Entidad</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">Cargando...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600">No hay registros de auditoría</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-700">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{log.user?.name || 'Sistema'}</td>
                <td className="px-4 py-3 text-sm text-slate-800">{log.company?.name || '-'}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-700">{log.action}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{log.entity_type || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{log.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useAuth } from '../../contexts/AuthContext';
import { dashboard } from '../../lib/api';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Package, XCircle } from 'lucide-react';
import type { DashboardStats } from '../../types';

export function Dashboard() {
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    total_assets: 0,
    total_liabilities: 0,
    equity: 0,
    revenue: 0,
    expenses: 0,
    net_income: 0,
    receivables: 0,
    payables: 0,
    inventory_value: 0,
    journal_entries_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany) {
      loadDashboardData();
    }
  }, [selectedCompany]);

  const loadDashboardData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const data = await dashboard.getStats();
      // merge API response with defaults to avoid undefined fields
      setStats((prev) => ({ ...prev, ...(data || {}) } as DashboardStats));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCompany) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium">Selecciona una empresa para comenzar</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  const formatCurrency = (value: any): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => {
    const formatted = formatCurrency(value);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-800">${formatted}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className={`${color} p-3 rounded-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Panel de Control</h2>
          <p className="text-slate-600 font-medium">{selectedCompany.name}</p>
        </div>

        {/* Audit Alert for Admins */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && stats.pending_voids_count && stats.pending_voids_count > 0 ? (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4 animate-pulse shadow-lg shadow-amber-200/50">
            <div className="bg-amber-500 p-2 rounded-xl text-white">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-amber-900 font-black text-xs uppercase tracking-widest">Alerta de Auditoría</p>
              <p className="text-amber-700 text-sm font-bold">
                Tienes <span className="underline">{stats.pending_voids_count}</span> {stats.pending_voids_count === 1 ? 'solicitud' : 'solicitudes'} de anulación por revisar.
              </p>
            </div>
            <a
              href="/journal-entries"
              className="ml-4 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-colors"
            >
              Revisar Ahora
            </a>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Cuentas por Cobrar"
          value={stats.receivables}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <StatCard
          title="Cuentas por Pagar"
          value={stats.payables}
          icon={FileText}
          color="bg-red-500"
        />
        <StatCard
          title="Valor de Inventario"
          value={stats.inventory_value}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Activos Totales"
          value={stats.total_assets}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Pasivos Totales"
          value={stats.total_liabilities}
          icon={TrendingDown}
          color="bg-orange-500"
        />
        <StatCard
          title="Capital Contable"
          value={stats.equity}
          icon={DollarSign}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen del Periodo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-slate-700">Ingresos</span>
              </div>
              <span className="font-bold text-green-600">
                ${formatCurrency(stats.revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-slate-700">Gastos</span>
              </div>
              <span className="font-bold text-red-600">
                ${formatCurrency(stats.expenses)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-slate-700">Utilidad Neta</span>
              </div>
              <span className="font-bold text-blue-600">
                ${formatCurrency(stats.net_income)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Partidas Contabilizadas</span>
              </div>
              <span className="font-bold text-slate-800">{stats.journal_entries_count}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">Estado</span>
              </div>
              <span className="text-green-600 font-medium">Operacional</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Información de Empresa</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">NIT</p>
              <p className="font-medium text-slate-800">{selectedCompany.nit || selectedCompany.rfc}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Moneda</p>
              <p className="font-medium text-slate-800">{selectedCompany.currency}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Inicio Ejercicio Fiscal</p>
              <p className="font-medium text-slate-800">Mes {selectedCompany.fiscal_year_start}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { bills } from '../../lib/api';
import type { Bill } from '../../types';

export function AccountsPayable() {
  const { selectedCompany } = useCompany();
  const [items, setItems] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany) {
      loadPayables();
    }
  }, [selectedCompany]);

  const loadPayables = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const response = await bills.getAll();
      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : Array.isArray((response as any)?.data?.data)
            ? (response as any).data.data
            : [];
      setItems(list);
    } catch (error) {
      console.error('Error loading accounts payable:', error);
    } finally {
      setLoading(false);
    }
  };

  const openItems = useMemo(
    () => items.filter((bill) => Number(bill.balance ?? 0) > 0 && bill.status !== 'void'),
    [items]
  );

  const formatAmount = (value: string | number | null | undefined) => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return '0.00';
    return amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Cuentas por Pagar</h2>
        <p className="text-slate-600">Facturas de compra pendientes de pago</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Documentos Abiertos</p>
          <p className="text-2xl font-bold text-slate-800">{openItems.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Saldo Pendiente</p>
          <p className="text-2xl font-bold text-slate-800">
            ${formatAmount(openItems.reduce((sum, item) => sum + Number(item.balance ?? 0), 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Compras</p>
          <p className="text-2xl font-bold text-slate-800">
            ${formatAmount(items.reduce((sum, item) => sum + Number(item.total ?? 0), 0))}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Factura</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Proveedor</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Vence</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Total</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Saldo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-600">Cargando...</td>
              </tr>
            ) : openItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-600">No hay cuentas por pagar pendientes</td>
              </tr>
            ) : (
              openItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.bill_number}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{item.supplier?.name || 'Sin proveedor'}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{new Date(item.bill_date).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{new Date(item.due_date).toLocaleDateString('es-MX')}</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-800">${formatAmount(item.total)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">${formatAmount(item.balance)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 uppercase">{item.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

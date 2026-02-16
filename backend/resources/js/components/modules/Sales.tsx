import { useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { invoices as invoicesApi, customers as customersApi } from '../../lib/api';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, FileText } from 'lucide-react';
import type { Invoice, Customer } from '../../types';
import { CustomerAutocomplete } from '../common/CustomerAutocomplete';

export function Sales() {
  const { selectedCompany } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    subtotal: '0',
    tax: '0',
    total: '0',
    notes: '',
  });

  const nextInvoiceNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const numbers = invoices
      .map((inv) => {
        const match = String(inv.invoice_number || '').match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => Number.isFinite(n));
    const max = numbers.length ? Math.max(...numbers) : 0;
    return `F-${year}-${String(max + 1).padStart(6, '0')}`;
  }, [invoices]);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [invoicesRes, customersRes] = await Promise.all([
        invoicesApi.getAll(),
        customersApi.getAll(),
      ]);

      const invoicesList = Array.isArray(invoicesRes) ? invoicesRes : (invoicesRes.data || []);
      const customersList = Array.isArray(customersRes) ? customersRes : (customersRes.data || []);

      setInvoices(invoicesList);
      setCustomers(customersList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (subtotal: string, tax: string) => {
    return ((parseFloat(subtotal) || 0) + (parseFloat(tax) || 0)).toFixed(2);
  };

  const handleSubtotalChange = (value: string) => {
    const newFormData = { ...formData, subtotal: value };
    newFormData.total = calculateTotal(value, formData.tax);
    setFormData(newFormData);
  };

  const handleTaxChange = (value: string) => {
    const newFormData = { ...formData, tax: value };
    newFormData.total = calculateTotal(formData.subtotal, value);
    setFormData(newFormData);
  };

  const handleSave = async () => {
    if (!formData.customer_id || !formData.invoice_number) {
      alert('Cliente y número de factura son obligatorios');
      return;
    }

    try {
      const data = {
        customer_id: parseInt(formData.customer_id),
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        subtotal: formData.subtotal,
        tax: formData.tax,
        total: formData.total,
        balance: formData.total,
        status: 'pending' as const,
        notes: formData.notes || undefined,
      };

      if (editing) {
        await invoicesApi.update(editing.id, data);
      } else {
        await invoicesApi.create(data);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ customer_id: '', invoice_number: nextInvoiceNumber, invoice_date: new Date().toISOString().split('T')[0], due_date: '', subtotal: '0', tax: '0', total: '0', notes: '' });
      loadData();
      alert('Factura guardada exitosamente');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!confirm(`¿Eliminar factura "${invoiceNumber}"?`)) return;

    try {
      await invoicesApi.delete(id);
      loadData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Pagada', className: 'bg-green-100 text-green-800' },
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Ventas / Facturación</h2>
          <p className="text-slate-600">Gestión de facturas de venta</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ customer_id: '', invoice_number: nextInvoiceNumber, invoice_date: new Date().toISOString().split('T')[0], due_date: '', subtotal: '0', tax: '0', total: '0', notes: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Factura
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">N° Factura</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                    No hay facturas registradas
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{invoice.customer?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{invoice.invoice_date}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">${parseFloat(invoice.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editing ? 'Editar Factura' : 'Nueva Factura'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
                  <CustomerAutocomplete
                    value={formData.customer_id ? Number(formData.customer_id) : ''}
                    onChange={(id) => setFormData({ ...formData, customer_id: id ? String(id) : '' })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">N° Factura *</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600"
                    placeholder={nextInvoiceNumber}
                  />
                  <p className="text-xs text-slate-500 mt-1">Correlativo sugerido por empresa y año: {nextInvoiceNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vencimiento *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtotal *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) => handleSubtotalChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IVA</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total</label>
                  <input
                    type="number"
                    value={formData.total}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={3}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
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

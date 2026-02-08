import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { bills as billsApi, suppliers as suppliersApi } from '../../lib/api';
import { Plus, Save, X, ShoppingCart, Trash2, Edit2 } from 'lucide-react';
import type { Bill, Supplier } from '../../types';

interface BillFormData {
  supplier_id: string;
  bill_number: string;
  bill_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
}

const emptyForm: BillFormData = {
  supplier_id: '',
  bill_number: '',
  bill_date: new Date().toISOString().split('T')[0],
  due_date: '',
  subtotal: '0',
  tax: '0',
  total: '0',
  notes: '',
};

export function Purchases() {
  const { selectedCompany } = useCompany();
  const [bills, setBills] = useState<Bill[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState<BillFormData>(emptyForm);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [billsResponse, suppliersResponse] = await Promise.all([
        billsApi.getAll(),
        suppliersApi.getAll(),
      ]);

      const billsList = Array.isArray(billsResponse) ? billsResponse : (billsResponse.data || []);
      const suppliersList = Array.isArray(suppliersResponse) ? suppliersResponse : (suppliersResponse.data || []);
      
      setBills(billsList);
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (subtotal: string, tax: string) => {
    const sub = parseFloat(subtotal) || 0;
    const taxAmt = parseFloat(tax) || 0;
    return (sub + taxAmt).toFixed(2);
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
    if (!selectedCompany) return;

    if (!formData.supplier_id) {
      alert('Debe seleccionar un proveedor');
      return;
    }

    if (!formData.bill_number) {
      alert('El número de factura es obligatorio');
      return;
    }

    if (!formData.bill_date || !formData.due_date) {
      alert('Las fechas son obligatorias');
      return;
    }

    const billData = {
      supplier_id: parseInt(formData.supplier_id),
      bill_number: formData.bill_number,
      bill_date: formData.bill_date,
      due_date: formData.due_date,
      subtotal: formData.subtotal,
      tax: formData.tax,
      total: formData.total,
      balance: formData.total, // Balance inicial es igual al total
      status: 'pending' as const,
      notes: formData.notes || undefined,
    };

    try {
      if (editingBill) {
        await billsApi.update(editingBill.id, billData);
      } else {
        await billsApi.create(billData);
      }

      setShowModal(false);
      setEditingBill(null);
      setFormData(emptyForm);
      loadData();
      alert('Factura de compra guardada exitosamente');
    } catch (error: any) {
      console.error('Error saving bill:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData({
      supplier_id: bill.supplier_id.toString(),
      bill_number: bill.bill_number,
      bill_date: bill.bill_date,
      due_date: bill.due_date,
      subtotal: bill.subtotal,
      tax: bill.tax,
      total: bill.total,
      notes: bill.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (billId: number, billNumber: string) => {
    if (!confirm(`¿Estás seguro de eliminar la factura "${billNumber}"?`)) return;

    try {
      await billsApi.delete(billId);
      loadData();
      alert('Factura eliminada exitosamente');
    } catch (error: any) {
      console.error('Error deleting bill:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingBill(null);
    setFormData(emptyForm);
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Compras / Facturas de Compra</h2>
          <p className="text-slate-600">Gestión de facturas de proveedores</p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setFormData(emptyForm);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Factura de Compra
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">N° Factura</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Proveedor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Vencimiento</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Subtotal</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">IVA</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-600">
                    No hay facturas de compra registradas
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{bill.bill_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{bill.supplier?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{bill.bill_date}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{bill.due_date}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800">${parseFloat(bill.subtotal).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800">${parseFloat(bill.tax).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">${parseFloat(bill.total).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(bill.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(bill)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar factura"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bill.id, bill.bill_number)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar factura"
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingBill ? 'Editar Factura de Compra' : 'Nueva Factura de Compra'}
              </h3>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Proveedor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar proveedor...</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.code} - {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    N° de Factura <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bill_number}
                    onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="F-001-0001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de Factura <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.bill_date}
                    onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de Vencimiento <span className="text-red-500">*</span>
                  </label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Subtotal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.subtotal}
                    onChange={(e) => handleSubtotalChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    IVA
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.total}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={3}
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

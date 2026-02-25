import { useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import {
  customers as customersApi,
  invoices as invoicesApi,
  documentTypes as documentTypesApi,
  paymentMethods as paymentMethodsApi,
} from '../../lib/api';
import { Plus, Save, X, Trash2, FileText } from 'lucide-react';
import type { Customer, Invoice, PaymentMethod } from '../../types';
import { CustomerAutocomplete } from '../common/CustomerAutocomplete';

interface DocumentTypeOption {
  id: number;
  code: string;
  name: string;
}

interface InvoiceFormData {
  customer_id: string;
  payment_method_id: string;
  condition_operation: '1' | '2';
  credit_term_unit: 'dias' | 'meses' | 'anios';
  credit_term_value: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  tipo_dte: string;
  dte_codigo_generacion: string;
  dte_sello_recibido: string;
  customer_name_snapshot: string;
  customer_tax_id_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot: string;
  customer_address_snapshot: string;
  dte_cuerpo_documento: any[];
  is_fiscal_credit: boolean;
}

interface SalesLineItem {
  code: string;
  description: string;
  quantity: string;
  unitPrice: string;
  tipoItem: string;
}

const emptyForm = (): InvoiceFormData => ({
  customer_id: '',
  payment_method_id: '',
  condition_operation: '1',
  credit_term_unit: 'dias',
  credit_term_value: '',
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  subtotal: '0.00',
  tax: '0.00',
  total: '0.00',
  notes: '',
  tipo_dte: '',
  dte_codigo_generacion: '',
  dte_sello_recibido: '',
  customer_name_snapshot: '',
  customer_tax_id_snapshot: '',
  customer_phone_snapshot: '',
  customer_email_snapshot: '',
  customer_address_snapshot: '',
  dte_cuerpo_documento: [],
  is_fiscal_credit: false,
});

export function Sales() {
  const { selectedCompany } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>(emptyForm);
  const [lineItems, setLineItems] = useState<SalesLineItem[]>([]);

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

  const buildSuggestedNumber = (tipoDteCode: string) => {
    const year = new Date().getFullYear();
    const numbers = invoices
      .map((inv) => {
        const match = String(inv.invoice_number || '').match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => Number.isFinite(n));
    const max = numbers.length ? Math.max(...numbers) : 0;
    const seq = String(max + 1).padStart(6, '0');

    if (tipoDteCode === '01') {
      return `FAC-${year}-${seq}`;
    }

    if (tipoDteCode === '03') {
      return `DTE-03-${year}-${seq}`;
    }

    return `F-${year}-${seq}`;
  };

  const calculateDueDateByCondition = (
    invoiceDate: string,
    conditionOperation: '1' | '2',
    creditTermUnit: 'dias' | 'meses' | 'anios',
    creditTermValue: string,
  ) => {
    if (conditionOperation === '1') {
      return invoiceDate;
    }

    const numericValue = Number(creditTermValue || 0);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return invoiceDate;
    }

    const dueDate = new Date(invoiceDate);
    if (creditTermUnit === 'dias') {
      dueDate.setDate(dueDate.getDate() + numericValue);
    } else if (creditTermUnit === 'meses') {
      dueDate.setMonth(dueDate.getMonth() + numericValue);
    } else {
      dueDate.setFullYear(dueDate.getFullYear() + numericValue);
    }

    return dueDate.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [invoicesRes, customersRes, documentTypesRes, paymentMethodsRes] = await Promise.all([
        invoicesApi.getAll(),
        customersApi.getAll(),
        documentTypesApi.getAll(),
        paymentMethodsApi.getAll(),
      ]);

      const invoicesList = Array.isArray(invoicesRes)
        ? invoicesRes
        : Array.isArray((invoicesRes as any)?.data)
          ? (invoicesRes as any).data
          : [];

      const customersList = Array.isArray(customersRes)
        ? customersRes
        : Array.isArray((customersRes as any)?.data)
          ? (customersRes as any).data
          : [];

      const docTypesList = (Array.isArray(documentTypesRes) ? documentTypesRes : ((documentTypesRes as any)?.data || []))
        .map((doc: any) => ({ id: Number(doc.id), code: String(doc.code || ''), name: String(doc.name || '') }))
        .filter((doc: DocumentTypeOption) => doc.code && doc.name);

      const paymentMethodsList = (Array.isArray(paymentMethodsRes) ? paymentMethodsRes : ((paymentMethodsRes as any)?.data || [])) as PaymentMethod[];

      setInvoices(invoicesList);
      setCustomers(customersList);
      setDocumentTypes(docTypesList);
      setPaymentMethods(paymentMethodsList);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string | number | null | undefined) => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return '0.00';
    return amount.toFixed(2);
  };

  const mapDteLinesToEditor = (lines: any[] | null | undefined): SalesLineItem[] => {
    if (!Array.isArray(lines) || lines.length === 0) return [];

    return lines.map((line: any, index: number) => ({
      code: String(line?.codigo ?? `ITEM-${index + 1}`),
      description: String(line?.descripcion ?? ''),
      quantity: String(line?.cantidad ?? '1'),
      unitPrice: String(line?.precioUni ?? line?.precioUnitario ?? '0.00'),
      tipoItem: String(line?.tipoItem ?? '1'),
    }));
  };

  const mapEditorLinesToDte = (items: SalesLineItem[]) => {
    return items
      .filter((item) => item.description.trim() !== '')
      .map((item, index) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
        const price = Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0;
        const lineTotal = Number((qty * price).toFixed(2));

        return {
          numItem: index + 1,
          tipoItem: Number(item.tipoItem || 1),
          codigo: item.code || `ITEM-${index + 1}`,
          descripcion: item.description,
          cantidad: qty,
          precioUni: price,
          ventaGravada: lineTotal,
          ventaExenta: 0,
          ventaNoSuj: 0,
          uniMedida: 'UNI',
        };
      });
  };

  const recalculateFromLineItems = (items: SalesLineItem[]) => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return sum;
      return sum + (quantity > 0 ? quantity : 0) * (unitPrice >= 0 ? unitPrice : 0);
    }, 0);

    const tax = subtotal * 0.13;

    setFormData((prev) => ({
      ...prev,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2),
      dte_cuerpo_documento: mapEditorLinesToDte(items),
    }));
  };

  const addLineItem = () => {
    const next = [...lineItems, { code: '', description: '', quantity: '1', unitPrice: '0.00', tipoItem: '1' }];
    setLineItems(next);
    recalculateFromLineItems(next);
  };

  const removeLineItem = (index: number) => {
    const next = lineItems.filter((_, idx) => idx !== index);
    setLineItems(next);
    recalculateFromLineItems(next);
  };

  const updateLineItem = (index: number, key: keyof SalesLineItem, value: string) => {
    const next = lineItems.map((item, idx) => (idx === index ? { ...item, [key]: value } : item));
    setLineItems(next);
    recalculateFromLineItems(next);
  };

  const syncCustomerSnapshot = (customerId: string) => {
    if (!customerId) {
      setFormData((prev) => ({
        ...prev,
        customer_id: '',
        customer_name_snapshot: '',
        customer_tax_id_snapshot: '',
        customer_phone_snapshot: '',
        customer_email_snapshot: '',
        customer_address_snapshot: '',
      }));
      return;
    }

    const selected = customers.find((customer) => String(customer.id) === customerId);

    setFormData((prev) => ({
      ...prev,
      customer_id: customerId,
      customer_name_snapshot: selected?.name || prev.customer_name_snapshot,
      customer_tax_id_snapshot: selected?.nit || selected?.rfc || prev.customer_tax_id_snapshot,
      customer_phone_snapshot: selected?.phone || prev.customer_phone_snapshot,
      customer_email_snapshot: selected?.email1 || selected?.email || prev.customer_email_snapshot,
      customer_address_snapshot: selected?.address || prev.customer_address_snapshot,
      due_date: calculateDueDateByCondition(
        prev.invoice_date,
        prev.condition_operation,
        prev.credit_term_unit,
        prev.credit_term_value || (selected?.credit_days ? String(selected.credit_days) : ''),
      ),
    }));
  };

  const handleSave = async () => {
    if (!formData.invoice_number) {
      alert('El correlativo del DTE es obligatorio');
      return;
    }

    if (!formData.invoice_date) {
      alert('La fecha es obligatoria');
      return;
    }

    if (!formData.customer_id && !formData.customer_name_snapshot) {
      alert('Selecciona un cliente');
      return;
    }

    if (!formData.tipo_dte) {
      alert('Selecciona un Tipo DTE');
      return;
    }

    if (!formData.payment_method_id) {
      alert('Selecciona una forma de pago');
      return;
    }

    try {
      const dueDate = calculateDueDateByCondition(
        formData.invoice_date,
        formData.condition_operation,
        formData.credit_term_unit,
        formData.credit_term_value,
      );

      const dteResumen = {
        condicionOperacion: Number(formData.condition_operation),
        plazoOperacion: formData.condition_operation === '2'
          ? {
              unidad: formData.credit_term_unit,
              valor: Number(formData.credit_term_value || 0),
            }
          : null,
      };

      const dteApendice = [
        {
          campo: 'condicion_operacion',
          etiqueta: 'Condicion de la operacion',
          valor: formData.condition_operation === '1' ? 'Contado' : 'Credito',
        },
        ...(formData.condition_operation === '2'
          ? [
              {
                campo: 'plazo_unidad',
                etiqueta: 'Plazo unidad',
                valor: formData.credit_term_unit,
              },
              {
                campo: 'plazo_valor',
                etiqueta: 'Plazo valor',
                valor: formData.credit_term_value,
              },
            ]
          : []),
      ];

      const generatedDteJson = {
        identificacion: {
          tipoDte: formData.tipo_dte,
          numeroControl: formData.invoice_number,
          fecEmi: formData.invoice_date,
        },
        cuerpoDocumento: formData.dte_cuerpo_documento,
        resumen: dteResumen,
        apendice: dteApendice,
      };

      const payload = {
        customer_id: formData.customer_id ? Number(formData.customer_id) : undefined,
        payment_method_id: formData.payment_method_id ? Number(formData.payment_method_id) : undefined,
        customer_name_snapshot: formData.customer_name_snapshot || undefined,
        customer_tax_id_snapshot: formData.customer_tax_id_snapshot || undefined,
        customer_phone_snapshot: formData.customer_phone_snapshot || undefined,
        customer_email_snapshot: formData.customer_email_snapshot || undefined,
        customer_address_snapshot: formData.customer_address_snapshot || undefined,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: dueDate,
        subtotal: formData.subtotal,
        tax: formData.tax,
        total: formData.total,
        balance: formData.total,
        status: 'pending' as const,
        notes: formData.notes || undefined,
        tipo_dte: formData.tipo_dte || undefined,
        dte_numero_control: formData.invoice_number,
        dte_codigo_generacion: formData.dte_codigo_generacion || undefined,
        dte_fec_emi: formData.invoice_date,
        dte_sello_recibido: formData.dte_sello_recibido || undefined,
        dte_cuerpo_documento: formData.dte_cuerpo_documento?.length ? formData.dte_cuerpo_documento : undefined,
        dte_resumen: dteResumen,
        dte_apendice: dteApendice,
        dte_raw_json: JSON.stringify(generatedDteJson),
        is_fiscal_credit: formData.is_fiscal_credit,
      };

      if (editing) {
        await invoicesApi.update(editing.id, payload);
      } else {
        await invoicesApi.create(payload);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ ...emptyForm(), invoice_number: nextInvoiceNumber, tipo_dte: documentTypes[0]?.code || '' });
      setLineItems([]);
      await loadData();
      alert('Factura de venta guardada exitosamente');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!confirm(`¿Eliminar factura "${invoiceNumber}"?`)) return;

    try {
      await invoicesApi.delete(id);
      await loadData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditing(invoice);
    setLineItems(mapDteLinesToEditor(invoice.dte_cuerpo_documento || []));
    setFormData({
      customer_id: invoice.customer_id ? String(invoice.customer_id) : '',
      payment_method_id: invoice.payment_method_id ? String(invoice.payment_method_id) : '',
      condition_operation: String((invoice.dte_resumen as any)?.condicionOperacion || 1) === '2' ? '2' : '1',
      credit_term_unit: ((invoice.dte_resumen as any)?.plazoOperacion?.unidad || 'dias') as 'dias' | 'meses' | 'anios',
      credit_term_value: String((invoice.dte_resumen as any)?.plazoOperacion?.valor || ''),
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      subtotal: String(invoice.subtotal),
      tax: String(invoice.tax),
      total: String(invoice.total),
      notes: invoice.notes || '',
      tipo_dte: invoice.tipo_dte || '',
      dte_codigo_generacion: invoice.dte_codigo_generacion || '',
      dte_sello_recibido: invoice.dte_sello_recibido || '',
      customer_name_snapshot: invoice.customer_name_snapshot || invoice.customer?.name || '',
      customer_tax_id_snapshot: invoice.customer_tax_id_snapshot || invoice.customer?.nit || invoice.customer?.rfc || '',
      customer_phone_snapshot: invoice.customer_phone_snapshot || invoice.customer?.phone || '',
      customer_email_snapshot: invoice.customer_email_snapshot || invoice.customer?.email1 || invoice.customer?.email || '',
      customer_address_snapshot: invoice.customer_address_snapshot || invoice.customer?.address || '',
      dte_cuerpo_documento: invoice.dte_cuerpo_documento || [],
      is_fiscal_credit: Boolean(invoice.is_fiscal_credit),
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ ...emptyForm(), invoice_number: nextInvoiceNumber, tipo_dte: documentTypes[0]?.code || '' });
    setLineItems([]);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      partial: { label: 'Parcial', className: 'bg-orange-100 text-orange-800' },
      paid: { label: 'Pagada', className: 'bg-green-100 text-green-800' },
      overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-800' },
      void: { label: 'Anulada', className: 'bg-red-100 text-red-800' },
      issued: { label: 'Emitida', className: 'bg-blue-100 text-blue-800' },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

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
          <p className="text-slate-600">Registro manual de facturas de venta</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            const initialTipoDte = documentTypes[0]?.code || '';
            setFormData({ ...emptyForm(), invoice_number: buildSuggestedNumber(initialTipoDte), tipo_dte: initialTipoDte });
            setLineItems([]);
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
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Tipo DTE</th>
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
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">Cargando...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">No hay facturas registradas</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{invoice.tipo_dte || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{invoice.customer?.name || invoice.customer_name_snapshot || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{invoice.invoice_date}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">${formatAmount(invoice.total)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(invoice.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editing ? 'Editar Factura de Venta' : 'Nueva Factura de Venta'}</h3>
              <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <CustomerAutocomplete
                    value={formData.customer_id ? Number(formData.customer_id) : ''}
                    onChange={(id) => syncCustomerSnapshot(id ? String(id) : '')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo DTE *</label>
                  <select
                    value={formData.tipo_dte}
                    onChange={(e) => {
                      const tipo = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        tipo_dte: tipo,
                        is_fiscal_credit: tipo === '03',
                        invoice_number: editing ? prev.invoice_number : buildSuggestedNumber(tipo),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar...</option>
                    {documentTypes.map((docType) => (
                      <option key={docType.id} value={docType.code}>{docType.code} - {docType.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Forma de pago *</label>
                  <select
                    value={formData.payment_method_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, payment_method_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar...</option>
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>{method.code} - {method.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correlativo DTE *</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder={nextInvoiceNumber}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de condición *</label>
                  <select
                    value={formData.condition_operation}
                    onChange={(e) => {
                      const condition = e.target.value === '2' ? '2' : '1';
                      setFormData((prev) => {
                        const nextDueDate = calculateDueDateByCondition(
                          prev.invoice_date,
                          condition,
                          prev.credit_term_unit,
                          prev.credit_term_value,
                        );

                        return {
                          ...prev,
                          condition_operation: condition,
                          due_date: nextDueDate,
                        };
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="1">Contado</option>
                    <option value="2">Crédito</option>
                  </select>
                </div>

                {formData.condition_operation === '2' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Plazo</label>
                      <select
                        value={formData.credit_term_unit}
                        onChange={(e) => {
                          const unit = e.target.value as 'dias' | 'meses' | 'anios';
                          setFormData((prev) => ({
                            ...prev,
                            credit_term_unit: unit,
                            due_date: calculateDueDateByCondition(prev.invoice_date, prev.condition_operation, unit, prev.credit_term_value),
                          }));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="dias">Días</option>
                        <option value="meses">Meses</option>
                        <option value="anios">Años</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Valor del plazo</label>
                      <input
                        type="text"
                        value={formData.credit_term_value}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            credit_term_value: value,
                            due_date: calculateDueDateByCondition(prev.invoice_date, prev.condition_operation, prev.credit_term_unit, value),
                          }));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        placeholder="Solo números"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => {
                      const invoiceDate = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        invoice_date: invoiceDate,
                        due_date: calculateDueDateByCondition(invoiceDate, prev.condition_operation, prev.credit_term_unit, prev.credit_term_value),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código Generación</label>
                  <input
                    type="text"
                    value={formData.dte_codigo_generacion}
                    onChange={(e) => setFormData({ ...formData, dte_codigo_generacion: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sello Recibido</label>
                  <input
                    type="text"
                    value={formData.dte_sello_recibido}
                    onChange={(e) => setFormData({ ...formData, dte_sello_recibido: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subtotal</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.subtotal}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">IVA</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
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
                  rows={2}
                />
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">Detalle de ítems</h4>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    + Agregar ítem
                  </button>
                </div>

                {lineItems.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay ítems. Agrega líneas para capturar la venta.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">Tipo</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">Código</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-slate-700">Descripción</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-700">Cant.</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-700">Precio</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-700">Total</th>
                          <th className="px-2 py-2 text-right text-xs font-medium text-slate-700">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lineItems.map((item, index) => {
                          const quantity = Number(item.quantity || 0);
                          const unitPrice = Number(item.unitPrice || 0);
                          const lineTotal = (Number.isFinite(quantity) ? quantity : 0) * (Number.isFinite(unitPrice) ? unitPrice : 0);

                          return (
                            <tr key={index}>
                              <td className="px-2 py-2">
                                <select
                                  value={item.tipoItem}
                                  onChange={(e) => updateLineItem(index, 'tipoItem', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                >
                                  <option value="1">Producto</option>
                                  <option value="2">Servicio</option>
                                  <option value="3">Activo fijo</option>
                                  <option value="4">Otro</option>
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.code}
                                  onChange={(e) => updateLineItem(index, 'code', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                  placeholder="ITEM-001"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                                  placeholder="Descripción del ítem"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.quantity}
                                  onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.unitPrice}
                                  onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                                  className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-right"
                                />
                              </td>
                              <td className="px-2 py-2 text-xs text-right text-slate-700">${formatAmount(lineTotal)}</td>
                              <td className="px-2 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeLineItem(index)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Quitar ítem"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

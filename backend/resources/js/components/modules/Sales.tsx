import { useEffect, useMemo, useRef, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { customers as customersApi, invoices as invoicesApi } from '../../lib/api';
import { Plus, Save, X, Upload, Trash2, FileText } from 'lucide-react';
import type { Customer, Invoice } from '../../types';
import { CustomerAutocomplete } from '../common/CustomerAutocomplete';

interface InvoiceFormData {
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  total: string;
  notes: string;
  tipo_dte: string;
  dte_version: string;
  dte_ambiente: string;
  dte_numero_control: string;
  dte_codigo_generacion: string;
  dte_hor_emi: string;
  dte_sello_recibido: string;
  dte_firma_electronica: string;
  customer_name_snapshot: string;
  customer_tax_id_snapshot: string;
  customer_phone_snapshot: string;
  customer_email_snapshot: string;
  customer_address_snapshot: string;
  dte_emisor: any | null;
  dte_receptor: any | null;
  dte_cuerpo_documento: any[];
  dte_resumen: any | null;
  dte_apendice: any[];
  dte_raw_json: string;
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
  invoice_number: '',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: '',
  subtotal: '0.00',
  tax: '0.00',
  total: '0.00',
  notes: '',
  tipo_dte: '03',
  dte_version: '',
  dte_ambiente: '',
  dte_numero_control: '',
  dte_codigo_generacion: '',
  dte_hor_emi: '',
  dte_sello_recibido: '',
  dte_firma_electronica: '',
  customer_name_snapshot: '',
  customer_tax_id_snapshot: '',
  customer_phone_snapshot: '',
  customer_email_snapshot: '',
  customer_address_snapshot: '',
  dte_emisor: null,
  dte_receptor: null,
  dte_cuerpo_documento: [],
  dte_resumen: null,
  dte_apendice: [],
  dte_raw_json: '',
  is_fiscal_credit: true,
});

export function Sales() {
  const { selectedCompany } = useCompany();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>(emptyForm);
  const [lineItems, setLineItems] = useState<SalesLineItem[]>([]);
  const [importedFromJson, setImportedFromJson] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

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

      setInvoices(invoicesList);
      setCustomers(customersList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: string | number | null | undefined) => {
    const amount = Number(value ?? 0);
    if (!Number.isFinite(amount)) return '0.00';
    return amount.toFixed(2);
  };

  const normalizeDate = (value: any) => {
    if (!value) return new Date().toISOString().split('T')[0];
    const raw = String(value);
    const dateOnly = raw.includes('T') ? raw.split('T')[0] : raw;
    const parsed = new Date(dateOnly);
    if (Number.isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0];
    return parsed.toISOString().split('T')[0];
  };

  const plusDays = (date: string, days: number) => {
    const parsed = new Date(date);
    parsed.setDate(parsed.getDate() + days);
    return parsed.toISOString().split('T')[0];
  };

  const parseAmount = (value: any) => {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const pickValue = (obj: any, paths: string[]) => {
    for (const path of paths) {
      const value = path.split('.').reduce((acc: any, segment) => acc?.[segment], obj);
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
    return '';
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

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const identificacion = parsed?.identificacion || {};
      const emisor = parsed?.emisor || {};
      const receptor = parsed?.receptor || {};
      const resumen = parsed?.resumen || {};
      const cuerpoDocumento = Array.isArray(parsed?.cuerpoDocumento) ? parsed.cuerpoDocumento : [];
      const apendice = Array.isArray(parsed?.apendice) ? parsed.apendice : [];

      const customerName = String(receptor?.nombre || receptor?.nombreComercial || '').trim();
      const customerTaxId = String(receptor?.nit || receptor?.rfc || '').trim();
      const customerPhone = String(receptor?.telefono || '').trim();
      const customerEmail = String(receptor?.correo || '').trim();
      const customerAddress = String(receptor?.direccion?.complemento || '').trim();

      const matchedCustomer = customers.find((customer) => {
        const byTax = customerTaxId
          && String(customer.nit || customer.rfc || '').toLowerCase() === customerTaxId.toLowerCase();
        const byName = customerName && customer.name.toLowerCase() === customerName.toLowerCase();
        return byTax || byName;
      });

      const invoiceDate = normalizeDate(pickValue(parsed, ['identificacion.fecEmi', 'fechaEmision', 'fecha']));

      const tributos = Array.isArray(resumen?.tributos) ? resumen.tributos : [];
      const taxByTributos = tributos.reduce((sum: number, taxItem: any) => sum + parseAmount(taxItem?.valor), 0);

      const subtotalAmount = parseAmount(pickValue(parsed, [
        'resumen.subTotal',
        'resumen.subtotal',
        'resumen.totalGravada',
        'resumen.subTotalVentas',
        'subtotal',
      ]));

      const taxAmount = taxByTributos || parseAmount(pickValue(parsed, [
        'resumen.totalIva',
        'resumen.iva',
        'tax',
      ]));

      const totalAmount = parseAmount(pickValue(parsed, [
        'resumen.totalPagar',
        'resumen.montoTotalOperacion',
        'resumen.total',
        'total',
      ]) || subtotalAmount + taxAmount);

      const tipoDte = String(identificacion?.tipoDte || '').trim() || '03';

      setFormData((current) => ({
        ...current,
        customer_id: matchedCustomer ? String(matchedCustomer.id) : '',
        customer_name_snapshot: customerName,
        customer_tax_id_snapshot: customerTaxId,
        customer_phone_snapshot: customerPhone,
        customer_email_snapshot: customerEmail,
        customer_address_snapshot: customerAddress,
        invoice_number: String(identificacion?.numeroControl || current.invoice_number || nextInvoiceNumber),
        invoice_date: invoiceDate,
        due_date: plusDays(invoiceDate, Number(matchedCustomer?.credit_days || 30)),
        subtotal: subtotalAmount.toFixed(2),
        tax: taxAmount.toFixed(2),
        total: totalAmount.toFixed(2),
        notes: current.notes || `Importado desde JSON: ${file.name}`,
        tipo_dte: tipoDte,
        dte_version: identificacion?.version ? String(identificacion.version) : '',
        dte_ambiente: String(identificacion?.ambiente || ''),
        dte_numero_control: String(identificacion?.numeroControl || ''),
        dte_codigo_generacion: String(identificacion?.codigoGeneracion || ''),
        dte_hor_emi: String(identificacion?.horEmi || ''),
        dte_sello_recibido: String(parsed?.selloRecibido || ''),
        dte_firma_electronica: String(parsed?.firmaElectronica || ''),
        dte_emisor: emisor,
        dte_receptor: receptor,
        dte_cuerpo_documento: cuerpoDocumento,
        dte_resumen: resumen,
        dte_apendice: apendice,
        dte_raw_json: text,
        is_fiscal_credit: tipoDte === '03',
      }));

      setLineItems(mapDteLinesToEditor(cuerpoDocumento));
      setImportedFromJson(true);

      if (!matchedCustomer) {
        alert('JSON importado. El cliente no existe en catálogo, se guardará con snapshot del DTE.');
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      alert('No se pudo importar el JSON. Verifica el formato del archivo DTE.');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
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
      alert('Selecciona un cliente o carga un JSON con datos de receptor');
      return;
    }

    try {
      const payload = {
        customer_id: formData.customer_id ? Number(formData.customer_id) : undefined,
        customer_name_snapshot: formData.customer_name_snapshot || undefined,
        customer_tax_id_snapshot: formData.customer_tax_id_snapshot || undefined,
        customer_phone_snapshot: formData.customer_phone_snapshot || undefined,
        customer_email_snapshot: formData.customer_email_snapshot || undefined,
        customer_address_snapshot: formData.customer_address_snapshot || undefined,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date || formData.invoice_date,
        subtotal: formData.subtotal,
        tax: formData.tax,
        total: formData.total,
        balance: formData.total,
        status: 'pending' as const,
        notes: formData.notes || undefined,
        tipo_dte: formData.tipo_dte || undefined,
        dte_version: formData.dte_version ? Number(formData.dte_version) : undefined,
        dte_ambiente: formData.dte_ambiente || undefined,
        dte_numero_control: formData.dte_numero_control || undefined,
        dte_codigo_generacion: formData.dte_codigo_generacion || undefined,
        dte_fec_emi: formData.invoice_date,
        dte_hor_emi: formData.dte_hor_emi || undefined,
        dte_sello_recibido: formData.dte_sello_recibido || undefined,
        dte_firma_electronica: formData.dte_firma_electronica || undefined,
        dte_emisor: formData.dte_emisor || undefined,
        dte_receptor: formData.dte_receptor || undefined,
        dte_cuerpo_documento: formData.dte_cuerpo_documento?.length ? formData.dte_cuerpo_documento : undefined,
        dte_resumen: formData.dte_resumen || undefined,
        dte_apendice: formData.dte_apendice?.length ? formData.dte_apendice : undefined,
        dte_raw_json: formData.dte_raw_json || undefined,
        is_fiscal_credit: formData.is_fiscal_credit,
      };

      if (editing) {
        await invoicesApi.update(editing.id, payload);
      } else {
        await invoicesApi.create(payload);
      }

      setShowModal(false);
      setEditing(null);
      setImportedFromJson(false);
      setFormData({ ...emptyForm(), invoice_number: nextInvoiceNumber });
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
    setImportedFromJson(Boolean(invoice.dte_raw_json || invoice.dte_numero_control || invoice.dte_codigo_generacion));
    setLineItems(mapDteLinesToEditor(invoice.dte_cuerpo_documento || []));
    setFormData({
      customer_id: invoice.customer_id ? String(invoice.customer_id) : '',
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      subtotal: String(invoice.subtotal),
      tax: String(invoice.tax),
      total: String(invoice.total),
      notes: invoice.notes || '',
      tipo_dte: invoice.tipo_dte || '03',
      dte_version: invoice.dte_version ? String(invoice.dte_version) : '',
      dte_ambiente: invoice.dte_ambiente || '',
      dte_numero_control: invoice.dte_numero_control || '',
      dte_codigo_generacion: invoice.dte_codigo_generacion || '',
      dte_hor_emi: invoice.dte_hor_emi || '',
      dte_sello_recibido: invoice.dte_sello_recibido || '',
      dte_firma_electronica: invoice.dte_firma_electronica || '',
      customer_name_snapshot: invoice.customer_name_snapshot || invoice.customer?.name || '',
      customer_tax_id_snapshot: invoice.customer_tax_id_snapshot || invoice.customer?.nit || invoice.customer?.rfc || '',
      customer_phone_snapshot: invoice.customer_phone_snapshot || invoice.customer?.phone || '',
      customer_email_snapshot: invoice.customer_email_snapshot || invoice.customer?.email1 || invoice.customer?.email || '',
      customer_address_snapshot: invoice.customer_address_snapshot || invoice.customer?.address || '',
      dte_emisor: invoice.dte_emisor || null,
      dte_receptor: invoice.dte_receptor || null,
      dte_cuerpo_documento: invoice.dte_cuerpo_documento || [],
      dte_resumen: invoice.dte_resumen || null,
      dte_apendice: invoice.dte_apendice || [],
      dte_raw_json: invoice.dte_raw_json || '',
      is_fiscal_credit: Boolean(invoice.is_fiscal_credit),
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditing(null);
    setImportedFromJson(false);
    setFormData({ ...emptyForm(), invoice_number: nextInvoiceNumber });
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
          <p className="text-slate-600">Carga manual o importación JSON DTE de ventas</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setImportedFromJson(false);
            setFormData({ ...emptyForm(), invoice_number: nextInvoiceNumber });
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
              <div className="flex items-center gap-2">
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImportJson}
                />
                <button
                  onClick={() => importInputRef.current?.click()}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                  title="Importar JSON"
                >
                  <Upload className="w-4 h-4" />
                  Importar JSON DTE
                </button>
                <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <CustomerAutocomplete
                    value={formData.customer_id ? Number(formData.customer_id) : ''}
                    onChange={(id) => setFormData({ ...formData, customer_id: id ? String(id) : '' })}
                  />
                  {formData.customer_id === '' && formData.customer_name_snapshot && (
                    <p className="text-xs text-orange-700 mt-1">Cliente no existe en catálogo, se guardará desde snapshot del DTE.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correlativo DTE *</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    readOnly={importedFromJson}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${importedFromJson ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-300 focus:ring-2 focus:ring-slate-500'}`}
                    placeholder={nextInvoiceNumber}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.invoice_date}
                    readOnly={importedFromJson}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${importedFromJson ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-300 focus:ring-2 focus:ring-slate-500'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo DTE</label>
                  <select
                    value={formData.tipo_dte}
                    onChange={(e) => {
                      const tipo = e.target.value;
                      setFormData({ ...formData, tipo_dte: tipo, is_fiscal_credit: tipo === '03' });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="03">03 - Comprobante de Crédito Fiscal</option>
                    <option value="01">01 - Consumidor Final</option>
                  </select>
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
                    onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
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
                  rows={2}
                />
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">Detalle de ítems (manual o JSON)</h4>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                  >
                    + Agregar ítem
                  </button>
                </div>

                {lineItems.length === 0 ? (
                  <p className="text-sm text-slate-500">No hay ítems. Agrega líneas para capturar la venta manualmente.</p>
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

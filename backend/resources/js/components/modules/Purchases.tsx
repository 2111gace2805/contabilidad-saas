import { useEffect, useRef, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { bankAccounts as bankAccountsApi, bills as billsApi, suppliers as suppliersApi } from '../../lib/api';
import { Plus, Save, X, Upload, Trash2, Edit2 } from 'lucide-react';
import type { BankAccount, Bill, Supplier } from '../../types';
import { SupplierAutocomplete } from '../common/SupplierAutocomplete';

interface BillFormData {
  supplier_id: string;
  bill_number: string;
  bill_date: string;
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
  supplier_name_snapshot: string;
  supplier_tax_id_snapshot: string;
  supplier_phone_snapshot: string;
  supplier_email_snapshot: string;
  supplier_address_snapshot: string;
  dte_emisor: any | null;
  dte_receptor: any | null;
  dte_cuerpo_documento: any[];
  dte_resumen: any | null;
  dte_apendice: any[];
  dte_raw_json: string;
  is_fiscal_credit: boolean;
}

const emptyForm = (): BillFormData => ({
  supplier_id: '',
  bill_number: '',
  bill_date: new Date().toISOString().split('T')[0],
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
  supplier_name_snapshot: '',
  supplier_tax_id_snapshot: '',
  supplier_phone_snapshot: '',
  supplier_email_snapshot: '',
  supplier_address_snapshot: '',
  dte_emisor: null,
  dte_receptor: null,
  dte_cuerpo_documento: [],
  dte_resumen: null,
  dte_apendice: [],
  dte_raw_json: '',
  is_fiscal_credit: true,
});

export function Purchases() {
  const { selectedCompany } = useCompany();
  const [bills, setBills] = useState<Bill[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState<BillFormData>(emptyForm);
  const [importedFromJson, setImportedFromJson] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billToPay, setBillToPay] = useState<Bill | null>(null);
  const [paymentData, setPaymentData] = useState({
    bank_account_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [billsResponse, suppliersResponse, bankAccountsResponse] = await Promise.all([
        billsApi.getAll(),
        suppliersApi.getAll({ per_page: 500 }),
        bankAccountsApi.getAll(),
      ]);

      const billsList = Array.isArray(billsResponse)
        ? billsResponse
        : Array.isArray((billsResponse as any)?.data)
          ? (billsResponse as any).data
          : Array.isArray((billsResponse as any)?.data?.data)
            ? (billsResponse as any).data.data
            : [];

      const suppliersList = Array.isArray(suppliersResponse)
        ? suppliersResponse
        : Array.isArray((suppliersResponse as any)?.data)
          ? (suppliersResponse as any).data
          : Array.isArray((suppliersResponse as any)?.data?.data)
            ? (suppliersResponse as any).data.data
            : [];

          const banksList = Array.isArray(bankAccountsResponse)
            ? bankAccountsResponse
            : Array.isArray((bankAccountsResponse as any)?.data)
              ? (bankAccountsResponse as any).data
              : Array.isArray((bankAccountsResponse as any)?.data?.data)
            ? (bankAccountsResponse as any).data.data
            : [];

      setBills(billsList);
      setSuppliers(suppliersList);
          setBankAccounts(banksList);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar los datos');
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

  const pickValue = (obj: any, paths: string[]) => {
    for (const path of paths) {
      const value = path.split('.').reduce((acc: any, segment) => acc?.[segment], obj);
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return value;
      }
    }
    return '';
  };

  const parseAmount = (value: any) => {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const handleSubtotalChange = (value: string) => {
    const subtotal = Number(value || 0);
    const tax = Number(formData.tax || 0);
    setFormData((prev) => ({
      ...prev,
      subtotal: value,
      total: (subtotal + tax).toFixed(2),
    }));
  };

  const handleTaxChange = (value: string) => {
    const subtotal = Number(formData.subtotal || 0);
    const tax = Number(value || 0);
    setFormData((prev) => ({
      ...prev,
      tax: value,
      total: (subtotal + tax).toFixed(2),
    }));
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

      const supplierName = String(emisor?.nombre || emisor?.nombreComercial || '').trim();
      const supplierTaxId = String(emisor?.nit || emisor?.rfc || '').trim();
      const supplierPhone = String(emisor?.telefono || '').trim();
      const supplierEmail = String(emisor?.correo || '').trim();
      const supplierAddress = String(emisor?.direccion?.complemento || '').trim();

      const matchedSupplier = suppliers.find((supplier) => {
        const byTax = supplierTaxId && String(supplier.nit || '').toLowerCase() === supplierTaxId.toLowerCase();
        const byName = supplierName && supplier.name.toLowerCase() === supplierName.toLowerCase();
        return byTax || byName;
      });

      const billDate = normalizeDate(pickValue(parsed, ['identificacion.fecEmi', 'fechaEmision', 'fecha']));

      const tributos = Array.isArray(resumen?.tributos) ? resumen.tributos : [];
      const taxByTributos = tributos.reduce((sum: number, tax: any) => sum + parseAmount(tax?.valor), 0);

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
        supplier_id: matchedSupplier ? String(matchedSupplier.id) : '',
        supplier_name_snapshot: supplierName,
        supplier_tax_id_snapshot: supplierTaxId,
        supplier_phone_snapshot: supplierPhone,
        supplier_email_snapshot: supplierEmail,
        supplier_address_snapshot: supplierAddress,
        bill_number: String(identificacion?.numeroControl || current.bill_number),
        bill_date: billDate,
        due_date: plusDays(billDate, matchedSupplier?.credit_days || 30),
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

      setImportedFromJson(true);

      if (!matchedSupplier) {
        alert('JSON importado. El proveedor no existe en catálogo, pero podrás guardar con los datos del DTE.');
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
    if (!selectedCompany) return;

    if (!formData.bill_number) {
      alert('El correlativo del DTE es obligatorio');
      return;
    }

    if (!formData.bill_date) {
      alert('La fecha es obligatoria');
      return;
    }

    const payload = {
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
      supplier_name_snapshot: formData.supplier_name_snapshot || undefined,
      supplier_tax_id_snapshot: formData.supplier_tax_id_snapshot || undefined,
      supplier_phone_snapshot: formData.supplier_phone_snapshot || undefined,
      supplier_email_snapshot: formData.supplier_email_snapshot || undefined,
      supplier_address_snapshot: formData.supplier_address_snapshot || undefined,
      bill_number: formData.bill_number,
      bill_date: formData.bill_date,
      due_date: formData.due_date || formData.bill_date,
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
      dte_fec_emi: formData.bill_date,
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

    try {
      if (editingBill) {
        await billsApi.update(editingBill.id, payload);
      } else {
        await billsApi.create(payload);
      }

      setShowModal(false);
      setEditingBill(null);
      setImportedFromJson(false);
      setFormData(emptyForm());
      await loadData();
      alert('Factura de compra guardada exitosamente');
    } catch (error: any) {
      console.error('Error saving bill:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setImportedFromJson(Boolean(bill.dte_raw_json || bill.dte_numero_control || bill.dte_codigo_generacion));
    setFormData({
      supplier_id: bill.supplier_id ? String(bill.supplier_id) : '',
      bill_number: bill.bill_number,
      bill_date: bill.bill_date,
      due_date: bill.due_date,
      subtotal: String(bill.subtotal),
      tax: String(bill.tax),
      total: String(bill.total),
      notes: bill.notes || '',
      tipo_dte: bill.tipo_dte || '03',
      dte_version: bill.dte_version ? String(bill.dte_version) : '',
      dte_ambiente: bill.dte_ambiente || '',
      dte_numero_control: bill.dte_numero_control || '',
      dte_codigo_generacion: bill.dte_codigo_generacion || '',
      dte_hor_emi: bill.dte_hor_emi || '',
      dte_sello_recibido: bill.dte_sello_recibido || '',
      dte_firma_electronica: bill.dte_firma_electronica || '',
      supplier_name_snapshot: bill.supplier_name_snapshot || bill.supplier?.name || '',
      supplier_tax_id_snapshot: bill.supplier_tax_id_snapshot || bill.supplier?.nit || '',
      supplier_phone_snapshot: bill.supplier_phone_snapshot || bill.supplier?.phone || '',
      supplier_email_snapshot: bill.supplier_email_snapshot || bill.supplier?.email || '',
      supplier_address_snapshot: bill.supplier_address_snapshot || bill.supplier?.address || '',
      dte_emisor: bill.dte_emisor || null,
      dte_receptor: bill.dte_receptor || null,
      dte_cuerpo_documento: bill.dte_cuerpo_documento || [],
      dte_resumen: bill.dte_resumen || null,
      dte_apendice: bill.dte_apendice || [],
      dte_raw_json: bill.dte_raw_json || '',
      is_fiscal_credit: Boolean(bill.is_fiscal_credit),
    });
    setShowModal(true);
  };

  const handleDelete = async (billId: number, billNumber: string) => {
    if (!confirm(`¿Estás seguro de eliminar la factura "${billNumber}"?`)) return;

    try {
      await billsApi.delete(billId);
      await loadData();
      alert('Factura eliminada exitosamente');
    } catch (error: any) {
      console.error('Error deleting bill:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingBill(null);
    setImportedFromJson(false);
    setFormData(emptyForm());
  };

  const openPaymentModal = (bill: Bill) => {
    setBillToPay(bill);
    setPaymentData({
      bank_account_id: '',
      amount: String(Number(bill.balance || 0).toFixed(2)),
      payment_date: new Date().toISOString().split('T')[0],
      reference: bill.bill_number,
      notes: '',
    });
    setShowPaymentModal(true);
  };

  const handlePay = async () => {
    if (!billToPay) return;
    if (!paymentData.bank_account_id) {
      alert('Selecciona una cuenta bancaria para aplicar el pago.');
      return;
    }

    try {
      await billsApi.pay(billToPay.id, {
        bank_account_id: Number(paymentData.bank_account_id),
        amount: Number(paymentData.amount || 0),
        payment_date: paymentData.payment_date,
        reference: paymentData.reference || undefined,
        notes: paymentData.notes || undefined,
      });

      setShowPaymentModal(false);
      setBillToPay(null);
      await loadData();
      alert('Pago aplicado correctamente.');
    } catch (error: any) {
      console.error('Error paying bill:', error);
      alert('Error al aplicar pago: ' + (error?.message || 'Error desconocido'));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
      received: { label: 'Recibida', className: 'bg-blue-100 text-blue-800' },
      partial: { label: 'Parcial', className: 'bg-orange-100 text-orange-800' },
      paid: { label: 'Pagada', className: 'bg-green-100 text-green-800' },
      overdue: { label: 'Vencida', className: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelada', className: 'bg-slate-100 text-slate-800' },
      void: { label: 'Anulada', className: 'bg-red-100 text-red-800' },
    } as const;

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
          <p className="text-slate-600">Carga manual o importación de JSON DTE para compras</p>
        </div>
        <button
          onClick={() => {
            setEditingBill(null);
            setImportedFromJson(false);
            setFormData(emptyForm());
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
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Tipo DTE</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Proveedor</th>
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
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">No hay facturas de compra registradas</td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{bill.bill_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{bill.tipo_dte || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{bill.supplier?.name || bill.supplier_name_snapshot || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{bill.bill_date}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-800">${formatAmount(bill.total)}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(bill.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        {Number(bill.balance || 0) > 0 && !['paid', 'void', 'cancelled'].includes(String(bill.status)) && (
                          <button
                            onClick={() => openPaymentModal(bill)}
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Pagar"
                          >
                            PAGAR
                          </button>
                        )}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingBill ? 'Editar Factura de Compra' : 'Nueva Factura de Compra'}
              </h3>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor</label>
                  <SupplierAutocomplete
                    value={formData.supplier_id ? Number(formData.supplier_id) : ''}
                    onChange={(id) => setFormData({ ...formData, supplier_id: id ? String(id) : '' })}
                  />
                  {formData.supplier_id === '' && formData.supplier_name_snapshot && (
                    <p className="text-xs text-orange-700 mt-1">Proveedor no existe en catálogo, se guardará con snapshot del DTE.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correlativo DTE *</label>
                  <input
                    type="text"
                    value={formData.bill_number}
                    readOnly={importedFromJson}
                    onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg ${importedFromJson ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-300 focus:ring-2 focus:ring-slate-500'}`}
                    placeholder="DTE-03-M001P001-000000000000001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.bill_date}
                    readOnly={importedFromJson}
                    onChange={(e) => setFormData({ ...formData, bill_date: e.target.value })}
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
                  <p className="text-xs text-slate-500 mt-1">Solo tipo 03 alimenta Libro de Compras.</p>
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
                  rows={2}
                />
              </div>

              {(formData.dte_emisor || formData.dte_receptor || formData.dte_cuerpo_documento.length > 0 || formData.dte_resumen) && (
                <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
                  <h4 className="text-lg font-semibold text-slate-800">Validación del JSON DTE</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Emisor</p>
                      <p className="font-medium text-slate-800">{formData.dte_emisor?.nombre || formData.supplier_name_snapshot || '-'}</p>
                      <p className="text-sm text-slate-600">NIT: {formData.dte_emisor?.nit || formData.supplier_tax_id_snapshot || '-'}</p>
                      <p className="text-sm text-slate-600">Tel: {formData.dte_emisor?.telefono || formData.supplier_phone_snapshot || '-'}</p>
                      <p className="text-sm text-slate-600">Email: {formData.dte_emisor?.correo || formData.supplier_email_snapshot || '-'}</p>
                      <p className="text-xs text-slate-500">Dirección: {formData.dte_emisor?.direccion?.complemento || formData.supplier_address_snapshot || '-'}</p>
                      <p className="text-xs text-slate-500">NRC: {formData.dte_emisor?.nrc || '-'}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Receptor</p>
                      <p className="font-medium text-slate-800">{formData.dte_receptor?.nombre || '-'}</p>
                      <p className="text-sm text-slate-600">NIT: {formData.dte_receptor?.nit || '-'}</p>
                      <p className="text-xs text-slate-500">NRC: {formData.dte_receptor?.nrc || '-'}</p>
                    </div>
                  </div>

                  {formData.dte_cuerpo_documento.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-100 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">Item</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-700">Descripción</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">Cant.</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">Precio</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-slate-700">Gravada</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {formData.dte_cuerpo_documento.map((line, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 text-xs text-slate-700">{line?.numItem || idx + 1}</td>
                              <td className="px-3 py-2 text-xs text-slate-700">{line?.descripcion || '-'}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-700">{line?.cantidad || '-'}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-700">${formatAmount(line?.precioUni)}</td>
                              <td className="px-3 py-2 text-xs text-right text-slate-700">${formatAmount(line?.ventaGravada)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {formData.dte_resumen && (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">SubTotal</p>
                        <p className="font-semibold text-slate-800">${formatAmount(formData.dte_resumen?.subTotal)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total Gravada</p>
                        <p className="font-semibold text-slate-800">${formatAmount(formData.dte_resumen?.totalGravada)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total Pagar</p>
                        <p className="font-semibold text-slate-800">${formatAmount(formData.dte_resumen?.totalPagar)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total Letras</p>
                        <p className="font-semibold text-slate-800">{formData.dte_resumen?.totalLetras || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

      {showPaymentModal && billToPay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Aplicar Pago</h3>
            <p className="text-sm text-slate-600 mb-4">Factura: {billToPay.bill_number} | Saldo: ${formatAmount(billToPay.balance)}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta Bancaria *</label>
                <select
                  value={paymentData.bank_account_id}
                  onChange={(e) => setPaymentData({ ...paymentData, bank_account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="">Seleccionar cuenta...</option>
                  {bankAccounts.map((account) => (
                    <option key={account.id} value={String(account.id)}>
                      {account.bank_name} - {account.account_number} (Saldo: ${formatAmount(account.current_balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Monto</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Pago</label>
                  <input
                    type="date"
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referencia</label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setBillToPay(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handlePay}
                className="flex-1 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

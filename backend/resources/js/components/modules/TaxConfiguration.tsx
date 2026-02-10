import { useState, useEffect } from 'react';
import { Calculator, Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { useCompany } from '../../contexts/CompanyContext';
import { taxes } from '../../lib/api';
import { AccountAutocomplete } from '../common/AccountAutocomplete';

interface Tax {
  id: number;
  code: string;
  name: string;
  type: string;
  rate: number;
  is_active: boolean;
  debit_account_id?: number | null;
  credit_account_id?: number | null;
  debitAccount?: any;
  creditAccount?: any;
}

export function TaxConfiguration() {
  const { selectedCompany } = useCompany();
  const [taxList, setTaxList] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'IVA',
    rate: 0,
    is_active: true,
    debit_account_id: '' as number | '',
    credit_account_id: '' as number | '',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadTaxes();
    }
  }, [selectedCompany]);

  const loadTaxes = async () => {
    try {
      setLoading(true);
      const data = await taxes.getAll();
      const list = Array.isArray(data) ? data : (data.data || []);
      setTaxList(list);
    } catch (error) {
      console.error('Error loading taxes:', error);
      alert('Error al cargar los impuestos');
      setTaxList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Código y nombre son requeridos');
      return;
    }

    if (formData.rate < 0 || formData.rate > 100) {
      alert('La tasa debe estar entre 0 y 100');
      return;
    }

    try {
      if (editingTax) {
        await taxes.update(editingTax.id, formData);
      } else {
        await taxes.create(formData);
      }
      
      setShowModal(false);
      resetForm();
      loadTaxes();
    } catch (error: any) {
      console.error('Error saving tax:', error);
      const message = (error && error.message) || (error?.errors ? Object.values(error.errors).flat().join(', ') : 'Error al guardar el impuesto');
      alert(message);
    }
  };

  const handleEdit = (tax: Tax) => {
    setEditingTax(tax);
    setFormData({
      code: tax.code,
      name: tax.name,
      type: tax.type,
      rate: tax.rate,
      is_active: tax.is_active,
      debit_account_id: tax.debit_account_id || '',
      credit_account_id: tax.credit_account_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este impuesto?')) return;
    
    try {
      await taxes.delete(id);
      loadTaxes();
    } catch (error: any) {
      console.error('Error deleting tax:', error);
      const message = error?.response?.data?.message || 'Error al eliminar el impuesto';
      alert(message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'IVA',
      rate: 0,
      is_active: true,
    });
    setEditingTax(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredTaxes = taxList.filter(tax =>
    tax.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tax.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tax.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedCompany) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Seleccione una empresa para continuar</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-slate-700" />
          <h3 className="text-xl font-semibold text-slate-800">Configuración de Impuestos</h3>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Impuesto
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-slate-600">Cargando...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-3 font-semibold text-slate-700">Código</th>
                <th className="text-left p-3 font-semibold text-slate-700">Nombre</th>
                <th className="text-left p-3 font-semibold text-slate-700">Tipo</th>
                <th className="text-left p-3 font-semibold text-slate-700">Cuenta (Débito)</th>
                <th className="text-left p-3 font-semibold text-slate-700">Cuenta (Crédito)</th>
                <th className="text-right p-3 font-semibold text-slate-700">Tasa</th>
                <th className="text-center p-3 font-semibold text-slate-700">Estado</th>
                <th className="text-center p-3 font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaxes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    No hay impuestos registrados
                  </td>
                </tr>
              ) : (
                filteredTaxes.map((tax) => (
                  <tr key={tax.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-3 font-mono text-sm">{tax.code}</td>
                    <td className="p-3">{tax.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {tax.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-700">{tax.debitAccount ? `${tax.debitAccount.code} - ${tax.debitAccount.name}` : '-'}</td>
                    <td className="p-3 text-sm text-slate-700">{tax.creditAccount ? `${tax.creditAccount.code} - ${tax.creditAccount.name}` : '-'}</td>
                    <td className="p-3 text-right font-semibold">
                      {Number(tax.rate).toFixed(2)}%
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          tax.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tax.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(tax)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tax.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
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
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingTax ? 'Editar Impuesto' : 'Nuevo Impuesto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="IVA">IVA</option>
                  <option value="Retención ISR">Retención ISR</option>
                  <option value="Retención IVA">Retención IVA</option>
                  <option value="Percepción">Percepción</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tasa (%) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-slate-700">
                  Activo
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta (Débito)</label>
                <AccountAutocomplete
                  value={formData.debit_account_id}
                  onChange={(id) => setFormData({ ...formData, debit_account_id: id })}
                  placeholder="Selecciona cuenta débito"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta (Crédito)</label>
                <AccountAutocomplete
                  value={formData.credit_account_id}
                  onChange={(id) => setFormData({ ...formData, credit_account_id: id })}
                  placeholder="Selecciona cuenta crédito"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTax ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

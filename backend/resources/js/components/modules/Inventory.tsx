import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { inventoryItems as inventoryApi, accounts as accountsApi } from '../../lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../../types';

interface InventoryFormData {
  item_code: string;
  name: string;
  item_type: 'bien' | 'servicio' | 'ambos';
  description: string;
  unit_of_measure: string;
  average_cost: string;
  current_quantity: string;
  inventory_account_id: string;
  cogs_account_id: string;
}

export function Inventory() {
  const { selectedCompany } = useCompany();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<Array<{ id: number; code: string; name: string; is_detail?: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<InventoryFormData>({
    item_code: '',
    name: '',
    item_type: 'bien',
    description: '',
    unit_of_measure: 'UNI',
    average_cost: '0',
    current_quantity: '0',
    inventory_account_id: '',
    cogs_account_id: '',
  });

  useEffect(() => {
    if (selectedCompany) {
      loadItems();
    }
  }, [selectedCompany]);

  const loadItems = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const [response, accountsResponse] = await Promise.all([
        inventoryApi.getAll(),
        accountsApi.getAll(),
      ]);

      const list = Array.isArray(response)
        ? response
        : Array.isArray((response as any)?.data)
          ? (response as any).data
          : Array.isArray((response as any)?.data?.data)
            ? (response as any).data.data
            : [];

      const accountList: any[] = Array.isArray(accountsResponse)
        ? accountsResponse
        : Array.isArray((accountsResponse as any)?.data)
          ? (accountsResponse as any).data
          : [];

      setItems(list);
      setLedgerAccounts(accountList.filter((account: any) => account?.is_detail));
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value: any) => {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) return '0.00';
    return numeric.toFixed(2);
  };

  const resetForm = () => {
    setFormData({
      item_code: '',
      name: '',
      item_type: 'bien',
      description: '',
      unit_of_measure: 'UNI',
      average_cost: '0',
      current_quantity: '0',
      inventory_account_id: '',
      cogs_account_id: '',
    });
  };

  const handleSave = async () => {
    try {
      const data = {
        item_code: formData.item_code,
        name: formData.name,
        item_type: formData.item_type,
        description: formData.description || undefined,
        unit_of_measure: formData.unit_of_measure,
        average_cost: formData.average_cost,
        current_quantity: formData.current_quantity,
        inventory_account_id: formData.inventory_account_id ? Number(formData.inventory_account_id) : null,
        cogs_account_id: formData.cogs_account_id ? Number(formData.cogs_account_id) : null,
        active: true,
      };

      if (editing) {
        await inventoryApi.update(editing.id, data);
      } else {
        await inventoryApi.create(data);
      }

      setShowModal(false);
      setEditing(null);
      resetForm();
      loadItems();
    } catch (error: any) {
      console.error('Error saving item:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditing(item);
    setFormData({
      item_code: (item as any).item_code ?? item.code,
      name: item.name,
      item_type: (item as any).item_type || 'bien',
      description: item.description || '',
      unit_of_measure: item.unit_of_measure,
      average_cost: String((item as any).average_cost ?? '0'),
      current_quantity: String((item as any).current_quantity ?? '0'),
      inventory_account_id: (item as any).inventory_account_id ? String((item as any).inventory_account_id) : '',
      cogs_account_id: (item as any).cogs_account_id ? String((item as any).cogs_account_id) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar producto "${name}"?`)) return;

    try {
      await inventoryApi.delete(id);
      loadItems();
    } catch (error: any) {
      console.error('Error deleting:', error);
      alert('Error al eliminar: ' + (error?.message || 'Error desconocido'));
    }
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
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Inventario</h2>
          <p className="text-slate-600">Gestión de bienes, servicios y ambos</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Ítem
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Unidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Costo</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Existencia</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    Cargando...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{(item as any).item_code ?? item.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 capitalize">{(item as any).item_type || 'bien'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.unit_of_measure}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800">${formatAmount((item as any).average_cost)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800">{formatAmount((item as any).current_quantity)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-slate-600 hover:text-slate-800"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
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
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editing ? 'Editar Ítem' : 'Nuevo Ítem'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    value={formData.item_code}
                    onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="PROD001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unidad de Medida *</label>
                  <input
                    type="text"
                    value={formData.unit_of_measure}
                    onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="UNI, KG, M, L"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Nombre del producto o servicio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Ítem *</label>
                <select
                  value={formData.item_type}
                  onChange={(e) => setFormData({ ...formData, item_type: e.target.value as 'bien' | 'servicio' | 'ambos' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                >
                  <option value="bien">Bien (Producto)</option>
                  <option value="servicio">Servicio</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={2}
                  placeholder="Descripción del producto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Costo Unitario</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.average_cost}
                    onChange={(e) => setFormData({ ...formData, average_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Existencia Actual</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta de Inventario</label>
                  <select
                    value={formData.inventory_account_id}
                    onChange={(e) => setFormData({ ...formData, inventory_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {ledgerAccounts.map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cuenta de Costo de Venta</label>
                  <select
                    value={formData.cogs_account_id}
                    onChange={(e) => setFormData({ ...formData, cogs_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar cuenta...</option>
                    {ledgerAccounts.map((account) => (
                      <option key={account.id} value={String(account.id)}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  resetForm();
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

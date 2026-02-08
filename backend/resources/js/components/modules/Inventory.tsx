import { useEffect, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { inventoryItems as inventoryApi } from '../../lib/api';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../../types';

export function Inventory() {
  const { selectedCompany } = useCompany();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit_of_measure: 'UNI',
    unit_cost: '0',
    unit_price: '0',
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
      const response = await inventoryApi.getAll();
      const list = Array.isArray(response) ? response : (response.data || []);
      setItems(list);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        description: formData.description || undefined,
        unit_of_measure: formData.unit_of_measure,
        unit_cost: formData.unit_cost,
        unit_price: formData.unit_price,
        is_active: true,
      };

      if (editing) {
        await inventoryApi.update(editing.id, data);
      } else {
        await inventoryApi.create(data);
      }

      setShowModal(false);
      setEditing(null);
      setFormData({ code: '', name: '', description: '', unit_of_measure: 'UNI', unit_cost: '0', unit_price: '0' });
      loadItems();
    } catch (error: any) {
      console.error('Error saving item:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditing(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      unit_of_measure: item.unit_of_measure,
      unit_cost: item.unit_cost,
      unit_price: item.unit_price,
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
          <p className="text-slate-600">Gestión de productos y servicios</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ code: '', name: '', description: '', unit_of_measure: 'UNI', unit_cost: '0', unit_price: '0' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Unidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Costo</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-700">Precio</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-600">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.unit_of_measure}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800">${parseFloat(item.unit_cost).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-slate-800">${parseFloat(item.unit_price).toFixed(2)}</td>
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
              {editing ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Venta</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditing(null);
                  setFormData({ code: '', name: '', description: '', unit_of_measure: 'UNI', unit_cost: '0', unit_price: '0' });
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

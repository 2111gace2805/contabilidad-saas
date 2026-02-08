import { useState } from 'react';
import { ApiClient } from '../../lib/api';
import { X, Lock } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function ChangeOwnPasswordModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Las contraseñas no coinciden'] });
      return;
    }

    if (form.password.length < 8) {
      setErrors({ password: ['La contraseña debe tener al menos 8 caracteres'] });
      return;
    }

    setLoading(true);
    try {
      await ApiClient.post('/user/change-password', form);
      alert('Contraseña actualizada exitosamente');
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      setErrors(error?.response?.data?.errors || {});
      alert('Error: ' + (error?.response?.data?.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Cambiar Mi Contraseña
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña Actual *
            </label>
            <input
              type="password"
              value={form.current_password}
              onChange={(e) => setForm({ ...form, current_password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.current_password && (
              <p className="text-xs text-red-600 mt-1">{errors.current_password[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nueva Contraseña *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password[0]}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <input
              type="password"
              value={form.password_confirmation}
              onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
              minLength={8}
            />
            {errors.password_confirmation && (
              <p className="text-xs text-red-600 mt-1">{errors.password_confirmation[0]}</p>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { type ChangeEvent, type CSSProperties, useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { companyPreferences } from '../../lib/api';
import type { CompanyPreference } from '../../types';

type ThemeTemplate = 'default' | 'ocean' | 'emerald-midnight' | 'classic';
type FontFamily = 'inter' | 'system' | 'roboto' | 'open-sans' | 'lato';

type AppearanceForm = {
  primary_color: CompanyPreference['primary_color'];
  ui_theme_template: ThemeTemplate;
  ui_accent_color: string;
  ui_header_color: string;
  ui_sidebar_color: string;
  ui_background_color: string;
  ui_font_family: FontFamily;
  company_logo_png: string;
};

const defaultForm: AppearanceForm = {
  primary_color: 'slate',
  ui_theme_template: 'default',
  ui_accent_color: '#1e293b',
  ui_header_color: '#ffffff',
  ui_sidebar_color: '#1e293b',
  ui_background_color: '#f1f5f9',
  ui_font_family: 'inter',
  company_logo_png: '',
};

const templateMap: Record<ThemeTemplate, Partial<AppearanceForm>> = {
  default: {
    ui_accent_color: '#1e293b',
    ui_header_color: '#ffffff',
    ui_sidebar_color: '#1e293b',
    ui_background_color: '#f1f5f9',
    ui_font_family: 'inter',
    primary_color: 'slate',
  },
  ocean: {
    ui_accent_color: '#0369a1',
    ui_header_color: '#f0f9ff',
    ui_sidebar_color: '#0c4a6e',
    ui_background_color: '#e0f2fe',
    ui_font_family: 'open-sans',
    primary_color: 'blue',
  },
  'emerald-midnight': {
    ui_accent_color: '#065f46',
    ui_header_color: '#ecfdf5',
    ui_sidebar_color: '#022c22',
    ui_background_color: '#d1fae5',
    ui_font_family: 'lato',
    primary_color: 'emerald',
  },
  classic: {
    ui_accent_color: '#7c2d12',
    ui_header_color: '#fffbeb',
    ui_sidebar_color: '#431407',
    ui_background_color: '#fef3c7',
    ui_font_family: 'roboto',
    primary_color: 'amber',
  },
};

export function AppearanceSettings() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AppearanceForm>(defaultForm);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await companyPreferences.get();
      setForm({
        primary_color: data.primary_color || 'slate',
        ui_theme_template: (data.ui_theme_template as ThemeTemplate) || 'default',
        ui_accent_color: data.ui_accent_color || '#1e293b',
        ui_header_color: data.ui_header_color || '#ffffff',
        ui_sidebar_color: data.ui_sidebar_color || '#1e293b',
        ui_background_color: data.ui_background_color || '#f1f5f9',
        ui_font_family: (data.ui_font_family as FontFamily) || 'inter',
        company_logo_png: data.company_logo_png || '',
      });
    } catch (error) {
      console.error('Error loading appearance preferences:', error);
      alert('No se pudo cargar la configuración visual.');
    } finally {
      setLoading(false);
    }
  };

  const previewStyles = useMemo(() => ({
    '--preview-accent': form.ui_accent_color,
    '--preview-header': form.ui_header_color,
    '--preview-sidebar': form.ui_sidebar_color,
    '--preview-bg': form.ui_background_color,
  } as CSSProperties), [form]);

  const handleApplyTemplate = (template: ThemeTemplate) => {
    const mapped = templateMap[template];
    setForm((prev) => ({
      ...prev,
      ui_theme_template: template,
      primary_color: (mapped.primary_color as AppearanceForm['primary_color']) || prev.primary_color,
      ui_accent_color: mapped.ui_accent_color || prev.ui_accent_color,
      ui_header_color: mapped.ui_header_color || prev.ui_header_color,
      ui_sidebar_color: mapped.ui_sidebar_color || prev.ui_sidebar_color,
      ui_background_color: mapped.ui_background_color || prev.ui_background_color,
      ui_font_family: (mapped.ui_font_family as FontFamily) || prev.ui_font_family,
    }));
  };

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      alert('Solo se permite formato PNG para el logo.');
      event.target.value = '';
      return;
    }

    if (file.size > 1024 * 1024 * 2) {
      alert('El logo no debe superar 2MB.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, company_logo_png: String(reader.result || '') }));
    };
    reader.onerror = () => alert('No se pudo leer el archivo PNG.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await companyPreferences.update(form);
      alert('Apariencia actualizada exitosamente.');
    } catch (error: any) {
      console.error('Error saving appearance:', error);
      alert('Error al guardar apariencia: ' + (error?.message || 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  if (!selectedCompany) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium">Selecciona una empresa</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-slate-600">Cargando configuración visual...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">Apariencia y Marca</h3>
        <p className="text-slate-600">Personaliza colores, fuente y logo por compañía.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Plantilla visual</label>
            <select
              value={form.ui_theme_template}
              onChange={(e) => handleApplyTemplate(e.target.value as ThemeTemplate)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="default">Actual (Default)</option>
              <option value="ocean">Ocean</option>
              <option value="emerald-midnight">Emerald Midnight</option>
              <option value="classic">Classic</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color acento</label>
              <input type="color" value={form.ui_accent_color} onChange={(e) => setForm((p) => ({ ...p, ui_accent_color: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fondo encabezado</label>
              <input type="color" value={form.ui_header_color} onChange={(e) => setForm((p) => ({ ...p, ui_header_color: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fondo menú lateral</label>
              <input type="color" value={form.ui_sidebar_color} onChange={(e) => setForm((p) => ({ ...p, ui_sidebar_color: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fondo aplicación</label>
              <input type="color" value={form.ui_background_color} onChange={(e) => setForm((p) => ({ ...p, ui_background_color: e.target.value }))} className="w-full h-10 border border-slate-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuente principal</label>
            <select
              value={form.ui_font_family}
              onChange={(e) => setForm((p) => ({ ...p, ui_font_family: e.target.value as FontFamily }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="inter">Inter</option>
              <option value="system">System</option>
              <option value="roboto">Roboto</option>
              <option value="open-sans">Open Sans</option>
              <option value="lato">Lato</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Logo de compañía (PNG)</label>
            <input
              type="file"
              accept="image/png"
              onChange={handleLogoChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <div className="mt-2 flex items-center gap-3">
              {form.company_logo_png ? (
                <img src={form.company_logo_png} alt="Logo compañía" className="w-12 h-12 rounded object-cover border border-slate-200" />
              ) : (
                <div className="w-12 h-12 rounded bg-slate-800 flex items-center justify-center text-white text-xs font-semibold">Logo</div>
              )}
              {form.company_logo_png && (
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, company_logo_png: '' }))}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50"
                >
                  Quitar logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">Vista previa</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden" style={previewStyles}>
            <div className="h-12 px-3 flex items-center gap-2" style={{ backgroundColor: 'var(--preview-header)' }}>
              {form.company_logo_png ? (
                <img src={form.company_logo_png} alt="Logo" className="w-7 h-7 rounded object-cover" />
              ) : (
                <div className="w-7 h-7 rounded bg-slate-800" />
              )}
              <div className="h-2 w-28 rounded" style={{ backgroundColor: 'var(--preview-accent)' }} />
            </div>
            <div className="flex" style={{ backgroundColor: 'var(--preview-bg)' }}>
              <div className="w-24 h-24" style={{ backgroundColor: 'var(--preview-sidebar)' }} />
              <div className="flex-1 p-3">
                <div className="h-3 w-32 rounded mb-2" style={{ backgroundColor: 'var(--preview-accent)' }} />
                <div className="h-2 w-full bg-slate-200 rounded mb-2" />
                <div className="h-2 w-4/5 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar Apariencia'}
        </button>
      </div>
    </div>
  );
}

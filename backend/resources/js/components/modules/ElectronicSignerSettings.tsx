import { useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { companyPreferences } from '../../lib/api';

type SignerTab = 'cert' | 'smtp';

interface FormState {
  primary_color: 'slate' | 'blue' | 'emerald' | 'indigo' | 'rose' | 'amber';
  dte_establishment_code: string;
  dte_point_of_sale_code: string;
  firmador_certificate_name: string;
  firmador_certificate_content: string;
  firmador_private_key_name: string;
  firmador_private_key_content: string;
  firmador_api_password: string;
  firmador_api_url: string;
  smtp_provider: 'office365' | 'google' | 'zeptomail' | 'aws' | 'custom';
  smtp_url: string;
  smtp_api_key: string;
  smtp_host: string;
  smtp_port: string;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: 'tls' | 'ssl' | 'starttls' | 'none';
  smtp_region: string;
}

const defaultForm = (): FormState => ({
  primary_color: 'slate',
  dte_establishment_code: 'M001',
  dte_point_of_sale_code: 'P001',
  firmador_certificate_name: '',
  firmador_certificate_content: '',
  firmador_private_key_name: '',
  firmador_private_key_content: '',
  firmador_api_password: '',
  firmador_api_url: '',
  smtp_provider: 'office365',
  smtp_url: '',
  smtp_api_key: '',
  smtp_host: '',
  smtp_port: '',
  smtp_username: '',
  smtp_password: '',
  smtp_encryption: 'tls',
  smtp_region: '',
});

const providerDefaults: Record<FormState['smtp_provider'], Partial<FormState>> = {
  office365: { smtp_host: 'smtp.office365.com', smtp_port: '587', smtp_encryption: 'starttls' },
  google: { smtp_host: 'smtp.gmail.com', smtp_port: '587', smtp_encryption: 'starttls' },
  zeptomail: { smtp_host: 'smtp.zeptomail.com', smtp_port: '587', smtp_encryption: 'tls' },
  aws: { smtp_host: 'email-smtp.us-east-1.amazonaws.com', smtp_port: '587', smtp_encryption: 'tls' },
  custom: {},
};

export function ElectronicSignerSettings() {
  const { selectedCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SignerTab>('cert');
  const [form, setForm] = useState<FormState>(defaultForm);

  useEffect(() => {
    if (selectedCompany) {
      loadPreferences();
    }
  }, [selectedCompany]);

  const loadPreferences = async () => {
    if (!selectedCompany) return;

    setLoading(true);
    try {
      const data = await companyPreferences.get();
      setForm({
        primary_color: data.primary_color || 'slate',
        dte_establishment_code: data.dte_establishment_code || 'M001',
        dte_point_of_sale_code: data.dte_point_of_sale_code || 'P001',
        firmador_certificate_name: data.firmador_certificate_name || '',
        firmador_certificate_content: data.firmador_certificate_content || '',
        firmador_private_key_name: data.firmador_private_key_name || '',
        firmador_private_key_content: data.firmador_private_key_content || '',
        firmador_api_password: data.firmador_api_password || '',
        firmador_api_url: data.firmador_api_url || '',
        smtp_provider: (data.smtp_provider as FormState['smtp_provider']) || 'office365',
        smtp_url: data.smtp_url || '',
        smtp_api_key: data.smtp_api_key || '',
        smtp_host: data.smtp_host || '',
        smtp_port: data.smtp_port ? String(data.smtp_port) : '',
        smtp_username: data.smtp_username || '',
        smtp_password: data.smtp_password || '',
        smtp_encryption: (data.smtp_encryption as FormState['smtp_encryption']) || 'tls',
        smtp_region: data.smtp_region || '',
      });
    } catch (error) {
      console.error('Error loading company preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const certificateLoaded = useMemo(() => form.firmador_certificate_name.trim().length > 0, [form.firmador_certificate_name]);
  const privateKeyLoaded = useMemo(() => form.firmador_private_key_content.trim().length > 0, [form.firmador_private_key_content]);

  const readFileAsText = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleLoadCertificate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.crt')) {
      alert('Solo se permiten archivos .crt para el certificado.');
      event.target.value = '';
      return;
    }

    try {
      const content = await readFileAsText(file);
      setForm((prev) => ({
        ...prev,
        firmador_certificate_name: file.name,
        firmador_certificate_content: content,
      }));
    } catch (error) {
      console.error('Error reading certificate file:', error);
      alert('No se pudo leer el archivo de certificado.');
    } finally {
      event.target.value = '';
    }
  };

  const handleProviderChange = (provider: FormState['smtp_provider']) => {
    const defaults = providerDefaults[provider] || {};
    setForm((prev) => ({
      ...prev,
      smtp_provider: provider,
      ...defaults,
    }));
  };

  const handleSave = async () => {
    if (!selectedCompany) return;

    if (activeTab === 'cert') {
      if (form.firmador_api_url && !/^https?:\/\//i.test(form.firmador_api_url)) {
        alert('La URL del firmador debe iniciar con http:// o https://');
        return;
      }
    }

    if (activeTab === 'smtp') {
      if (form.smtp_url && !/^https?:\/\//i.test(form.smtp_url)) {
        alert('La URL SMTP/API debe iniciar con http:// o https://');
        return;
      }
    }

    setSaving(true);
    try {
      await companyPreferences.update({
        primary_color: form.primary_color,
        dte_establishment_code: form.dte_establishment_code || 'M001',
        dte_point_of_sale_code: form.dte_point_of_sale_code || 'P001',
        firmador_certificate_name: form.firmador_certificate_name || null,
        firmador_certificate_content: form.firmador_certificate_content || null,
        firmador_private_key_name: form.firmador_private_key_name || null,
        firmador_private_key_content: form.firmador_private_key_content || null,
        firmador_api_password: form.firmador_api_password || null,
        firmador_api_url: form.firmador_api_url || null,
        smtp_provider: form.smtp_provider || null,
        smtp_url: form.smtp_url || null,
        smtp_api_key: form.smtp_api_key || null,
        smtp_host: form.smtp_host || null,
        smtp_port: form.smtp_port ? Number(form.smtp_port) : null,
        smtp_username: form.smtp_username || null,
        smtp_password: form.smtp_password || null,
        smtp_encryption: form.smtp_encryption || null,
        smtp_region: form.smtp_region || null,
      });

      alert('Configuración de Firmador Electrónico guardada.');
    } catch (error: any) {
      console.error('Error saving firmador/smtp settings:', error);
      alert('Error al guardar: ' + (error?.message || 'Error desconocido'));
    } finally {
      setSaving(false);
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

  if (loading) {
    return <p className="text-slate-600">Cargando configuración de firmador...</p>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Firmador Electrónico</h2>
        <p className="text-slate-600">Configura certificado, llave privada y parámetros SMTP/API para envío.</p>
      </div>

      <div className="border border-slate-200 rounded-lg">
        <div className="border-b border-slate-200 p-2 flex gap-2">
          <button
            className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'cert' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('cert')}
          >
            Cargar Certificado
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'smtp' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('smtp')}
          >
            SMTP
          </button>
        </div>

        <div className="p-6 space-y-4">
          {activeTab === 'cert' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código matriz/sucursal</label>
                  <input
                    type="text"
                    value={form.dte_establishment_code}
                    onChange={(e) => setForm({ ...form, dte_establishment_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="M001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código punto de venta</label>
                  <input
                    type="text"
                    value={form.dte_point_of_sale_code}
                    onChange={(e) => setForm({ ...form, dte_point_of_sale_code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="P001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Certificado (.crt)</label>
                  <input
                    type="file"
                    accept=".crt"
                    onChange={handleLoadCertificate}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">{certificateLoaded ? `Cargado: ${form.firmador_certificate_name}` : 'No hay certificado cargado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Llave Privada (texto)</label>
                  <textarea
                    value={form.firmador_private_key_content}
                    onChange={(e) => setForm((prev) => ({ ...prev, firmador_private_key_content: e.target.value, firmador_private_key_name: 'manual_text' }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    rows={4}
                    placeholder="Pega aquí la llave privada en texto"
                  />
                  <p className="text-xs text-slate-500 mt-1">{privateKeyLoaded ? 'Llave privada capturada en texto' : 'No hay llave privada ingresada'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña API</label>
                  <input
                    type="password"
                    value={form.firmador_api_password}
                    onChange={(e) => setForm({ ...form, firmador_api_password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Contraseña del API del firmador"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL API Firmador</label>
                  <input
                    type="url"
                    value={form.firmador_api_url}
                    onChange={(e) => setForm({ ...form, firmador_api_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="https://api.firmador.com/v1"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Proveedor SMTP</label>
                  <select
                    value={form.smtp_provider}
                    onChange={(e) => handleProviderChange(e.target.value as FormState['smtp_provider'])}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="office365">Office 365</option>
                    <option value="google">Google</option>
                    <option value="zeptomail">Zepto Mail</option>
                    <option value="aws">AWS SES</option>
                    <option value="custom">SMTP Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL API/Servicio</label>
                  <input
                    type="url"
                    value={form.smtp_url}
                    onChange={(e) => setForm({ ...form, smtp_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="https://api.mailservice.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                  <input
                    type="password"
                    value={form.smtp_api_key}
                    onChange={(e) => setForm({ ...form, smtp_api_key: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="API key del proveedor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Host SMTP</label>
                  <input
                    type="text"
                    value={form.smtp_host}
                    onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="smtp.proveedor.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Puerto</label>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={form.smtp_port}
                    onChange={(e) => setForm({ ...form, smtp_port: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Usuario SMTP</label>
                  <input
                    type="text"
                    value={form.smtp_username}
                    onChange={(e) => setForm({ ...form, smtp_username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="usuario@dominio.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña SMTP</label>
                  <input
                    type="password"
                    value={form.smtp_password}
                    onChange={(e) => setForm({ ...form, smtp_password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="Contraseña SMTP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cifrado</label>
                  <select
                    value={form.smtp_encryption}
                    onChange={(e) => setForm({ ...form, smtp_encryption: e.target.value as FormState['smtp_encryption'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="starttls">STARTTLS</option>
                    <option value="none">Sin cifrado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Región (opcional)</label>
                  <input
                    type="text"
                    value={form.smtp_region}
                    onChange={(e) => setForm({ ...form, smtp_region: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="us-east-1"
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

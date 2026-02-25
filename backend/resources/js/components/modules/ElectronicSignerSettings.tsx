import { useEffect, useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { catalogs, companies, companyPreferences } from '../../lib/api';

type SignerTab = 'general' | 'cert' | 'smtp';

interface FormState {
  company_name: string;
  company_nit: string;
  company_nrc: string;
  company_phone: string;
  company_address: string;
  primary_color: 'slate' | 'blue' | 'emerald' | 'indigo' | 'rose' | 'amber';
  dte_establishment_code: string;
  dte_point_of_sale_code: string;
  emisor_nombre_comercial: string;
  emisor_tipo_establecimiento: string;
  emisor_correo: string;
  emisor_cod_actividad: string;
  emisor_desc_actividad: string;
  emisor_departamento: string;
  emisor_municipio: string;
  emisor_direccion_complemento: string;
  emisor_cod_estable: string;
  emisor_cod_punto_venta: string;
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
  company_name: '',
  company_nit: '',
  company_nrc: '',
  company_phone: '',
  company_address: '',
  primary_color: 'slate',
  dte_establishment_code: 'M001',
  dte_point_of_sale_code: 'P001',
  emisor_nombre_comercial: '',
  emisor_tipo_establecimiento: '02',
  emisor_correo: '',
  emisor_cod_actividad: '',
  emisor_desc_actividad: '',
  emisor_departamento: '',
  emisor_municipio: '',
  emisor_direccion_complemento: '',
  emisor_cod_estable: 'M001',
  emisor_cod_punto_venta: 'P001',
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
  const { selectedCompany, refreshCompanies } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SignerTab>('general');
  const [form, setForm] = useState<FormState>(defaultForm);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [municipalities, setMunicipalities] = useState<Array<{ id: number; name: string }>>([]);
  const [economicActivities, setEconomicActivities] = useState<Array<{ id: string; name: string }>>([]);

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
      const [departmentsData, activitiesData] = await Promise.all([
        catalogs.getDepartments(),
        catalogs.getEconomicActivities(),
      ]);

      setDepartments(departmentsData || []);
      setEconomicActivities((activitiesData || []).map((item: any) => ({ id: String(item.id), name: String(item.name) })));

      const selectedActivity = (activitiesData || []).find((item: any) => String(item.id) === String(data.emisor_cod_actividad || ''));

      const depaId = String(data.emisor_departamento || '');
      let municipalitiesData: any[] = [];
      if (depaId) {
        municipalitiesData = await catalogs.getMunicipalities({ depa_id: depaId });
      }
      setMunicipalities((municipalitiesData || []).map((item: any) => ({ id: Number(item.id), name: String(item.name) })));

      setForm({
        company_name: selectedCompany?.name || '',
        company_nit: selectedCompany?.nit || selectedCompany?.rfc || '',
        company_nrc: (selectedCompany as any)?.nrc || '',
        company_phone: selectedCompany?.phone || '',
        company_address: selectedCompany?.address || '',
        primary_color: data.primary_color || 'slate',
        dte_establishment_code: data.dte_establishment_code || 'M001',
        dte_point_of_sale_code: data.dte_point_of_sale_code || 'P001',
        emisor_nombre_comercial: data.emisor_nombre_comercial || selectedCompany?.name || '',
        emisor_tipo_establecimiento: data.emisor_tipo_establecimiento || '02',
        emisor_correo: data.emisor_correo || '',
        emisor_cod_actividad: data.emisor_cod_actividad || '',
        emisor_desc_actividad: data.emisor_desc_actividad || selectedActivity?.name || '',
        emisor_departamento: depaId,
        emisor_municipio: String(data.emisor_municipio || ''),
        emisor_direccion_complemento: data.emisor_direccion_complemento || selectedCompany?.address || '',
        emisor_cod_estable: data.emisor_cod_estable || data.dte_establishment_code || 'M001',
        emisor_cod_punto_venta: data.emisor_cod_punto_venta || data.dte_point_of_sale_code || 'P001',
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
      if (selectedCompany?.id) {
        await companies.update(Number(selectedCompany.id), {
          name: form.company_name || selectedCompany.name,
          nit: form.company_nit || null,
          rfc: form.company_nit || null,
          nrc: form.company_nrc || null,
          phone: form.company_phone || null,
          address: form.company_address || null,
        } as any);

        await refreshCompanies();
      }

      await companyPreferences.update({
        primary_color: form.primary_color,
        dte_establishment_code: form.dte_establishment_code || 'M001',
        dte_point_of_sale_code: form.dte_point_of_sale_code || 'P001',
        emisor_nombre_comercial: form.emisor_nombre_comercial || null,
        emisor_tipo_establecimiento: form.emisor_tipo_establecimiento || null,
        emisor_correo: form.emisor_correo || null,
        emisor_cod_actividad: form.emisor_cod_actividad || null,
        emisor_desc_actividad: form.emisor_desc_actividad || null,
        emisor_departamento: form.emisor_departamento || null,
        emisor_municipio: form.emisor_municipio || null,
        emisor_direccion_complemento: form.emisor_direccion_complemento || null,
        emisor_cod_estable: form.emisor_cod_estable || form.dte_establishment_code || null,
        emisor_cod_punto_venta: form.emisor_cod_punto_venta || form.dte_point_of_sale_code || null,
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
            className={`px-4 py-2 text-sm rounded-lg ${activeTab === 'general' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('general')}
          >
            Datos Generales
          </button>
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
          {activeTab === 'general' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre (Emisor)</label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NIT</label>
                  <input
                    type="text"
                    value={form.company_nit}
                    onChange={(e) => setForm({ ...form, company_nit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NRC</label>
                  <input
                    type="text"
                    value={form.company_nrc}
                    onChange={(e) => setForm({ ...form, company_nrc: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={form.company_phone}
                    onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo DTE</label>
                  <input
                    type="email"
                    value={form.emisor_correo}
                    onChange={(e) => setForm({ ...form, emisor_correo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cod. Actividad</label>
                  <select
                    value={form.emisor_cod_actividad}
                    onChange={(e) => {
                      const code = e.target.value;
                      const selected = economicActivities.find((item) => item.id === code);
                      setForm({ ...form, emisor_cod_actividad: code, emisor_desc_actividad: selected?.name || '' });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar...</option>
                    {economicActivities.map((activity) => (
                      <option key={activity.id} value={activity.id}>{activity.id}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desc. Actividad</label>
                  <input
                    type="text"
                    value={form.emisor_desc_actividad}
                    onChange={(e) => setForm({ ...form, emisor_desc_actividad: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                  <select
                    value={form.emisor_departamento}
                    onChange={async (e) => {
                      const depa = e.target.value;
                      const muni = depa ? await catalogs.getMunicipalities({ depa_id: depa }) : [];
                      setMunicipalities((muni || []).map((item: any) => ({ id: Number(item.id), name: String(item.name) })));
                      setForm({ ...form, emisor_departamento: depa, emisor_municipio: '' });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar...</option>
                    {departments.map((dep) => (
                      <option key={dep.id} value={dep.id}>{dep.id} - {dep.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Municipio</label>
                  <select
                    value={form.emisor_municipio}
                    onChange={(e) => setForm({ ...form, emisor_municipio: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="">Seleccionar...</option>
                    {municipalities.map((mun) => (
                      <option key={mun.id} value={String(mun.id)}>{mun.id} - {mun.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Establecimiento</label>
                  <input
                    type="text"
                    value={form.emisor_tipo_establecimiento}
                    onChange={(e) => setForm({ ...form, emisor_tipo_establecimiento: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="02"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección complemento</label>
                <textarea
                  value={form.emisor_direccion_complemento}
                  onChange={(e) => setForm({ ...form, emisor_direccion_complemento: e.target.value, company_address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CodEstableMH</label>
                  <input
                    type="text"
                    value={form.dte_establishment_code}
                    onChange={(e) => {
                      const next = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                      setForm({ ...form, dte_establishment_code: next, emisor_cod_estable: next || form.emisor_cod_estable });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="M001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CodEstable</label>
                  <input
                    type="text"
                    value={form.emisor_cod_estable}
                    onChange={(e) => setForm({ ...form, emisor_cod_estable: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="M001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CodPuntoVentaMH</label>
                  <input
                    type="text"
                    value={form.dte_point_of_sale_code}
                    onChange={(e) => {
                      const next = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
                      setForm({ ...form, dte_point_of_sale_code: next, emisor_cod_punto_venta: next || form.emisor_cod_punto_venta });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="P001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CodPuntoVenta</label>
                  <input
                    type="text"
                    value={form.emisor_cod_punto_venta}
                    onChange={(e) => setForm({ ...form, emisor_cod_punto_venta: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="P001"
                  />
                </div>
              </div>
            </>
          ) : activeTab === 'cert' ? (
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

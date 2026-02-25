import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { LogOut, Building2, Lock } from 'lucide-react';
import { ChangeOwnPasswordModal } from '../common/ChangeOwnPasswordModal';
import { companyPreferences } from '../../lib/api';

export function Header() {
  const { user, signOut } = useAuth();
  const { companies, selectedCompany, selectCompany } = useCompany();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [companyLogoPng, setCompanyLogoPng] = useState<string>('');

  useEffect(() => {
    const loadLogo = async () => {
      if (!selectedCompany) {
        setCompanyLogoPng('');
        return;
      }

      try {
        const pref = await companyPreferences.get();
        setCompanyLogoPng(pref.company_logo_png || '');
      } catch (error) {
        console.error('Error loading company logo:', error);
        setCompanyLogoPng('');
      }
    };

    loadLogo();
  }, [selectedCompany?.id]);

  return (
    <header className="border-b border-slate-200 shadow-sm" style={{ backgroundColor: 'var(--ui-header-bg)' }}>
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4">
            {companyLogoPng ? (
              <img src={companyLogoPng} alt="Logo compañía" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
            ) : (
              <div className="bg-slate-800 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-800">Sistema Contable</h1>
              <p className="text-xs text-slate-600">El Salvador</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {/* Show user info */}
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              {user?.is_super_admin && (
                <p className="text-xs text-purple-600 font-semibold">Super Admin</p>
              )}
            </div>

            {/* Only show company selector if NOT super admin */}
            {!user?.is_super_admin && companies.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Empresa:</label>
                <select
                  value={selectedCompany?.id ? String(selectedCompany.id) : ''}
                  onChange={(e) => selectCompany(Number(e.target.value))}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={String(company.id)}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Cambiar mi contraseña"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Contraseña</span>
            </button>

            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Salir</span>
            </button>
          </div>
        </div>
      </div>
      
      {showPasswordModal && (
        <ChangeOwnPasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider, useCompany } from './contexts/CompanyContext';
import { LoginForm } from './components/auth/LoginForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/modules/Dashboard';
import { SuperAdminDashboard } from './components/modules/SuperAdminDashboard';
import { CompanyManagement } from './components/modules/CompanyManagement';
import { CatalogConfiguration } from './components/modules/CatalogConfiguration';
import { ChartOfAccounts } from './components/modules/ChartOfAccounts';
import { JournalEntries } from './components/modules/JournalEntries';
import { PeriodClosing } from './components/modules/PeriodClosing';
import { Reports } from './components/modules/Reports';
import { AccountsReceivable } from './components/modules/AccountsReceivable';
import { AccountsPayable } from './components/modules/AccountsPayable';
import { FixedAssets } from './components/modules/FixedAssets';
import { Inventory } from './components/modules/Inventory';
import { Customers } from './components/modules/Customers';
import { Suppliers } from './components/modules/Suppliers';
import { Settings } from './components/modules/Settings';
import { AccountTypesManagement } from './components/modules/AccountTypesManagement';
import { Treasury } from './components/modules/Treasury';
import { ModuleManagement } from './components/modules/ModuleManagement';
import { Purchases } from './components/modules/Purchases';
import { Sales } from './components/modules/Sales';
import JournalEntryTypes from './components/modules/JournalEntryTypes';
import CompanyUsers from './components/modules/CompanyUsers';
import { AuditLogs } from './components/modules/AuditLogs';
import { companyPreferences } from './lib/api';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: companyLoading, selectedCompany } = useCompany();
  const [activeModule, setActiveModule] = useState<string>('');

  // Set initial module based on user role and reset on logout
  useEffect(() => {
    if (user) {
      // If no module is active, OR if user is on super-admin but isn't one, redirect
      if (!activeModule || (activeModule === 'super-admin' && !user.is_super_admin)) {
        const initialModule = user.is_super_admin ? 'super-admin' : 'dashboard';
        setActiveModule(initialModule);
      }
    } else {
      // Reset module when user logs out
      setActiveModule('');
    }
  }, [user]);

  useEffect(() => {
    const applyTheme = async () => {
      const root = document.documentElement;

      const setDefaults = () => {
        root.style.setProperty('--ui-accent-color', '#1e293b');
        root.style.setProperty('--ui-header-bg', '#ffffff');
        root.style.setProperty('--ui-sidebar-bg', '#1e293b');
        root.style.setProperty('--ui-app-bg', '#f1f5f9');
        root.style.setProperty('--ui-font-family', 'Inter, system-ui, -apple-system, Segoe UI, sans-serif');
      };

      if (!selectedCompany) {
        setDefaults();
        return;
      }

      try {
        const preferences = await companyPreferences.get();
        root.style.setProperty('--ui-accent-color', preferences.ui_accent_color || '#1e293b');
        root.style.setProperty('--ui-header-bg', preferences.ui_header_color || '#ffffff');
        root.style.setProperty('--ui-sidebar-bg', preferences.ui_sidebar_color || '#1e293b');
        root.style.setProperty('--ui-app-bg', preferences.ui_background_color || '#f1f5f9');

        const fontMap: Record<string, string> = {
          inter: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif',
          system: 'system-ui, -apple-system, Segoe UI, sans-serif',
          roboto: 'Roboto, Arial, sans-serif',
          'open-sans': '"Open Sans", Arial, sans-serif',
          lato: 'Lato, Arial, sans-serif',
        };

        root.style.setProperty('--ui-font-family', fontMap[preferences.ui_font_family || 'inter'] || fontMap.inter);
      } catch (error) {
        console.error('Error applying company theme:', error);
        setDefaults();
      }
    };

    applyTheme();
  }, [selectedCompany?.id]);

  if (authLoading || companyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  // Wait for initial module to be set
  if (!activeModule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  const renderModule = () => {
    // Super Admin Module
    if (activeModule === 'super-admin') {
      return <SuperAdminDashboard />;
    }

    // Regular modules
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'companies':
        return <CompanyManagement />;
      case 'catalog-config':
        return <CatalogConfiguration />;
      case 'catalog':
        return <ChartOfAccounts />;
      case 'journal':
        return <JournalEntries />;
      case 'periods':
        return <PeriodClosing />;
      case 'reports':
        return <Reports />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'receivables':
        return <AccountsReceivable />;
      case 'payables':
        return <AccountsPayable />;
      case 'fixed-assets':
        return <FixedAssets />;
      case 'inventory':
        return <Inventory />;
      case 'customers':
        return <Customers />;
      case 'suppliers':
        return <Suppliers />;
      case 'treasury':
        return <Treasury />;
      case 'account-types':
        return <AccountTypesManagement />;
      case 'company-users':
        return <CompanyUsers />;
      case 'journal-types':
        return <JournalEntryTypes />;
      case 'modules':
        return <ModuleManagement />;
      case 'settings':
        return <Settings />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--ui-app-bg)' }}>
      <Header />
      <div className="flex">
        <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
        <main className="flex-1">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <AppContent />
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;

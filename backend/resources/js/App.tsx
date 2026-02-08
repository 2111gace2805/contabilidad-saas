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

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { loading: companyLoading } = useCompany();
  const [activeModule, setActiveModule] = useState<string>('');

  // Set initial module based on user role
  useEffect(() => {
    if (user && !activeModule) {
      const initialModule = user.is_super_admin ? 'super-admin' : 'dashboard';
      setActiveModule(initialModule);
    }
  }, [user]);

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
      case 'modules':
        return <ModuleManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
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

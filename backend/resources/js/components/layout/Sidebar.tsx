import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Building,
  Receipt,
  CreditCard,
  Package,
  Landmark,
  BarChart3,
  Settings,
  Building2,
  Tag,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Pin,
  PinOff,
  Wallet,
  Shield,
  Sliders,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  section?: string;
  requiredRole?: 'super_admin' | 'admin' | 'accountant' | 'viewer';
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const { user } = useAuth();
  const { selectedCompany } = useCompany();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('sidebarPinned');
    return saved !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('sidebarPinned', String(isPinned));
  }, [isPinned]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const togglePin = () => setIsPinned(!isPinned);

  // Define menu structure based on user role
  const getMenuSections = () => {
    if (user?.is_super_admin) {
      // SUPER ADMIN - Solo gestión de empresas y usuarios
      return [
        {
          title: 'Super Admin',
          items: [
            { id: 'super-admin', label: 'Gestión del Sistema', icon: Shield },
          ]
        }
      ];
    }

    // Get user role in current company
    const userRole = selectedCompany?.pivot?.role || 'viewer';

    // ADMIN & ACCOUNTANT & VIEWER
    const sections = [
      {
        title: 'General',
        items: [
          { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
        ]
      },
      {
        title: 'Contabilidad',
        items: [
          { id: 'catalog', label: 'Catálogo Contable', icon: BookOpen },
          { id: 'journal', label: 'Pólizas/Asientos', icon: FileText },
          { id: 'reports', label: 'Reportes', icon: BarChart3 },
        ]
      },
      {
        title: 'Operaciones',
        items: [
          { id: 'sales', label: 'Ventas / Facturación', icon: FileText },
          { id: 'purchases', label: 'Compras', icon: ShoppingCart },
          { id: 'receivables', label: 'Cuentas por Cobrar', icon: Receipt },
          { id: 'payables', label: 'Cuentas por Pagar', icon: CreditCard },
          { id: 'treasury', label: 'Tesorería', icon: Wallet },
          { id: 'fixed-assets', label: 'Activo Fijo', icon: Landmark },
          { id: 'inventory', label: 'Inventario', icon: Package },
          { id: 'customers', label: 'Clientes', icon: Users },
          { id: 'suppliers', label: 'Proveedores', icon: Building },
        ]
      },
    ];

    // Only ADMIN can see configuration
    if (userRole === 'admin') {
      sections.push({
        title: 'Administración',
        items: [
          { id: 'account-types', label: 'Tipos de Cuenta', icon: Tag },
          { id: 'catalog-config', label: 'Config. Catálogo', icon: Sliders },
          { id: 'periods', label: 'Períodos Contables', icon: CalendarClock },
        ]
      });

      sections.push({
        title: 'Sistema',
        items: [
          { id: 'settings', label: 'Configuración', icon: Settings },
        ]
      });
    }

    return sections;
  };

  const menuSections = getMenuSections();

  return (
    <aside
      className={`bg-slate-800 text-white min-h-screen transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && (
          <button
            onClick={togglePin}
            className="text-slate-400 hover:text-white transition-colors"
            title={isPinned ? 'Desfijar menú' : 'Fijar menú'}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
        )}
        <button
          onClick={toggleCollapse}
          className={`text-slate-400 hover:text-white transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="p-4 space-y-4 overflow-y-auto">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title}>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onModuleChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {sectionIndex < menuSections.length - 1 && !isCollapsed && (
              <div className="my-4 border-t border-slate-700"></div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

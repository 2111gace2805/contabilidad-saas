import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { DocumentTypes } from './DocumentTypes';
import { PaymentMethods } from './PaymentMethods';
import { TaxConfiguration } from './TaxConfiguration';
import { Warehouses } from './Warehouses';
import { Branches } from './Branches';
import { UnitsOfMeasure } from './UnitsOfMeasure';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'documents' | 'payments' | 'taxes' | 'warehouses' | 'branches' | 'units'>('documents');

  const tabs = [
    { id: 'documents' as const, label: 'Tipos de Documento', component: DocumentTypes },
    { id: 'payments' as const, label: 'Formas de Pago', component: PaymentMethods },
    { id: 'taxes' as const, label: 'Configuración de Impuestos', component: TaxConfiguration },
    { id: 'warehouses' as const, label: 'Bodegas', component: Warehouses },
    { id: 'branches' as const, label: 'Sucursales', component: Branches },
    { id: 'units' as const, label: 'Unidades de Medida', component: UnitsOfMeasure },
  ];

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || DocumentTypes;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Configuración
        </h2>
        <p className="text-slate-600">Configuraciones generales del sistema</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 p-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>

    </div>
  );
}

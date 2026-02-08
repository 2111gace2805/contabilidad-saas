import { AlertCircle } from 'lucide-react';

interface Props {
  moduleName: string;
  description?: string;
}

export function ModuleNotAvailable({ moduleName, description }: Props) {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {moduleName}
          </h3>
          <p className="text-slate-600 mb-4">
            {description || 'Este módulo está en desarrollo y estará disponible próximamente.'}
          </p>
          <p className="text-sm text-slate-500">
            Actualmente el sistema está migrando de Supabase a Laravel API.<br />
            Los módulos principales ya están funcionando.
          </p>
        </div>
      </div>
    </div>
  );
}

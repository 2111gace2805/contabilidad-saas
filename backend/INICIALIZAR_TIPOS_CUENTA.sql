-- Script para inicializar tipos de cuenta en una empresa
-- Reemplaza 'YOUR_COMPANY_ID' con el UUID de tu empresa
-- Ejecuta esto en el SQL Editor de Supabase después de crear la empresa

-- Paso 1: Obtén el ID de tu empresa
SELECT id, name FROM companies;

-- Paso 2: Copiar el ID de tu empresa y pegarlo abajo en WHERE company_id = 'TU_COMPANY_ID'

-- Paso 3: Ejecutar este script completo

INSERT INTO public.account_types (company_id, code, name, nature, affects_balance, affects_results, sort_order)
VALUES
  ('TU_COMPANY_ID', 'ACTIVO', 'Activo', 'deudora', true, false, 1),
  ('TU_COMPANY_ID', 'PASIVO', 'Pasivo', 'acreedora', true, false, 2),
  ('TU_COMPANY_ID', 'CAPITAL', 'Capital', 'acreedora', true, false, 3),
  ('TU_COMPANY_ID', 'INGRESOS', 'Ingresos', 'acreedora', false, true, 4),
  ('TU_COMPANY_ID', 'EGRESOS', 'Egresos', 'deudora', false, true, 5),
  ('TU_COMPANY_ID', 'COSTOS', 'Costos', 'deudora', false, true, 6)
ON CONFLICT (company_id, code) DO NOTHING;

-- Verifica que se insertaron correctamente
SELECT * FROM account_types WHERE company_id = 'TU_COMPANY_ID';

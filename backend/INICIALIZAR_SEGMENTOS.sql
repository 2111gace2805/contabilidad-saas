-- Script para inicializar segmentos contables básicos en una empresa
-- Reemplaza 'TU_COMPANY_ID' con el UUID de tu empresa
-- Ejecuta esto en el SQL Editor de Supabase después de crear la empresa

-- Paso 1: Obtén el ID de tu empresa
SELECT id, name FROM companies;

-- Paso 2: Copiar el ID de tu empresa y pegarlo abajo en WHERE company_id = 'TU_COMPANY_ID'

-- Paso 3: Ejecutar este script completo

INSERT INTO public.accounting_segments (company_id, code, name, description, parent_segment_id, level, digit_length, sequence, active)
VALUES
  -- Nivel 1: Clasificación General (1 dígito)
  ('TU_COMPANY_ID', '1', 'Clasificación General', 'Primer nivel del catálogo de cuentas', NULL, 1, 1, 1, true),

  -- Nivel 2: Rubros de Agrupación (2 dígitos)
  ('TU_COMPANY_ID', '2', 'Rubros de Agrupación', 'Segundo nivel del catálogo de cuentas', NULL, 2, 2, 2, true),

  -- Nivel 3: Mayor (2 dígitos)
  ('TU_COMPANY_ID', '3', 'Mayor', 'Tercer nivel del catálogo de cuentas', NULL, 3, 2, 3, true),

  -- Nivel 4: Sub Cuenta (6 dígitos)
  ('TU_COMPANY_ID', '4', 'Sub Cuenta', 'Cuarto nivel del catálogo de cuentas', NULL, 4, 6, 4, true),

  -- Nivel 5: Cuentas de Detalle (8 dígitos)
  ('TU_COMPANY_ID', '5', 'Cuentas de Detalle', 'Quinto nivel del catálogo de cuentas', NULL, 5, 8, 5, true),

  -- Nivel 6: Cuenta Analítica (10 dígitos)
  ('TU_COMPANY_ID', '6', 'Cuenta Analítica', 'Sexto nivel del catálogo de cuentas', NULL, 6, 10, 6, true)
ON CONFLICT (company_id, code) DO NOTHING;

-- Verifica que se insertaron correctamente
SELECT * FROM accounting_segments WHERE company_id = 'TU_COMPANY_ID' ORDER BY level;

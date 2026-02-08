#!/bin/bash

echo "=========================================="
echo "🔍 Verificación de Correcciones Aplicadas"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: Este script debe ejecutarse desde el directorio 'backend'${NC}"
    exit 1
fi

echo "1️⃣  Verificando archivos modificados..."
echo ""

# Check routes/api.php
if grep -q "App\\Http\\Controllers\\Api\\V1" routes/api.php; then
    echo -e "${RED}❌ routes/api.php - Todavía contiene namespaces V1${NC}"
else
    echo -e "${GREEN}✅ routes/api.php - Namespaces corregidos${NC}"
fi

# Check bootstrap/app.php
if grep -q "company.context" bootstrap/app.php; then
    echo -e "${GREEN}✅ bootstrap/app.php - Middleware registrado${NC}"
else
    echo -e "${RED}❌ bootstrap/app.php - Middleware NO registrado${NC}"
fi

# Check api.ts
if grep -q "/auth/login" resources/js/lib/api.ts; then
    echo -e "${GREEN}✅ api.ts - Rutas de autenticación actualizadas${NC}"
else
    echo -e "${RED}❌ api.ts - Rutas de autenticación NO actualizadas${NC}"
fi

echo ""
echo "2️⃣  Verificando configuración de Laravel..."
echo ""

# Clear caches
echo "Limpiando cachés..."
php artisan config:clear > /dev/null 2>&1
php artisan cache:clear > /dev/null 2>&1
php artisan route:clear > /dev/null 2>&1
echo -e "${GREEN}✅ Cachés limpiados${NC}"

echo ""
echo "3️⃣  Verificando rutas registradas..."
echo ""

# Check if routes are registered
ROUTE_COUNT=$(php artisan route:list --json 2>/dev/null | grep -c "api/")
if [ "$ROUTE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $ROUTE_COUNT rutas API registradas${NC}"
else
    echo -e "${RED}❌ No se encontraron rutas API${NC}"
fi

# Check specific important routes
echo ""
echo "Verificando rutas críticas:"

php artisan route:list --json 2>/dev/null | grep -q "api/auth/login" && \
    echo -e "${GREEN}  ✅ POST /api/auth/login${NC}" || \
    echo -e "${RED}  ❌ POST /api/auth/login NO ENCONTRADA${NC}"

php artisan route:list --json 2>/dev/null | grep -q "api/companies" && \
    echo -e "${GREEN}  ✅ GET /api/companies${NC}" || \
    echo -e "${RED}  ❌ GET /api/companies NO ENCONTRADA${NC}"

php artisan route:list --json 2>/dev/null | grep -q "api/accounts" && \
    echo -e "${GREEN}  ✅ GET /api/accounts${NC}" || \
    echo -e "${RED}  ❌ GET /api/accounts NO ENCONTRADA${NC}"

php artisan route:list --json 2>/dev/null | grep -q "api/journal-entries" && \
    echo -e "${GREEN}  ✅ GET /api/journal-entries${NC}" || \
    echo -e "${RED}  ❌ GET /api/journal-entries NO ENCONTRADA${NC}"

echo ""
echo "4️⃣  Verificando dependencias..."
echo ""

# Check if vendor exists
if [ -d "vendor" ]; then
    echo -e "${GREEN}✅ Dependencias de Composer instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Ejecuta: composer install${NC}"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencias de NPM instaladas${NC}"
else
    echo -e "${YELLOW}⚠️  Ejecuta: npm install${NC}"
fi

echo ""
echo "5️⃣  Verificando base de datos..."
echo ""

# Check .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
    
    # Check if database is configured
    if grep -q "DB_DATABASE=\w" .env 2>/dev/null; then
        DB_NAME=$(grep "DB_DATABASE=" .env | cut -d '=' -f2)
        echo -e "${GREEN}✅ Base de datos configurada: $DB_NAME${NC}"
    else
        echo -e "${YELLOW}⚠️  Base de datos no configurada en .env${NC}"
    fi
else
    echo -e "${RED}❌ Archivo .env NO existe${NC}"
    echo -e "${YELLOW}   Ejecuta: cp .env.example .env && php artisan key:generate${NC}"
fi

# Try to connect to database
php artisan migrate:status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Conexión a base de datos exitosa${NC}"
    
    # Count migrations
    MIGRATION_COUNT=$(php artisan migrate:status 2>/dev/null | grep -c "Ran")
    echo -e "${GREEN}   $MIGRATION_COUNT migraciones ejecutadas${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo conectar a la base de datos${NC}"
    echo -e "${YELLOW}   Ejecuta: php artisan migrate --seed${NC}"
fi

echo ""
echo "=========================================="
echo "📋 Resumen"
echo "=========================================="
echo ""
echo "Para iniciar el sistema:"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  php artisan serve"
echo ""
echo -e "${YELLOW}Terminal 2 (Frontend):${NC}"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Acceder:${NC}"
echo "  URL: http://localhost:5173"
echo "  Email: admin@example.com"
echo "  Password: password"
echo ""
echo "=========================================="
echo ""

# Final check
ERRORS=0
grep -q "App\\Http\\Controllers\\Api\\V1" routes/api.php && ERRORS=$((ERRORS+1))
grep -q "company.context" bootstrap/app.php || ERRORS=$((ERRORS+1))
grep -q "/auth/login" resources/js/lib/api.ts || ERRORS=$((ERRORS+1))

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todas las correcciones aplicadas correctamente${NC}"
    exit 0
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores${NC}"
    echo -e "${YELLOW}   Revisa el archivo FIXES_APPLIED.md para más detalles${NC}"
    exit 1
fi

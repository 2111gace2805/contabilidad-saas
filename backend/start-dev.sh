#!/bin/bash

echo "🚀 Iniciando Sistema de Contabilidad..."
echo ""

# Check if we're in the backend directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio 'backend'"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 node_modules no encontrado. Instalando dependencias..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias npm"
        exit 1
    fi
fi

# Check if vendor exists
if [ ! -d "vendor" ]; then
    echo "📦 vendor no encontrado. Instalando dependencias de Composer..."
    composer install
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias de Composer"
        exit 1
    fi
fi

# Clear caches
echo "🧹 Limpiando cachés..."
php artisan config:clear > /dev/null 2>&1
php artisan cache:clear > /dev/null 2>&1
php artisan route:clear > /dev/null 2>&1

echo ""
echo "✅ Todo listo. Iniciando servidores..."
echo ""
echo "================================================"
echo "📌 IMPORTANTE: Se abrirán 2 procesos"
echo "================================================"
echo ""
echo "1️⃣  Laravel Backend: http://localhost:8000"
echo "2️⃣  Vite Dev Server: http://localhost:5173"
echo ""
echo "⚠️  Accede a la app en: http://localhost:8000"
echo "⚠️  NO uses el puerto 5173 directamente"
echo ""
echo "Para detener: Presiona Ctrl+C"
echo ""
echo "================================================"
echo ""

# Start Laravel in background
echo "Iniciando Laravel..."
php artisan serve > /tmp/laravel.log 2>&1 &
LARAVEL_PID=$!
echo "✅ Laravel corriendo (PID: $LARAVEL_PID)"

# Wait a moment
sleep 2

# Start Vite in foreground
echo "Iniciando Vite..."
echo ""
npm run dev

# If npm run dev exits, kill Laravel
kill $LARAVEL_PID 2>/dev/null
echo ""
echo "👋 Servidores detenidos"

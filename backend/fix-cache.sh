#!/bin/bash

echo "🧹 Limpiando cachés del sistema..."
echo ""

# Backend Laravel
echo "1️⃣  Limpiando cachés de Laravel..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
echo "✅ Cachés de Laravel limpiados"
echo ""

# Frontend Vite
echo "2️⃣  Limpiando cachés de Vite..."
rm -rf node_modules/.vite
rm -rf public/build
echo "✅ Cachés de Vite limpiados"
echo ""

echo "✅ ¡Listo! Ahora reinicia los servidores:"
echo ""
echo "Terminal 1:"
echo "  php artisan serve"
echo ""
echo "Terminal 2:"
echo "  npm run dev"
echo ""
echo "Luego recarga el navegador con Ctrl+Shift+R (hard reload)"

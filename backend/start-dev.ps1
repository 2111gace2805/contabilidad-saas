# PowerShell script para iniciar el sistema en Windows

Write-Host "🚀 Iniciando Sistema de Contabilidad..." -ForegroundColor Green
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde el directorio 'backend'" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias npm" -ForegroundColor Red
        exit 1
    }
}

# Check if vendor exists
if (-not (Test-Path "vendor")) {
    Write-Host "📦 vendor no encontrado. Instalando dependencias de Composer..." -ForegroundColor Yellow
    composer install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error instalando dependencias de Composer" -ForegroundColor Red
        exit 1
    }
}

# Clear caches
Write-Host "🧹 Limpiando cachés..." -ForegroundColor Cyan
php artisan config:clear | Out-Null
php artisan cache:clear | Out-Null
php artisan route:clear | Out-Null

Write-Host ""
Write-Host "✅ Todo listo. Iniciando servidores..." -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📌 Se abrirán 2 ventanas de terminal" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Laravel Backend: http://localhost:8000"
Write-Host "2️⃣  Vite Dev Server: http://localhost:5173"
Write-Host ""
Write-Host "⚠️  Accede a la app en: http://localhost:8000" -ForegroundColor Yellow
Write-Host "⚠️  NO uses el puerto 5173 directamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para detener: Cierra las ventanas o presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Start Laravel in new window
Write-Host "Iniciando Laravel..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '🚀 Laravel Backend Server' -ForegroundColor Green; php artisan serve"

# Wait a moment
Start-Sleep -Seconds 2

# Start Vite in new window
Write-Host "Iniciando Vite..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host '⚡ Vite Dev Server' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Servidores iniciados en ventanas separadas" -ForegroundColor Green
Write-Host ""
Write-Host "Abre tu navegador en: http://localhost:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Credenciales de login:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com"
Write-Host "  Password: password"
Write-Host ""

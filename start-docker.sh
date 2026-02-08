#!/bin/bash

echo "🐳 Iniciando Sistema Contable con Docker..."
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker no está instalado"
        exit 1
    fi
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Stop existing containers
echo "🛑 Deteniendo contenedores existentes..."
$DOCKER_COMPOSE down

# Start all services
echo ""
echo "🚀 Iniciando todos los servicios..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Esperando a que los servicios estén listos..."
echo "   - MySQL iniciando..."
sleep 10
echo "   - Backend iniciando..."
sleep 3
echo "   - Frontend (Vite) iniciando..."
sleep 5

echo ""
echo "✅ Sistema iniciado correctamente!"
echo ""
echo "================================================"
echo "📌 Servicios disponibles:"
echo "================================================"
echo ""
echo "🌐 Aplicación:  http://localhost:8000"
echo "🗄️  MySQL:       localhost:3306"
echo "⚡ Vite:        http://localhost:5173 (interno)"
echo ""
echo "📝 Credenciales de login:"
echo "   Email:    admin@example.com"
echo "   Password: password"
echo ""
echo "================================================"
echo ""
echo "🔍 Ver logs en tiempo real:"
echo "   docker-compose logs -f"
echo "   docker-compose logs -f frontend  # Solo Vite"
echo "   docker-compose logs -f backend   # Solo Laravel"
echo ""
echo "🛑 Detener todo:"
echo "   docker-compose down"
echo ""
echo "🔄 Reiniciar un servicio:"
echo "   docker-compose restart frontend"
echo ""
echo "================================================"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   Si es la primera vez, ejecuta:"
echo "   docker-compose exec backend php artisan migrate:fresh --seed"
echo ""
echo "================================================"
echo ""

# Ask if user wants to see logs
read -p "¿Deseas ver los logs ahora? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    echo ""
    echo "📋 Mostrando logs (Ctrl+C para salir)..."
    echo ""
    $DOCKER_COMPOSE logs -f
fi

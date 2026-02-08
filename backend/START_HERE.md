# 🚀 CÓMO INICIAR EL SISTEMA

## ⚡ Inicio Rápido (Copiar y pegar)

### **Opción 1: Linux/Mac/WSL**

Abre una terminal y ejecuta:

```bash
cd /home/boris/projects/contabilidad-saas/backend

# Primera vez (instalar dependencias)
npm install

# Iniciar sistema (script automático)
chmod +x start-dev.sh
./start-dev.sh
```

### **Opción 2: Manual (2 Terminales)**

#### Terminal 1 - Backend Laravel
```bash
cd /home/boris/projects/contabilidad-saas/backend
php artisan serve
```
✅ Debe decir: `Server running on [http://127.0.0.1:8000]`

#### Terminal 2 - Frontend Vite
```bash
cd /home/boris/projects/contabilidad-saas/backend
npm run dev
```
✅ Debe decir: `Local: http://localhost:5173/`

### **Opción 3: Windows PowerShell**

```powershell
cd C:\...\contabilidad-saas\backend

# Primera vez
npm install

# Terminal 1
php artisan serve

# Terminal 2 (nueva ventana)
npm run dev
```

---

## 🌐 Acceder a la Aplicación

Una vez que ambos servidores estén corriendo:

1. Abre tu navegador
2. Ve a: **http://localhost:8000**
3. Login con:
   - **Email:** `admin@example.com`
   - **Password:** `password`

---

## ⚠️ IMPORTANTE

- ✅ Usa **http://localhost:8000** (Laravel)
- ❌ NO uses **http://localhost:5173** (Vite)
- 💡 Ambos servidores DEBEN estar corriendo
- 🔄 Si cambias código, Vite recarga automáticamente

---

## 🔧 Solución de Problemas

### Error: "Vite manifest not found"
**Causa:** Vite no está corriendo  
**Solución:** Ejecuta `npm run dev` en una terminal separada

### Error: "npm: command not found"
**Causa:** Node.js no está instalado  
**Solución:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

### Error: "EADDRINUSE: address already in use"
**Causa:** El puerto ya está en uso  
**Solución:**
```bash
# Matar procesos en puerto 8000
lsof -ti:8000 | xargs kill -9

# Matar procesos en puerto 5173
lsof -ti:5173 | xargs kill -9
```

### Error: "Class 'XXX' not found"
**Causa:** Cachés desactualizados  
**Solución:**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
composer dump-autoload
```

### Error al instalar dependencias npm
**Solución:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📋 Checklist de Inicio

Antes de iniciar, verifica:

- [ ] Node.js instalado (`node --version`)
- [ ] NPM instalado (`npm --version`)
- [ ] PHP instalado (`php --version`)
- [ ] Composer instalado (`composer --version`)
- [ ] MySQL corriendo y base de datos creada
- [ ] Archivo `.env` configurado
- [ ] Migraciones ejecutadas (`php artisan migrate`)
- [ ] Dependencias instaladas:
  - [ ] `vendor/` existe (Composer)
  - [ ] `node_modules/` existe (NPM)

---

## 🎯 Primera Vez (Setup Inicial)

Si es la primera vez que inicias el proyecto:

```bash
cd backend

# 1. Copiar .env
cp .env.example .env

# 2. Generar key
php artisan key:generate

# 3. Editar .env (configurar base de datos)
nano .env  # o vim, o el editor que prefieras

# 4. Instalar dependencias
composer install
npm install

# 5. Crear base de datos (en MySQL)
mysql -u root -p
CREATE DATABASE contabilidad;
exit

# 6. Migrar y poblar datos
php artisan migrate:fresh --seed

# 7. Iniciar servidores
# Terminal 1:
php artisan serve

# Terminal 2:
npm run dev
```

---

## 📊 Puertos Utilizados

| Servicio | Puerto | URL |
|----------|--------|-----|
| Laravel (Backend) | 8000 | http://localhost:8000 |
| Vite (Dev Server) | 5173 | http://localhost:5173 (interno) |
| MySQL | 3306 | localhost:3306 |

---

## 🚪 Detener los Servidores

En cada terminal donde están corriendo, presiona:
```
Ctrl + C
```

---

## 📚 Más Ayuda

- `README.md` - Información general
- `QUICK_START.md` - Guía de inicio rápido
- `FIX_LOGIN_ERROR.md` - Solución a error 405
- `FIXES_APPLIED.md` - Correcciones técnicas

---

## ✅ Estado Actual del Sistema

Después de las correcciones aplicadas:

✅ Namespaces corregidos  
✅ Middleware registrado  
✅ Rutas de API funcionales  
✅ Frontend configurado correctamente  
✅ Listo para usar

---

**¿Problemas?** Ejecuta el script de diagnóstico:
```bash
./verify-fixes.sh
```

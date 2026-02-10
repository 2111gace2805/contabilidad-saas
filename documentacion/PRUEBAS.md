# Contexto de Pruebas

## 🎯 Propósito
Este documento describe el contexto de pruebas del proyecto y dónde están ubicadas las pruebas (unitarias, de feature e2e), cómo ejecutarlas en el entorno Docker actual y las convenciones a seguir al agregar nuevas pruebas.

---

## 🧩 Estrategia de pruebas
- Unit tests: pruebas rápidas, aisladas en PHP para validar lógica de modelos, helpers, servicios.
- Feature tests: pruebas de integración en PHP (Laravel) que ejercitan endpoints y flujos con Base de Datos en memoria.
- E2E (pendiente): pruebas de interfaz (Playwright/Cypress) para los flujos críticos (login, selección de empresa, importación CSV).

---

## 📁 Ubicación de tests (nueva estructura)
- Backend PHP (PHPUnit): `/tests/backend`
  - Unit tests: `/tests/backend/Unit`
  - Feature tests: `/tests/backend/Feature`
- Frontend (E2E / unit): `/tests/frontend` (directorio reservado para futuras pruebas)

> Nota: Anteriormente las pruebas del backend estaban en `backend/tests`. Se han movido a `/tests/backend` para centralizar y facilitar la adición de tests frontend y E2E.

---

## 🛠️ Cómo ejecutar las pruebas (Docker)
Desde el directorio raíz del proyecto, con Docker Compose en ejecución:

### Backend (PHPUnit)
- Ejecutar todas las pruebas:
```bash
docker-compose exec backend vendor/bin/phpunit
```
- Ejecutar solo Feature tests:
```bash
docker-compose exec backend vendor/bin/phpunit --testsuite Feature
```
- Ejecutar un único archivo de prueba:
```bash
docker-compose exec backend vendor/bin/phpunit tests/backend/Feature/AccountingSegmentTest.php --testdox
```
- Ejecutar una prueba concreta (por método):
```bash
docker-compose exec backend vendor/bin/phpunit --filter test_store_segment_success --testdox
```

> Nota: `backend/phpunit.xml` ha sido actualizado para apuntar a las nuevas ubicaciones `../tests/backend/Unit` y `../tests/backend/Feature`.

### Frontend (E2E) - (pendiente)
- La carpeta `/tests/frontend` está reservada para E2E (Cypress/Playwright). Cuando se incorpore, documentaremos cómo ejecutarlas dentro del contenedor `contabilidad_frontend`.

---

## 🔁 Pasos operativos al mover o agregar tests
1. Añadir/editar tests en `/tests/backend` o `/tests/frontend` según corresponda.
2. Regenerar el autoload de Composer (si se crean pruebas PHP nuevas con clases nuevas):
```bash
docker-compose exec backend composer dump-autoload -o
```
3. Ejecutar las pruebas con PHPUnit tal como se indica arriba.
4. Si se añaden E2E, documentar comandos y scripts en esta misma guía.

---

## ✅ Buenas prácticas
- Mantener tests deterministas (no dependientes de hora o red externa).
- Ejecutar tests localmente antes de abrir PRs.
- Añadir tests para cada bug o nueva funcionalidad crítica (especialmente flujos: importación CSV, asignación de usuarios, reglas RBAC).

---

## 📣 Cambios aplicados ahora
- Se movieron los tests de `backend/tests` → `/tests/backend`.
- Se actualizó `backend/phpunit.xml` para apuntar a `../tests/backend/...`.
- Se actualizó `composer` autoload ejecutando `composer dump-autoload -o` dentro del contenedor backend.
- Se añadió un test de ejemplo: `tests/backend/Feature/AccountingSegmentTest.php` (verifica creación y unicidad de segmentos).

---

Si quieres, puedo añadir una configuración inicial de E2E (Cypress o Playwright) en `/tests/frontend` y un job de GitHub Actions para ejecutar las pruebas en CI. ¿Qué prefieres? (Cypress o Playwright?)

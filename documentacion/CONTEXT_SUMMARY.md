# Contexto del Proyecto: Sistema Contable SaaS

## Infraestructura del Proyecto
El proyecto es un sistema contable SaaS que utiliza Laravel como backend y React con Vite como frontend. Está diseñado para ser multi-empresa y altamente personalizable, con soporte para catálogos contables flexibles, control de periodos fiscales, y flujos de trabajo contables avanzados.

### Estructura General
- **Backend:** Laravel 11
- **Frontend:** React + TypeScript + Vite
- **Base de Datos:** MySQL
- **Autenticación:** Laravel Sanctum
- **Contenedores:** Docker para desarrollo y despliegue

---

## Índice de Archivos Markdown
A continuación, se detalla la descripción general de cada archivo Markdown incluido en el proyecto:

### Archivos Generales
- **/Users/boris/projects/contabilidad-saas/DOCKER_ENV_SETUP.md:** Guía para configurar el archivo `.env` para usar Docker, incluyendo cambios necesarios para la base de datos.
- **/Users/boris/projects/contabilidad-saas/DOCKER_START.md:** Instrucciones para iniciar el entorno de desarrollo con Docker, desde la configuración inicial hasta el acceso a la aplicación.
- **/Users/boris/projects/contabilidad-saas/MIGRATION_COMPLETE.md:** Resumen de la migración completa de Supabase a Laravel API, detallando los módulos migrados y los endpoints implementados.
- **/Users/boris/projects/contabilidad-saas/MODULES_ACTIVATION_SUMMARY.md:** Resumen de los módulos activados, incluyendo detalles de backend y frontend para cada módulo.
- **/Users/boris/projects/contabilidad-saas/README_MAIN.md:** Descripción general del sistema contable multi-empresa, con instrucciones para iniciar el proyecto.
- **/Users/boris/projects/contabilidad-saas/SISTEMA_FUNCIONANDO.md:** Guía final para iniciar y acceder al sistema completamente funcional.
- **/Users/boris/projects/contabilidad-saas/TAX_CONFIGURATION_SUMMARY.md:** Resumen de la implementación del módulo de configuración de impuestos, incluyendo migraciones y controladores.
- **/Users/boris/projects/contabilidad-saas/documentacion/PRODUCTO.md:** Resumen del producto, destacando el objetivo del sistema, el stack tecnológico y las características principales implementadas.
- **/Users/boris/projects/contabilidad-saas/documentacion/PRUEBAS.md:** Contexto de pruebas del proyecto, incluyendo estrategias, ubicación de tests y cómo ejecutarlos en el entorno Docker.
- **/Users/boris/projects/contabilidad-saas/documentacion/GUIA_DISENO_ESTILOS.md:** Guía de diseño y estilos del sistema, detallando colores, tipografía, componentes UI base (botones, tarjetas, modales) y principios de diseño utilizando Tailwind CSS. Referencia obligatoria para mantener la consistencia visual.

### Archivos del Backend
- **/Users/boris/projects/contabilidad-saas/backend/ANULACION_POLIZAS.md:** Documenta la solución para manejar anulaciones de pólizas contables, incluyendo cambios en la base de datos y migraciones.
- **/Users/boris/projects/contabilidad-saas/backend/API_DOCUMENTATION.md:** Documentación completa de la API REST, con detalles de autenticación y ejemplos de uso para cada endpoint.
- **/Users/boris/projects/contabilidad-saas/backend/API_IMPLEMENTATION_SUMMARY.md:** Resumen de la implementación de la API REST, incluyendo los controladores y endpoints principales.
- **/Users/boris/projects/contabilidad-saas/backend/ASOCIACION_CUENTAS_SEGMENTOS.md:** Explica cómo se asocian las cuentas contables con los segmentos, detallando el modelo de relación y la configuración estándar.
- **/Users/boris/projects/contabilidad-saas/backend/CATALOGO_FLEXIBLE.md:** Guía para configurar un catálogo contable flexible, con soporte para múltiples niveles y personalización por empresa.
- **/Users/boris/projects/contabilidad-saas/backend/COMPLETION_REPORT.md:** Informe de finalización del backend, destacando los objetivos logrados y los componentes técnicos implementados.
- **/Users/boris/projects/contabilidad-saas/backend/CONFIGURACION_COMPLETA.md:** Guía paso a paso para configurar el entorno Laravel + React, desde la instalación de dependencias hasta la configuración de `.env`.
- **/Users/boris/projects/contabilidad-saas/backend/CONFIGURACION_EMPRESA.md:** Documenta el módulo de configuración de empresas, incluyendo campos personalizados y tablas relacionadas.
- **/Users/boris/projects/contabilidad-saas/backend/CONTROL_PERIODOS_FISCALES.md:** Detalla el sistema de control de periodos fiscales, con validaciones automáticas y restricciones a nivel de base de datos.
- **/Users/boris/projects/contabilidad-saas/backend/ESTRUCTURA_MENU.md:** Describe la estructura reorganizada del menú lateral, dividida en secciones lógicas para mejorar la navegación.
- **/Users/boris/projects/contabilidad-saas/backend/FIX_LOGIN_ERROR.md:** Solución para el error de login "405 Method Not Allowed", incluyendo pasos para limpiar cachés y reiniciar servidores.
- **/Users/boris/projects/contabilidad-saas/backend/FLUJO_POLIZAS.md:** Explica el flujo de trabajo de las pólizas contables, desde el estado de borrador hasta la anulación. (Actualizado: la pantalla **Nueva Póliza** ahora permite agregar líneas de detalle (débito/crédito), editar el correlativo por línea, guardar borradores incluso descuadrados, validar cuadratura antes de contabilizar y autocompletar cuentas mientras se digita.)
- **/Users/boris/projects/contabilidad-saas/backend/GUIA_USO.md:** Guía de uso para el sistema contable multi-empresa, desde el registro de usuarios hasta la creación de empresas.

---
## Módulo de Facturación

Las facturas generan automáticamente pólizas contables.

No deben registrarse manualmente las pólizas de venta.

El estado POSTED es inmutable.

La generación del correlativo debe usar lockForUpdate().

Nunca usar MAX() para generar correlativos.

No mezclar company_id.

El módulo de facturación genera automáticamente pólizas contables y maneja correlativos independientes por empresa.



## Uso Futuro
Este archivo sirve como un índice principal para entender rápidamente la infraestructura y documentación del proyecto. Puede ser utilizado como referencia para nuevos desarrolladores o para mantener la consistencia en futuras actualizaciones.
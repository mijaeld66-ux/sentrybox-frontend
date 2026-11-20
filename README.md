# SentryBox · Frontend EC2

Aplicación individual de Mijael Mathias Díaz Avilés para Desarrollo Front-End. Reutiliza la necesidad de organización financiera de SentryBox (proyecto de Machine Learning), con un alcance propio de frontend.

**Usuario ficticio:** Miguel Diaz, dueño de una bodega en Lima. Necesita reunir sus ventas en efectivo y billeteras digitales y consultar los gastos de reposición. Este perfil es una hipótesis de diseño autorizada para el curso; no representa entrevistas realizadas.

## Ejecutar

Requisito: Node.js 20 o posterior. No necesita instalar dependencias.

1. Abre esta carpeta en VS Code o Codex.
2. En una terminal dentro de la carpeta, ejecuta `npm start`.
3. Visita http://localhost:4173.

También funciona con Live Server de VS Code. No abras `index.html` con doble clic: `fetch` necesita servir los archivos por HTTP.

## Funciones

- Resumen mensual con ingresos, gastos, saldo, gráfico semanal y distribución de ingresos por medio de pago.
- Registrar y editar movimientos con validaciones y mensajes por campo.
- Historial con búsqueda sin distinción de tildes, filtros combinados y eliminación con confirmación.
- Exportación CSV de los resultados filtrados.
- Carga inicial con `fetch` de `data/movements.json`. Los 18 movimientos son ficticios, de noviembre de 2026; el resumen abre el mes del último registro.
- Conservación local de cambios con `localStorage`; después de la primera modificación guarda la lista completa. No hay cuenta, backend ni sincronización entre dispositivos. Los cambios se comparten entre pestañas del mismo origen.
- Estados vacíos, mensajes de carga/error y aviso si el almacenamiento no está disponible.

El saldo es **ingresos registrados menos gastos registrados**, no ganancia neta. No conecta cuentas de Yape o Plin, no integra el modelo de ML y no concede créditos. Elegir un medio de pago solo clasifica el registro manual.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Estructura semántica, tres vistas, formulario y diálogo |
| `styles.css` | Diseño propio, estados de foco y adaptación a móvil/tableta/escritorio |
| `js/app.js` | Eventos, DOM, fetch, persistencia, gráfico y exportación |
| `js/domain.js` | Validación, operaciones en céntimos y filtros |
| `data/movements.json` | Movimientos de demostración, todos ficticios |
| `assets/logo.svg` | Identidad vectorial local |
| `server.mjs` | Servidor de desarrollo sin dependencias |
| `tests/domain.test.mjs` | Pruebas de cálculos, datos, validaciones y filtros |
| `docs/VERIFICACION.md` | Comprobaciones y tareas manuales |

## Accesibilidad prevista

Idioma español, etiquetas asociadas, campos agrupados, errores con `aria-describedby` y `aria-invalid`, enlace para saltar al contenido, foco visible, mensajes de estado y gráfico con descripción textual de todos los valores. El diálogo de eliminación utiliza el elemento nativo `dialog`. Las tablas anchas tienen desplazamiento horizontal accesible con teclado. Se respeta la preferencia de movimiento reducido. Esto no constituye una certificación WCAG: las auditorías del curso siguen pendientes.

## Pruebas

Ejecuta `npm test`. Consulta las tareas de verificación manual en `docs/VERIFICACION.md`.

## GitHub y publicación

El código está preparado para GitHub Pages, Netlify o Vercel como sitio estático, sin compilación. En GitHub Pages, publica la raíz de esta carpeta desde la rama elegida. No es necesario subir `node_modules`.

La entrega EC2 está disponible en el [repositorio de SentryBox](https://github.com/mijaeld66-ux/sentrybox-frontend). Los siguientes commits registrarán cambios de implementación y los resultados de su verificación.

## Pendientes académicos

Esta entrega contiene el código. El artículo IEEE, las cinco fuentes verificadas, el plan e instrumentos de evaluación, las pruebas con participantes y los informes Lighthouse/axe se preparan por separado. No se presentan resultados de usuarios ficticios como evidencia real. La autorización para un usuario ficticio no implica automáticamente que puedan inventarse participantes o mediciones.

## Uso de IA

Se utilizó ChatGPT/Codex como apoyo para la propuesta de interfaz, ayuda con el código y pruebas técnicas de la v1. 

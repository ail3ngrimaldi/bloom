# Decisiones — registro de decisiones del proyecto

Este documento registra (1) las decisiones bloqueantes de [PLAN.md](PLAN.md) §9.1 con el **default adoptado** y (2) las decisiones de implementación que se toman durante las fases. Lo mantiene el orquestador: cada fase reporta sus decisiones y se agregan a la segunda tabla.

## Decisiones bloqueantes (PLAN §9.1)

**Estado:** el usuario aún no ha respondido ninguna pregunta, así que las ocho adoptan el default propuesto. Si una respuesta posterior lo cambia, se anota aquí qué fases se rehacen. La Fase 8 (integraciones reales) sigue **bloqueada** hasta que D4, D7 y D8 se confirmen con datos reales.

| ID | Tema | Default adoptado | Motivo |
|---|---|---|---|
| D1 | Stack | Vite + React + TypeScript (SPA) | El funnel es una SPA sin necesidad de SEO ni SSR, y el plan ya asume rutas de cliente (`/s/:stepId`). |
| D2 | Identidad de Bloom | Tokens de PLAN §4.1 con nombres de marca neutros; logo placeholder marcado `TODO(content)` | Permite paridad visual sin copiar la identidad de la referencia; la marca real se cambia en los tokens y en un solo componente. |
| D3 | Claims, credenciales y testimonios | No se renderizan; contenido propio genérico u ocultar el bloque, siempre detrás de flags apagados | No hay evidencia verificable de cifras, prensa, universidades, revisor experto ni testimonios (guardrails 2 y 3). |
| D4 | Pagos, precios y moneda | `MockCheckoutProvider`; los precios de PLAN §5.10 sólo como datos de demo etiquetados | Sin proveedor, credenciales ni precios reales no se pueden cobrar; la interfaz de adaptador permite cambiar de proveedor sin tocar la UI. |
| D5 | Alineación del label de las opciones | Abajo-izquierda (paridad con la referencia), con un token CSS para cambiarla | Es lo observado en el video y es reversible sin tocar los componentes. |
| D6 | Idiomas | Inglés, con la estructura i18n lista (copy fuera de los componentes); español como segunda fase | El copy de referencia está en inglés; separarlo desde el inicio evita reescrituras al traducir. |
| D7 | Temporizador de descuento | Detrás del flag `paywall.countdown.enabled`, apagado por defecto | La urgencia sólo es válida si el descuento realmente vence (guardrail 6); encendido arranca en 15:00 y no se reinicia al recargar. |
| D8 | Despliegue, privacidad y consentimiento | Sin despliegue; páginas legales (Terms, Privacy, Subscription Policy) como placeholders | No hay dominio ni política definida y el checkout es mock; no se envían datos a terceros. |

## Decisiones de implementacion

| ID | Fase | Tema | Decision | Motivo |
|---|---|---|---|---|

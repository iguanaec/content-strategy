# Brand brief

Completa este archivo antes de correr el primer ciclo (`/content-cycle`). Todos los subagentes lo leen; `pauta` en particular necesita los IDs de Meta Ads y el tope de presupuesto, y se detiene a preguntar si faltan.

## Negocio / marca
- **Nicho / marca personal**: Iguana — asistente de WhatsApp con IA para microempresas de servicios en Ecuador que operan por citas (peluquerías, barberías, spas, centros estéticos, consultorios médicos, psicólogos, veterinarias). Foco inicial: belleza y bienestar, en Quito y Guayaquil.
- **Oferta principal**: asistente de WhatsApp con IA que responde clientes 24/7, agenda citas automáticamente y factura electrónicamente ante el SRI, todo centralizado en un solo chat. **Pricing y planes todavía NO están definidos/cerrados — no mencionar precios ni nombres de plan en ninguna pieza de contenido hasta nueva indicación.** Comunicar la oferta solo a nivel de capacidad ("responde, agenda y factura por ti, sin que sueltes el celular").
- **Audiencia objetivo**: buyer persona "Amanda" — dueña-operadora de un negocio de servicios, 28-55 años, equipo de 1-10 personas, sin computadora en el negocio, gestiona todo desde su WhatsApp personal. Dolor funcional (gestión financiera dispersa, agenda ineficiente, miedo a sanciones del SRI $30-$1.500), dolor social (quiere dejar de verse como "negocio informal de barrio"), dolor emocional (quiere recuperar tiempo con su familia y tranquilidad). Nivel de reconocimiento: "Visión" — ya probó soluciones caseras (chatbots nativos de WhatsApp, cuadernos, Excel nocturno) y está dispuesta a pagar por algo mejor.
- **Tono / voz de marca**: arquetipo Mentor-Explorador — cercana, serena, orgullosamente local, resiliente, con humor sutil (sin forzar el chiste de reptiles en cada pieza). Simple ("si sabes mandar un WhatsApp, ya sabes usar Iguana"), honesta, nunca condescendiente. Reglas que nunca se rompen: sin jerga técnica de software de cara al cliente (nada de API/backend/IA generativa), nunca dramatizar el cambio como riesgoso, nunca prometer transformación de identidad (la promesa es de capacidad, no de identidad), el héroe de cada historia es siempre el dueño del negocio, no Iguana.
  - Metáfora central de marca: la iguana marina de Galápagos, único lagarto que aprendió a nadar sin dejar de ser lagarto. Se desliza al agua con calma (nunca salta dramáticamente), nada con el cuerpo entero (solución integral, no un parche), bucea y aguanta la respiración (el negocio sigue funcionando aunque la dueña esté desconectada), se alimenta sin ser depredadora (la IA no reemplaza a la persona), vuelve a la roca a tomar sol (la automatización libera tiempo para lo esencial). Usar la metáfora con propósito, en momentos clave — no como chiste recurrente en cada pieza.
  - Tagline: "La iguana se adaptó. ¿Qué esperas tú?" / Línea de marca: "Iguana — Aprende a nadar en el ecosistema digital."
- **Identidad visual** (opcional): verde profundo `#2F5D50` (mar/adaptación), negro roca volcánica `#2B2420` (origen/solidez), acento coral/terracota `#C8683B` (calidez humana). Evitar el azul genérico de "tech company". Pendiente de validar en sesión de diseño formal.

## Plataformas
- Instagram: @iguana.ec
- Facebook: página "Iguana Ec"
- Geografía objetivo: Ecuador, foco inicial Quito y Guayaquil.

## Volumen y cadencia
- **Piezas por ciclo**: 4-8
- **Cadencia**: mensual (ver razonamiento en `CLAUDE.md`)

## Datos de Meta Ads (obligatorios para `pauta`)
- **ad_account_id**: `1083791537588443` (cuenta "Iguana Ec" — falta confirmar formato `act_...` con `ads_get_ad_accounts` antes de usarlo en `pauta`).
- **page_id**: pendiente — resolver con `ads_get_ad_account_pages` cuando se vaya a activar `pauta` (fase 3 del roadmap, ver notas de estrategia).
- **ig_account_id**: pendiente — resolver con `ads_get_ig_accounts` cuando se vaya a activar `pauta`.
- **Tope de presupuesto mensual (pauta)**: N/A por ahora. El usuario tiene $20-50 USD/mes reservados, pero **no son para el subagente `pauta`** — son para que el usuario mismo impulse (boost) manualmente, desde la app de Instagram/Facebook, los posts orgánicos que mejor funcionen. No usar este monto para crear campañas/ad sets/anuncios vía `pauta` todavía.
- **Objetivo publicitario por defecto**: N/A por ahora (fase orgánica + boost manual del usuario). Se define cuando se active `pauta` con campaña estructurada en la fase 3 del roadmap (conversión), una vez que el pricing esté definido.

## Notas / decisiones de estrategia

**Estrategia de funnel aprobada (seguidores → confianza → clientes).** Objetivo del primer tramo: crecer seguidores primero, construir confianza después, y recién entonces buscar clientes. Se traduce al vocabulario de `planificador` (`awareness / consideración / conversión`) así:

| Fase | Ciclos (recomendado) | Objetivo | Mezcla de piezas sugerida (de 4-8/ciclo) | Pauta |
|---|---|---|---|---|
| **1. Seguidores** | Ciclo 1-2 | Awareness: dar a conocer la metáfora de marca y el dolor de Amanda (pierde clientes por no responder WhatsApp a tiempo), sin vender y sin mencionar precios | Mayoría `awareness`, 1 pieza `consideración` como teaser | Ninguna vía `pauta` — el usuario impulsa manualmente los mejores posts orgánicos con $20-50/mes |
| **2. Confianza** | Ciclo 3 (ajustar según `analista`) | Consideración: cómo funciona, prueba social, antes/después, demo del bot, testimonios | Mayoría `consideración`, 1-2 `awareness` | Igual que fase 1: boost manual del usuario |
| **3. Clientes** | Ciclo 4+, cuando el pricing esté definido | Conversión: oferta, pricing público (una vez confirmado), CTA agendar demo, targeting Quito/Guayaquil | Mayoría `conversión`, resto `consideración` | Reevaluar activar `pauta` con campaña estructurada (objetivo leads/conversiones) |

**Reglas fijas para esta primera etapa:**
- No mencionar pricing ni nombres de plan en ninguna pieza hasta que el usuario confirme que están definidos.
- No invocar al subagente `pauta` mientras estemos en fase 1-2 del roadmap — el pipeline llega hasta `publicar` y se detiene ahí; el boost es una acción manual del usuario, fuera de este sistema.
- Cada ciclo, `planificador` debe pesar la mezcla de "etapa de funnel" según la fase vigente de este roadmap (ver tabla arriba), y `analista` (desde el ciclo 2) debe usar el desempeño orgánico real para decidir cuándo pasar de fase.

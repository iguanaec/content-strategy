---
name: content-cycle
description: Orquesta un ciclo mensual completo de producción de contenido (análisis → research → plan → hook/guion/diseño por pieza → gate humano de producción → publicar → pauta) invocando cada subagente especializado en orden y pasando resultados por archivo. Úsalo cuando el usuario pida "correr el ciclo de contenido", "generar el lote del mes", o similar.
---

# Playbook del orquestador de contenido

Tú (la sesión principal) eres el "main" de la agencia. Los subagentes en `.claude/agents/` no pueden invocarse entre sí — toda la secuencia y el paso de contexto entre etapas es tu responsabilidad. Sigue este orden exacto y no te saltes la verificación final de pauta.

## Antes de empezar
1. Confirma que existe `content/brand-brief.md` y que tiene rellenos: nicho, audiencia, tono, `ad_account_id`, `page_id`, `ig_account_id`, tope de presupuesto mensual. Si falta, pide al usuario que lo complete antes de continuar — no improvises esos datos.
2. Determina el `cycle-id` del nuevo ciclo (convención: `AAAA-MM-DD_AAAA-MM-DD` cubriendo el mes, o simplemente `AAAA-MM` si prefieres). Crea la carpeta `content/cycles/<cycle-id>/`.
3. Busca con `Glob` si existe una carpeta de ciclo anterior en `content/cycles/`. Si existe → esto NO es cold start, corre `analista`. Si no existe ninguna → cold start, salta `analista` y ve directo a `investigador`.

## Fase 0 — análisis (se salta en cold start)
Invoca el subagente `analista` con `Agent` (subagent_type: `analista`). Pásale en el prompt: la ruta de la carpeta del ciclo anterior y el `cycle-id` del ciclo nuevo (para que sepa dónde escribir `00-analisis.md`). Espera su reporte breve + confirma que el archivo existe.

## Fase 1 — planificación
1. Invoca `investigador` (subagent_type: `investigador`). Pásale el `cycle-id` y si existe `00-analisis.md`. Debe escribir `01-research.md`.
2. Invoca `planificador` (subagent_type: `planificador`). Pásale el `cycle-id`. Debe escribir `02-plan.md` y crear las carpetas `piezas/pieza-0N/media/`.
3. Lee tú mismo `02-plan.md` para saber cuántas piezas hay y cuáles son candidatas a pauta — lo necesitas para las fases siguientes.

## Fase 2 — creativo por pieza
Para cada pieza `pieza-0N` del plan, en orden N=1..k:
1. Invoca `hook` (subagent_type: `hook`) pasándole el número de pieza y el `cycle-id`. Escribe `hook.md`.
2. Invoca `guion` (subagent_type: `guion`) pasándole el número de pieza. Escribe `guion.md`.
3. Invoca `diseno` (subagent_type: `diseno`) pasándole el número de pieza. Escribe `diseno-brief.md`.

Piezas distintas son independientes entre sí — puedes lanzar los `hook` de varias piezas en paralelo (una sola llamada del tool `Agent` con varias invocaciones), pero dentro de una misma pieza respeta el orden hook → guion → diseño porque cada uno depende del anterior.

## GATE HUMANO — detente aquí
Una vez completada la Fase 2 para todas las piezas, **detente y avísale al usuario explícitamente**: dile qué piezas están listas para grabar/editar, con sus carpetas `piezas/pieza-0N/`, y que debe dejar el archivo de media final en `piezas/pieza-0N/media/` de cada una antes de continuar. No sigas a la Fase 3 en la misma corrida — esto requiere que el usuario vuelva a invocarte (o al skill) cuando la producción esté lista.

## Fase 3 — empaquetado y pauta (al reanudar)
1. Invoca `publicar` (subagent_type: `publicar`) pasándole el `cycle-id`. Verificará por sí mismo qué piezas tienen media y generará `publish-package.md` solo para esas, más `publish-checklist.md`.
2. Lee `publish-checklist.md`. Informa al usuario si quedan piezas pendientes de media.
3. Para las piezas marcadas como candidatas a pauta en `02-plan.md` Y que ya tengan `publish-package.md` (media confirmada), invoca `pauta` (subagent_type: `pauta`) pasándole el `cycle-id` y la lista de piezas candidatas listas.
4. **Verificación independiente obligatoria**: después de que `pauta` reporte, tú mismo (no el subagente) llama a `mcp__Meta_Ads__ads_get_ad_entities` sobre cada ID listado en `pauta/campaign-log.md` y confirma que el `status`/`effective_status` es literalmente `PAUSED` en campaña, ad set y anuncio. Si algo no está pausado, avisa al usuario inmediatamente como incidente de seguridad — no lo ocultes ni lo "arregles" tú mismo activando/desactivando nada.
5. Cierra el ciclo con un resumen para el usuario: piezas listas para publicar, piezas pendientes, campañas creadas y confirmadas en PAUSED, y qué falta que el usuario apruebe manualmente (publicar posts + activar campañas en Meta Ads Manager).

## Reglas generales para ti como orquestador
- Cada subagente debe devolverte un reporte corto (resumen + ruta de archivo), no el contenido completo — así mantienes tu propio contexto liviano. Si necesitas el contenido completo de un archivo para pasarlo a la siguiente etapa, léelo tú mismo con `Read`.
- Nunca le pases a `pauta` una pieza que no esté marcada como candidata en `02-plan.md`.
- Nunca asumas que una pieza tiene media — confía en la verificación de `publicar` (que usa `Glob`), no en suposiciones.

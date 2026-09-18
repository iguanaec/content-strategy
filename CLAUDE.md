# content-strategy — orquestador de contenido (IG + Facebook)

Este repo implementa un pipeline de producción de contenido para marca personal en Instagram y Facebook, operado como una "agencia" de subagentes de Claude Code, cada uno con una sola responsabilidad. La sesión principal actúa como orquestador ("main"): los subagentes no pueden invocarse entre sí, así que toda la coordinación pasa por la sesión principal siguiendo el skill `content-cycle`.

## Cómo correr un ciclo

Invoca el skill:

```
/content-cycle
```

El skill (`.claude/skills/content-cycle/SKILL.md`) es el playbook completo: en qué orden llamar a cada subagente, qué archivos pasarle como contexto, y dónde debe escribir su salida. Antes de correr el primer ciclo, llena `content/brand-brief.md`.

## Fases del pipeline

1. **`analista`** (se salta en el ciclo 1) — analiza el desempeño del ciclo anterior, orgánico y de pauta.
2. **`investigador`** — tendencias, competencia, ángulos de audiencia.
3. **`planificador`** — decide las 4-8 piezas del ciclo (tema, formato, fecha, si lleva pauta).
4. Por pieza, en cascada: **`hook`** → **`guion`** → **`diseño`**.
5. **[GATE HUMANO]** — el usuario graba y edita en CapCut/Canva y deja el archivo final en `piezas/pieza-0N/media/`. Ningún agente actúa en esta fase.
6. **`publicar`** — arma el paquete de publicación (caption, hashtags, horario) solo para piezas con media ya presente.
7. **`pauta`** — crea campaña/ad set/creativo/anuncio en Meta Ads, **siempre en estado PAUSADO**, para las piezas marcadas como candidatas a pauta.

## Regla de seguridad no negociable

`pauta` nunca debe activar gasto real. Sus permisos de herramientas excluyen explícitamente `ads_activate_entity`, `ads_update_entity` y `ads_boost_ig_post` — activar campañas es estructuralmente imposible desde ese subagente. El usuario aprueba y activa manualmente desde Meta Ads Manager. Después de correr `pauta`, la sesión principal debe verificar de forma independiente (no confiar en el reporte del subagente) que todo quedó `PAUSED` con `ads_get_ad_entities`.

## Convención de handoff

Los subagentes no comparten contexto de conversación entre sí. Todo el traspaso de información ocurre por archivo dentro de `content/cycles/<cycle-id>/`. Cada subagente lee los archivos de etapas previas que necesita y escribe su salida en el archivo que le corresponde (ver tabla de rutas en el skill). Al volver a la sesión principal, cada subagente debe reportar solo un resumen corto + la ruta del archivo que escribió, no el contenido completo, para no inflar el contexto del orquestador.

## Entrega de contenido al usuario

Cada vez que se sube (commit + push) contenido de un ciclo — research, plan, o el lote de hook/guion/diseño de las piezas — la sesión principal debe generar **además** un documento `.docx` consolidado con ese contenido (roadmap de estrategia vigente, calendario del ciclo, y por cada pieza: hook recomendado + alternativas, guion completo, y brief de diseño resumido con shotlist), guardarlo en `content/cycles/<cycle-id>/` (ej. `Iguana-Ciclo-<cycle-id>.docx`), subirlo también al repo, y entregárselo directamente al usuario (no basta con dejarlo en el repo). Esta es una preferencia permanente del usuario, no algo que se pregunte cada vez.

## Cadencia

**Mensual.** Un ciclo completo (`análisis → pauta`) corre una vez al mes. Motivo: las campañas de Meta Ads necesitan ~1-2 semanas para salir de fase de aprendizaje y dar datos confiables, y la producción (grabación + edición) la hace una sola persona — un ciclo quincenal duplicaría la carga semanal de piezas. Ver el razonamiento completo y la opción de "pulse check" quincenal opcional en `content/brand-brief.md` (sección de notas) y en el histórico de decisiones si se documenta ahí.

## Estructura de carpetas

```
content-strategy/
  CLAUDE.md
  .claude/agents/*.md           # 8 subagentes
  .claude/skills/content-cycle/ # playbook del orquestador
  content/
    brand-brief.md              # nicho, audiencia, tono, IDs de Meta, tope de presupuesto
    organic-metrics-log.md      # log manual de métricas orgánicas (no hay tool de analytics orgánico)
    cycles/<cycle-id>/
      00-analisis.md
      01-research.md
      02-plan.md
      publish-checklist.md
      piezas/pieza-0N/{hook,guion,diseno-brief,publish-package}.md + media/
      pauta/{campaign-brief,campaign-log}.md
```

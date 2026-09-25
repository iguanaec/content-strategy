# VideoFlow Studio — video IA con Higgsfield, en la nube

Estudio web para generar videos con **todos los modelos de video de la API de Higgsfield**: 22 familias y 66 modos, entre ellos Seedance 2.0/2.5, Kling 2.5/2.6/3.0/O3/Omni, Wan 2.6/2.7/3.0, MiniMax H3, Hailuo, LTX, PixVerse, Happy Horse, Grok, Cinema Studio y Genjutsu. Corre en **Cloudflare Workers** y las API keys son *secrets* que nunca llegan al navegador.

**URL:** https://videoflow.iguanacorpec.workers.dev (protegida con contraseña)

## Cómo se usa (todo en una sola página)

| Zona | Qué haces ahí |
|---|---|
| **Barra superior** | Cliente / Proyecto activos (＋ crea, ✎ edita), gasto del mes, **Biblioteca** y ⚙ Conexiones. |
| **Compositor (izquierda)** | **Modelo**: elige familia, nivel (Pro/Standard/4K/Turbo/Fast) y modo. En *Automático* el modo se elige solo según tus referencias.<br>**Referencias**: Inicio, Final, Personajes, Producto, Estilo, Locación, Video y Audio. Toca un espacio para elegir de la biblioteca o subir.<br>**Prompt**: ✨ Mejorar y Variaciones (Claude API), o **Claude.ai ↗** para usar tu suscripción Pro copiando el pedido. *Ver prompt final* muestra exactamente lo que se envía.<br>**Dirección**: estilos visuales y movimientos de cámara.<br>**Formato**: presets por plataforma más los parámetros reales del modelo (duración, aspecto, calidad, audio y un bloque *Avanzado* con seed, CFG, lente, época…).<br>**Costo en vivo**: USD y créditos según modelo y segundos, calculados por Higgsfield para tu cuenta. |
| **Feed (derecha)** | Videos con filtros, búsqueda, favoritos, ↺ Reusar configuración, descarga, **A ciclo** y detalles. |
| **Biblioteca (panel lateral)** | Personajes, productos, looks, locaciones, frames, videos y audios (cada elemento puede tener varias fotos). En la misma pestaña gestionas clientes, proyectos, estilos y formatos. |

`⌘/Ctrl + Enter` genera. Los videos tardan de 1 a 5 minutos. El servidor revisa cada 10 min las generaciones pendientes aunque cierres la pestaña.

### Personajes y referencias

- En modos **Referencias** (Seedance, Kling O3/Omni, Wan, MiniMax H3, Cinema Studio, Grok…) las fotos se envían como imágenes y el prompt se anota solo: *"Reference image 1 is the main character "Ana": …"*.
- En modos **Texto/Imagen a video** el personaje no viaja como imagen. Se añade su nombre y descripción al prompt, y el espacio se marca como *ignorado*.
- **Inicio/Final** usan el frame nativo del modelo. Si el modo no lo tiene pero acepta referencias, se envían como imagen de referencia (etiqueta *como ref.*).

### Costos

El costo viene de `POST /estimate` de Higgsfield, es decir, lo que te cobrarían a ti, con descuentos incluidos. Algunos modelos solo publican tarifa (Seedance, Cinema Studio, Wan 3.0, Genjutsu). En esos casos se calcula con su fórmula oficial y se marca con **≈** (tarifa antes de descuentos). Las generaciones fallidas o moderadas no se cobran.

## Conexiones (secrets de Cloudflare)

| Secret | Para qué | Estado inicial |
|---|---|---|
| `HF_CREDENTIALS` | API de Higgsfield (`key-id:key-secret`) | configurado |
| `APP_PASSWORD` / `SESSION_SECRET` | acceso al estudio | configurado |
| `ANTHROPIC_API_KEY` | ✨ Mejorar con Claude (ve tus imágenes de referencia) | opcional |
| `GITHUB_TOKEN` | botón **A ciclo** (token fine-grained con *Contents* y *Actions* en lectura/escritura sobre este repo) | opcional |

```bash
cd video-generator
npm install
export CLOUDFLARE_API_TOKEN=...       # token con permisos de Workers y D1
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put APP_PASSWORD  # para cambiar la contraseña
```

**R2 (recomendado):** sin R2, las imágenes se guardan en D1 (máx. 20 MB por archivo) y los videos viven 7 días en el CDN de Higgsfield. Con R2 se copian para siempre. Para activarlo: activa R2 en el panel de Cloudflare, corre `npx wrangler r2 bucket create videoflow-media`, descomenta `r2_buckets` en `wrangler.jsonc` y ejecuta `npm run deploy`.

## A ciclo → content/cycles

El Worker dispara `.github/workflows/videoflow-save.yml`, que descarga el video y hace commit en `content/cycles/<ciclo>/piezas/<pieza>/media/`, la carpeta que usa el agente `publicar`. GitHub solo ejecuta workflows manuales que ya están en la rama por defecto, así que esta función se activa cuando este cambio se fusione.

## Desarrollo

```bash
cp .dev.vars.example .dev.vars   # rellena los valores
npx wrangler d1 migrations apply videoflow --local
npm run dev                      # http://127.0.0.1:8787
npm run catalog                  # regenera public/catalog.json desde docs.higgsfield.ai
npm run deploy
```

```
video-generator/
  wrangler.jsonc         # Worker + assets + D1 + cron
  worker/index.js        # API: login, docs, media, estimate, generate, Claude, GitHub
  migrations/            # esquema D1
  public/                # index.html, styles.css, app.js, catalog.json (sin build)
  scripts/build-catalog.mjs
```

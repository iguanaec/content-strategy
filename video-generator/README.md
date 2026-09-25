# VideoFlow — generador de video con Higgsfield

Dashboard local para generar videos con **Seedance 2.5** (Higgsfield) con referencias visuales, clientes, proyectos, estilos y formatos. La interfaz está inspirada en Higgsfield, Runway y Magnific: barra lateral de iconos, un feed de generaciones y un compositor fijo abajo.

## Arranque

```bash
cd video-generator
npm install
cp .env.example .env.local   # y pon tu HF_CREDENTIALS=key-id:key-secret
npm start                    # abre http://127.0.0.1:5173
```

- `.env.local` está en `.gitignore`. La key se queda en el servidor y nunca llega al navegador.
- La API de Higgsfield (console.higgsfield.ai) usa **créditos propios**, separados de la suscripción de la app. Sin créditos, las generaciones fallan con un aviso claro.
- `npm run example` corre el ejemplo mínimo del SDK: "A cinematic scene at sunset", 5 s, 720p, 16:9. Es una generación facturable.

## Claude con tu suscripción Pro (sin API key)

El botón **✨ Mejorar** y **Variaciones** llaman al CLI de Claude Code (`claude -p`) desde el servidor local, que usa tu sesión Pro. Requisito: tener Claude Code instalado y haber ejecutado `claude` una vez para iniciar sesión. El contexto de marca del cliente activo y el estilo elegido se envían junto con tu idea.

## Qué incluye

| Sección | Qué hace |
|---|---|
| **Crear** | Feed de generaciones filtrable. El compositor tiene frame inicial/final (image-to-video), prompt, formato, aspecto, estilo, duración (4–30 s), calidad (480p/720p) y audio. `⌘/Ctrl + Enter` genera. |
| **Proyectos** | Agrupan generaciones y pertenecen a un cliente. El selector superior Cliente / Proyecto filtra el feed y etiqueta las nuevas generaciones. |
| **Referencias** | Tableros (moodboards) de imágenes con etiquetas y búsqueda. Se suben arrastrando. Cada imagen se puede usar como frame inicial o final. |
| **Clientes** | Color, nicho, contexto de marca (lo usa Claude), formato y estilo por defecto (se aplican al elegir el cliente). |
| **Estilos** | Estilos visuales: descriptores más movimiento de cámara que se añaden al prompt. Formatos por plataforma: aspecto, duración y calidad. Vienen 6 y 6 de ejemplo, todos editables. |
| **Ajustes** | Estado de las conexiones y respaldo/restauración en JSON (incluye imágenes). |

Con un video listo, **A ciclo** lo descarga a `content/cycles/<ciclo>/piezas/<pieza>/media/`. Ahí es donde el agente `publicar` busca la media del gate humano de producción.

## Datos

Todo se guarda en el navegador (IndexedDB), así que no hay base de datos que mantener. Exporta un respaldo desde **Ajustes** antes de limpiar el navegador o cambiar de equipo. Los videos viven en el CDN de Higgsfield; descárgalos o guárdalos en un ciclo para conservarlos.

## Estructura

```
video-generator/
  server.js        # servidor local: estáticos + /api (Higgsfield SDK, claude -p, ciclos)
  example.js       # ejemplo mínimo del SDK
  public/          # index.html, styles.css, app.js (sin build, sin framework)
```

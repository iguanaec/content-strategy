import Anthropic from "@anthropic-ai/sdk";

const HF_API = "https://api.higgsfield.ai";
const STORES = new Set(["clients", "projects", "elements", "styles", "formats", "generations"]);
const SESSION_DAYS = 30;
const CHUNK = 1_500_000; // bytes por fila en el respaldo D1 (límite de fila: 2 MB)
const MAX_UPLOAD_R2 = 95 * 1024 * 1024;
const MAX_UPLOAD_D1 = 20 * 1024 * 1024;
const HF_URL_TTL = 12 * 60 * 60 * 1000;
const UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "audio/wav", "audio/x-wav"]);
const SAFE_NAME = /^\w[\w.-]{0,80}$/;
const PENDING = new Set(["queued", "in_progress", "submitting"]);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } });

// ---------- Sesión (cookie firmada con HMAC) ----------
const enc = new TextEncoder();
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function createSession(env) {
  const exp = Date.now() + SESSION_DAYS * 86400_000;
  return `${exp}.${await hmac(env.SESSION_SECRET, `session:${exp}`)}`;
}
async function isAuthed(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const token = /(?:^|;\s*)vf_session=([^;]+)/.exec(cookie)?.[1];
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || Number(exp) < Date.now()) return false;
  return safeEqual(sig, await hmac(env.SESSION_SECRET, `session:${exp}`));
}
async function signMedia(env, key, ttlMs) {
  const exp = Date.now() + ttlMs;
  return `/api/media/${key}?exp=${exp}&sig=${await hmac(env.SESSION_SECRET, `media:${key}:${exp}`)}`;
}
async function validMediaSig(env, key, url) {
  const exp = Number(url.searchParams.get("exp"));
  if (!exp || exp < Date.now()) return false;
  return safeEqual(url.searchParams.get("sig") || "", await hmac(env.SESSION_SECRET, `media:${key}:${exp}`));
}

// ---------- Documentos ----------
async function allDocs(env) {
  const { results } = await env.DB.prepare("SELECT store, data FROM docs").all();
  const out = Object.fromEntries([...STORES].map((s) => [s, []]));
  for (const row of results) if (out[row.store]) out[row.store].push(JSON.parse(row.data));
  return out;
}
async function getDoc(env, store, id) {
  const row = await env.DB.prepare("SELECT data FROM docs WHERE store = ? AND id = ?").bind(store, id).first();
  return row ? JSON.parse(row.data) : null;
}
async function putDoc(env, store, doc) {
  doc.updatedAt = Date.now();
  await env.DB.prepare("INSERT INTO docs (store, id, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(store, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
    .bind(store, doc.id, JSON.stringify(doc), doc.updatedAt)
    .run();
  return doc;
}

// ---------- Archivos ----------
const newKey = (ext) => `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "audio/wav": "wav", "audio/x-wav": "wav" };

async function storeMedia(env, { body, contentType, size, key = newKey(EXT[contentType]) }) {
  if (env.MEDIA) {
    await env.MEDIA.put(key, body, { httpMetadata: { contentType } });
    await env.DB.prepare("INSERT INTO media (key, content_type, size, storage, created_at) VALUES (?, ?, ?, 'r2', ?)").bind(key, contentType, size, Date.now()).run();
    return key;
  }
  const bytes = new Uint8Array(body instanceof ArrayBuffer ? body : await new Response(body).arrayBuffer());
  if (bytes.byteLength > MAX_UPLOAD_D1) throw new HttpError(413, "Archivo demasiado grande. Sin R2 el límite es 20 MB; activa R2 en Cloudflare para subir hasta 95 MB.");
  const statements = [env.DB.prepare("INSERT INTO media (key, content_type, size, storage, created_at) VALUES (?, ?, ?, 'd1', ?)").bind(key, contentType, bytes.byteLength, Date.now())];
  for (let i = 0; i * CHUNK < bytes.byteLength; i++) {
    statements.push(env.DB.prepare("INSERT INTO media_chunks (key, idx, data) VALUES (?, ?, ?)").bind(key, i, bytes.slice(i * CHUNK, (i + 1) * CHUNK).buffer));
  }
  await env.DB.batch(statements);
  return key;
}

async function mediaInfo(env, key) {
  const row = await env.DB.prepare("SELECT * FROM media WHERE key = ?").bind(key).first();
  if (!row) throw new HttpError(404, "Archivo no encontrado.");
  return row;
}

async function readMedia(env, info, range) {
  if (info.storage === "r2") {
    if (!env.MEDIA) throw new HttpError(503, "El archivo está en R2 pero R2 no está conectado.");
    const obj = await env.MEDIA.get(info.key, range ? { range } : undefined);
    if (!obj) throw new HttpError(404, "Archivo no encontrado en R2.");
    return obj;
  }
  const { results } = await env.DB.prepare("SELECT data FROM media_chunks WHERE key = ? ORDER BY idx").bind(info.key).all();
  const parts = results.map((r) => new Uint8Array(r.data));
  const out = new Uint8Array(parts.reduce((n, p) => n + p.byteLength, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.byteLength;
  }
  return { body: out };
}

async function serveMedia(env, key, request) {
  const info = await mediaInfo(env, key);
  const headers = { "Content-Type": info.content_type, "Cache-Control": "private, max-age=86400", "Accept-Ranges": info.storage === "r2" ? "bytes" : "none" };
  const rangeHeader = request.headers.get("Range");
  const m = info.storage === "r2" && /^bytes=(\d+)-(\d*)$/.exec(rangeHeader || "");
  if (m) {
    const start = Number(m[1]);
    const end = m[2] ? Math.min(Number(m[2]), info.size - 1) : info.size - 1;
    if (start >= info.size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    const obj = await readMedia(env, info, { offset: start, length: end - start + 1 });
    return new Response(obj.body, { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${info.size}`, "Content-Length": String(end - start + 1) } });
  }
  const obj = await readMedia(env, info);
  return new Response(obj.body, { headers: { ...headers, "Content-Length": String(info.size) } });
}

async function deleteMedia(env, key) {
  const info = await env.DB.prepare("SELECT storage FROM media WHERE key = ?").bind(key).first();
  if (!info) return;
  if (info.storage === "r2" && env.MEDIA) await env.MEDIA.delete(key);
  await env.DB.batch([env.DB.prepare("DELETE FROM media_chunks WHERE key = ?").bind(key), env.DB.prepare("DELETE FROM media WHERE key = ?").bind(key)]);
}

// ---------- Higgsfield ----------
function hfHeaders(env) {
  if (!env.HF_CREDENTIALS) throw new HttpError(503, "Falta el secret HF_CREDENTIALS en Cloudflare.");
  return { Authorization: `Key ${env.HF_CREDENTIALS}`, "Content-Type": "application/json" };
}

function hfError(status, body) {
  const detail = typeof body?.detail === "string" ? body.detail : Array.isArray(body?.detail) ? body.detail.map((d) => d.msg || JSON.stringify(d)).join("; ") : "";
  if (status === 401) return new HttpError(502, "Credenciales de Higgsfield inválidas (revisa el secret HF_CREDENTIALS).");
  if (status === 402 || status === 403 || /credit/i.test(detail)) return new HttpError(402, "Tu cuenta de la API de Higgsfield no tiene créditos suficientes. Recarga en console.higgsfield.ai.");
  if (status === 404 || status === 423 || status === 503) return new HttpError(502, `Este modelo no está disponible para tu cuenta ahora mismo (${status}). ${detail}`.trim());
  if (status === 422 || status === 400) return new HttpError(400, `Higgsfield rechazó los parámetros: ${detail || "revisa los valores"}`);
  if (status === 429) return new HttpError(429, "Higgsfield: demasiadas solicitudes. Espera un momento y reintenta.");
  return new HttpError(502, `Error de Higgsfield (${status}) ${detail}`.trim());
}

async function hfFetch(env, path, init = {}) {
  const res = await fetch(`${HF_API}${path}`, { ...init, headers: { ...hfHeaders(env), ...(init.headers || {}) } });
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { detail: text.slice(0, 300) };
  }
  if (!res.ok) throw hfError(res.status, body);
  return body;
}

const MODEL_ID = /^[a-z0-9][a-z0-9._-]*(\/[a-z0-9._-]+){1,5}$/i;
function checkModel(model) {
  if (!MODEL_ID.test(model || "")) throw new HttpError(400, "Modelo inválido.");
  return model;
}

// Sube un archivo guardado al CDN de Higgsfield y devuelve su URL pública (con cache de 12 h).
async function hfUrlFor(env, key) {
  const info = await mediaInfo(env, key);
  if (info.hf_url && Date.now() - info.hf_url_at < HF_URL_TTL) return info.hf_url;
  const contentType = info.content_type === "audio/x-wav" ? "audio/wav" : info.content_type;
  const upload = await hfFetch(env, "/files/generate-upload-url", { method: "POST", body: JSON.stringify({ content_type: contentType }) });
  const obj = await readMedia(env, info);
  let body = obj.body;
  if (info.storage === "r2") {
    const { readable, writable } = new FixedLengthStream(info.size);
    obj.body.pipeTo(writable);
    body = readable;
  }
  const put = await fetch(upload.upload_url, { method: "PUT", headers: upload.upload_headers || { "Content-Type": contentType }, body });
  if (!put.ok) throw new HttpError(502, `No se pudo subir la referencia a Higgsfield (${put.status}).`);
  await env.DB.prepare("UPDATE media SET hf_url = ?, hf_url_at = ? WHERE key = ?").bind(upload.public_url, Date.now(), key).run();
  return upload.public_url;
}

async function resolveMedia(env, input, media) {
  const out = { ...input };
  for (const [param, value] of Object.entries(media || {})) {
    if (!/^[a-z_]+$/.test(param)) throw new HttpError(400, "Parámetro de media inválido.");
    if (Array.isArray(value)) out[param] = await Promise.all(value.map((k) => hfUrlFor(env, String(k))));
    else if (value) out[param] = await hfUrlFor(env, String(value));
  }
  return out;
}

async function refreshGeneration(env, gen) {
  if (gen.status === "submitting" && !gen.requestId && Date.now() - gen.createdAt > 10 * 60_000) {
    gen.status = "failed";
    gen.error = "El envío a Higgsfield no terminó. Reintenta.";
    return putDoc(env, "generations", gen);
  }
  if (!gen.requestId || !PENDING.has(gen.status)) return gen;
  let status;
  try {
    status = await hfFetch(env, `/requests/${gen.requestId}/status`);
  } catch (err) {
    if (err.status === 400 || err.status === 502) return gen;
    throw err;
  }
  gen.status = status.status;
  if (status.status === "completed") {
    gen.videoUrl = status.video?.url || status.images?.[0]?.url || null;
    gen.completedAt = Date.now();
    if (gen.videoUrl && env.MEDIA) {
      try {
        const res = await fetch(gen.videoUrl);
        if (res.ok) {
          const contentType = res.headers.get("Content-Type")?.split(";")[0] || "video/mp4";
          const size = Number(res.headers.get("Content-Length")) || 0;
          const body = size ? res.body : await res.arrayBuffer();
          gen.videoKey = await storeMedia(env, { body, contentType, size: size || body.byteLength, key: `gen/${gen.id}.mp4` });
        }
      } catch (err) {
        gen.archiveError = String(err.message || err);
      }
    }
  } else if (status.status === "failed") {
    gen.error = status.error || "La generación falló en Higgsfield (no se cobra).";
  } else if (status.status === "nsfw") {
    gen.error = "Bloqueado por moderación de contenido (no se cobra).";
  } else if (status.status === "canceled") {
    gen.error = "Cancelada.";
  }
  return putDoc(env, "generations", gen);
}

// ---------- Claude ----------
const CLAUDE_SYSTEM = `Eres director de fotografía y prompt engineer experto en modelos de video IA (Seedance, Kling, Wan, Veo, MiniMax, Cinema Studio).
Escribes prompts de video visualmente precisos: sujeto, acción, entorno, iluminación, lente y movimiento de cámara, atmósfera y ritmo.
Si recibes imágenes de referencia, obsérvalas con cuidado y describe fielmente a los personajes, productos, estilos y locaciones que muestran, con sus roles.
Escribe el prompt en inglés (los modelos rinden mejor) y respeta el idioma de cualquier diálogo o texto en pantalla que pida el usuario.`;

function enhanceInstructions({ mode, idea, style, camera, client, model, references, duration }) {
  const lines = [
    mode === "variations"
      ? "Escribe 3 variaciones distintas y creativas del prompt de video. Devuelve SOLO las 3 variaciones separadas por una línea con ---, sin numeración ni comillas."
      : "Reescribe la idea como un prompt de video listo para usar. Devuelve SOLO el prompt final, en un párrafo, sin explicaciones ni comillas.",
    "Máximo 120 palabras por prompt.",
  ];
  if (model) lines.push(`Modelo de destino: ${model}.`);
  if (duration) lines.push(`Duración del clip: ${duration} segundos (describe una acción que quepa en ese tiempo).`);
  if (style) lines.push(`Estilo visual a respetar: ${style}`);
  if (camera) lines.push(`Movimiento de cámara: ${camera}`);
  if (client) lines.push(`Contexto de marca del cliente: ${client}`);
  if (references?.length) {
    lines.push("Referencias visuales (en el orden de las imágenes adjuntas cuando las hay):");
    references.forEach((r, i) => lines.push(`${i + 1}. ${r.role}: ${r.name || "sin nombre"}${r.description ? ` — ${r.description}` : ""}`));
  }
  lines.push("", `Idea original: ${idea}`);
  return lines.join("\n");
}

function toBase64(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

async function runClaude(env, body) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const content = [];
  for (const ref of (body.references || []).slice(0, 8)) {
    if (!ref.key) continue;
    const info = await mediaInfo(env, ref.key).catch(() => null);
    if (!info || !/^image\/(jpeg|png|webp|gif)$/.test(info.content_type) || info.size > 4_500_000) continue;
    const obj = await readMedia(env, info);
    const bytes = new Uint8Array(obj.body instanceof Uint8Array ? obj.body : await new Response(obj.body).arrayBuffer());
    content.push({ type: "image", source: { type: "base64", media_type: info.content_type, data: toBase64(bytes) } });
  }
  content.push({ type: "text", text: enhanceInstructions(body) });
  const response = await client.beta.messages.create({
    model: env.CLAUDE_MODEL || "claude-opus-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: CLAUDE_SYSTEM,
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") throw new HttpError(422, "Claude no pudo reescribir este prompt. Prueba con otra redacción.");
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  if (!text) throw new HttpError(502, "Claude no devolvió texto.");
  return body.mode === "variations" ? { variations: text.split(/\n\s*---+\s*\n/).map((t) => t.trim()).filter(Boolean).slice(0, 3) } : { prompt: text };
}

// ---------- GitHub (guardar en content/cycles) ----------
async function gh(env, path, init = {}) {
  if (!env.GITHUB_TOKEN) throw new HttpError(503, "Falta el secret GITHUB_TOKEN para guardar en el repo.");
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json", "User-Agent": "videoflow-worker", "X-GitHub-Api-Version": "2022-11-28", ...(init.headers || {}) },
  });
  if (res.status === 204) return null;
  const body = await res.json().catch(() => ({}));
  if (res.status === 404) return null;
  if (!res.ok) throw new HttpError(502, `GitHub (${res.status}): ${body.message || "error"}`);
  return body;
}

async function listCycles(env) {
  const ref = encodeURIComponent(env.GITHUB_BRANCH);
  const dirs = (await gh(env, `/repos/${env.GITHUB_REPO}/contents/content/cycles?ref=${ref}`)) || [];
  const cycles = [];
  for (const d of dirs.filter((x) => x.type === "dir")) {
    const piezas = (await gh(env, `/repos/${env.GITHUB_REPO}/contents/content/cycles/${encodeURIComponent(d.name)}/piezas?ref=${ref}`)) || [];
    cycles.push({ id: d.name, piezas: piezas.filter((p) => p.type === "dir").map((p) => p.name) });
  }
  return cycles.sort((a, b) => b.id.localeCompare(a.id));
}

async function saveToCycle(env, origin, { generationId, cycle, pieza, filename }) {
  if (![cycle, pieza, filename].every((v) => SAFE_NAME.test(v || ""))) throw new HttpError(400, "Nombre de ciclo, pieza o archivo inválido (solo letras, números, guiones y puntos).");
  const gen = await getDoc(env, "generations", generationId);
  if (!gen || gen.status !== "completed") throw new HttpError(400, "La generación no está lista.");
  const videoUrl = gen.videoKey ? `${origin}${await signMedia(env, gen.videoKey, 6 * 3600_000)}` : gen.videoUrl;
  if (!videoUrl) throw new HttpError(400, "La generación no tiene video.");
  await gh(env, `/repos/${env.GITHUB_REPO}/actions/workflows/videoflow-save.yml/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: env.GITHUB_BRANCH, inputs: { video_url: videoUrl, cycle, pieza, filename: filename.endsWith(".mp4") ? filename : `${filename}.mp4` } }),
  });
  gen.savedTo = [...(gen.savedTo || []), `content/cycles/${cycle}/piezas/${pieza}/media/${filename.endsWith(".mp4") ? filename : `${filename}.mp4`}`];
  await putDoc(env, "generations", gen);
  return gen;
}

// ---------- Router ----------
async function readBody(request) {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "JSON inválido.");
  }
}

async function handleApi(request, env, ctx, url) {
  const { pathname } = url;
  const method = request.method;

  if (pathname === "/api/status") {
    return json({
      authed: await isAuthed(request, env),
      configured: Boolean(env.APP_PASSWORD && env.SESSION_SECRET),
      higgsfield: Boolean(env.HF_CREDENTIALS),
      claude: Boolean(env.ANTHROPIC_API_KEY),
      github: Boolean(env.GITHUB_TOKEN),
      r2: Boolean(env.MEDIA),
    });
  }

  if (pathname === "/api/login" && method === "POST") {
    if (!env.APP_PASSWORD || !env.SESSION_SECRET) throw new HttpError(503, "Faltan los secrets APP_PASSWORD y SESSION_SECRET.");
    const { password } = await readBody(request);
    if (!safeEqual(await hmac(env.SESSION_SECRET, String(password || "")), await hmac(env.SESSION_SECRET, env.APP_PASSWORD))) {
      await new Promise((r) => setTimeout(r, 800));
      throw new HttpError(401, "Contraseña incorrecta.");
    }
    return json({ ok: true }, 200, { "Set-Cookie": `vf_session=${await createSession(env)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}` });
  }

  if (pathname === "/api/logout" && method === "POST") {
    return json({ ok: true }, 200, { "Set-Cookie": "vf_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" });
  }

  const mediaMatch = /^\/api\/media\/([\w./-]+)$/.exec(pathname);
  if (mediaMatch && method === "GET" && url.searchParams.has("sig")) {
    if (!(await validMediaSig(env, mediaMatch[1], url))) throw new HttpError(403, "Enlace vencido.");
    return serveMedia(env, mediaMatch[1], request);
  }

  if (!(await isAuthed(request, env))) throw new HttpError(401, "Inicia sesión.");

  if (pathname === "/api/bootstrap" && method === "GET") return json(await allDocs(env));

  const docMatch = /^\/api\/docs\/(\w+)\/([\w-]+)$/.exec(pathname);
  if (docMatch) {
    const [, store, id] = docMatch;
    if (!STORES.has(store)) throw new HttpError(404, "Colección desconocida.");
    if (method === "PUT") {
      const doc = await readBody(request);
      if (!doc || typeof doc !== "object" || doc.id !== id) throw new HttpError(400, "Documento inválido.");
      return json(await putDoc(env, store, doc));
    }
    if (method === "DELETE") {
      await env.DB.prepare("DELETE FROM docs WHERE store = ? AND id = ?").bind(store, id).run();
      return json({ ok: true });
    }
  }

  if (pathname === "/api/media" && method === "POST") {
    const contentType = (request.headers.get("Content-Type") || "").split(";")[0].trim();
    if (!UPLOAD_TYPES.has(contentType)) throw new HttpError(415, "Formato no soportado. Usa JPG, PNG, WEBP, MP4 o WAV.");
    const size = Number(request.headers.get("Content-Length"));
    if (!size) throw new HttpError(411, "Falta Content-Length.");
    if (size > MAX_UPLOAD_R2) throw new HttpError(413, "Archivo demasiado grande (máx. 95 MB).");
    const key = await storeMedia(env, { body: env.MEDIA ? request.body : await request.arrayBuffer(), contentType, size });
    return json({ key, contentType, size });
  }

  if (mediaMatch && method === "GET") return serveMedia(env, mediaMatch[1], request);
  if (mediaMatch && method === "DELETE") {
    await deleteMedia(env, mediaMatch[1]);
    return json({ ok: true });
  }

  if (pathname === "/api/estimate" && method === "POST") {
    const { model, input } = await readBody(request);
    const result = await hfFetch(env, `/estimate/${checkModel(model)}`, { method: "POST", body: JSON.stringify(input || {}) });
    return json(result);
  }

  if (pathname === "/api/generate" && method === "POST") {
    const { model, input, media, doc } = await readBody(request);
    checkModel(model);
    const gen = {
      ...(doc || {}),
      id: crypto.randomUUID(),
      model,
      input,
      media,
      status: "submitting",
      createdAt: Date.now(),
    };
    await putDoc(env, "generations", gen);
    try {
      const payload = await resolveMedia(env, input || {}, media);
      const submitted = await hfFetch(env, `/${model}`, { method: "POST", body: JSON.stringify(payload) });
      gen.requestId = submitted.request_id;
      gen.status = submitted.status || "queued";
    } catch (err) {
      gen.status = "failed";
      gen.error = err.message;
    }
    return json(await putDoc(env, "generations", gen));
  }

  const genMatch = /^\/api\/generations\/([\w-]+)\/(refresh|cancel)$/.exec(pathname);
  if (genMatch && method === "POST") {
    const gen = await getDoc(env, "generations", genMatch[1]);
    if (!gen) throw new HttpError(404, "Generación no encontrada.");
    if (genMatch[2] === "refresh") return json(await refreshGeneration(env, gen));
    if (gen.status !== "queued") throw new HttpError(400, "Solo se puede cancelar mientras está en cola.");
    await hfFetch(env, `/requests/${gen.requestId}/cancel`, { method: "POST" });
    gen.status = "canceled";
    gen.error = "Cancelada (reembolsada).";
    return json(await putDoc(env, "generations", gen));
  }

  if (pathname === "/api/enhance" && method === "POST") {
    const body = await readBody(request);
    if (!String(body.idea || "").trim()) throw new HttpError(400, "Escribe una idea primero.");
    if (body.dryRun || !env.ANTHROPIC_API_KEY) return json({ manual: true, text: `${CLAUDE_SYSTEM}\n\n${enhanceInstructions(body)}` });
    return json(await runClaude(env, body));
  }

  if (pathname === "/api/cycles" && method === "GET") return json({ cycles: await listCycles(env) });

  if (pathname === "/api/save-to-cycle" && method === "POST") {
    return json(await saveToCycle(env, url.origin, await readBody(request)));
  }

  throw new HttpError(404, "Ruta no encontrada.");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      return await handleApi(request, env, ctx, url);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error(err);
      return json({ error: err.message || "Error interno" }, status);
    }
  },

  // Cada 10 minutos termina de procesar generaciones pendientes aunque nadie tenga la app abierta.
  async scheduled(event, env, ctx) {
    const since = Date.now() - 48 * 3600_000;
    const { results } = await env.DB.prepare("SELECT data FROM docs WHERE store = 'generations' AND updated_at > ?").bind(since).all();
    for (const row of results) {
      const gen = JSON.parse(row.data);
      if (PENDING.has(gen.status)) ctx.waitUntil(refreshGeneration(env, gen).catch((err) => console.error(err)));
    }
  },
};

import http from "node:http";
import { readFile, mkdir, readdir, writeFile, stat } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config, higgsfield } from "@higgsfield/client/v2";
import { HiggsfieldClient } from "@higgsfield/client";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const CYCLES_DIR = path.resolve(ROOT, "../content/cycles");
const PORT = Number(process.env.PORT) || 5173;
const HOST = "127.0.0.1";
const MAX_BODY = 30 * 1024 * 1024;
const SAFE_NAME = /^\w[\w.-]*$/;

const credentials = process.env.HF_CREDENTIALS || "";
let uploader = null;
if (credentials) {
  config({ credentials, maxPollTime: 15 * 60 * 1000 });
  const [apiKey, apiSecret] = credentials.split(":");
  uploader = new HiggsfieldClient({ apiKey, apiSecret });
}

const claudeAvailable = (() => {
  try {
    execFileSync("claude", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

const jobs = new Map();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error("Archivo demasiado grande (máx. 30 MB)"), { status: 413 });
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function uploadDataUrl(dataUrl) {
  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/.exec(dataUrl || "");
  if (!match) throw Object.assign(new Error("Formato de imagen no soportado (usa PNG, JPG o WEBP)"), { status: 400 });
  const format = match[1] === "jpg" ? "jpeg" : match[1];
  return uploader.uploadImage(Buffer.from(match[2], "base64"), format);
}

function friendlyError(err) {
  if (err?.name === "NotEnoughCreditsError" || /credits/i.test(err?.message)) return "Tu cuenta de la API de Higgsfield no tiene créditos suficientes.";
  if (err?.name === "AuthenticationError") return "Credenciales de Higgsfield inválidas. Revisa HF_CREDENTIALS en .env.local.";
  if (err?.name === "TimeoutError") return "La generación tardó demasiado. Revisa tu historial en Higgsfield.";
  if (err?.response?.status === 401) return "Credenciales de Higgsfield inválidas. Revisa HF_CREDENTIALS en .env.local.";
  if (err?.response?.status === 403) return "Higgsfield rechazó la solicitud (403): normalmente la cuenta de la API no tiene créditos.";
  return err?.message || "Error desconocido";
}

async function runJob(job, input) {
  try {
    job.status = "uploading";
    const payload = {
      prompt: input.prompt,
      duration: input.duration,
      resolution: input.resolution,
      generate_audio: input.generate_audio,
    };
    let model = "bytedance/seedance-2.5/text-to-video";
    if (input.start_image) {
      model = "bytedance/seedance-2.5/image-to-video";
      payload.image_url = await uploadDataUrl(input.start_image);
      if (input.end_image) payload.end_image_url = await uploadDataUrl(input.end_image);
    } else {
      payload.aspect_ratio = input.aspect_ratio;
    }
    job.model = model;
    job.status = "generating";
    const result = await higgsfield.subscribe(model, { input: payload, withPolling: true });
    job.requestId = result.request_id;
    if (result.status === "completed" && result.video?.url) {
      job.status = "completed";
      job.videoUrl = result.video.url;
    } else {
      job.status = "failed";
      job.error = result.status === "nsfw" ? "Bloqueado por moderación de contenido." : `La generación terminó con estado "${result.status}".`;
    }
  } catch (err) {
    job.status = "failed";
    job.error = friendlyError(err);
  }
}

function validateGenerate(body) {
  const prompt = String(body.prompt || "").trim();
  if (!prompt && !body.start_image) return "Escribe un prompt o agrega un frame inicial.";
  const duration = Number(body.duration);
  if (!Number.isInteger(duration) || duration < 4 || duration > 30) return "La duración debe estar entre 4 y 30 segundos.";
  if (!["480p", "720p"].includes(body.resolution)) return "Resolución inválida.";
  if (!["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"].includes(body.aspect_ratio)) return "Aspecto inválido.";
  if (body.end_image && !body.start_image) return "El frame final requiere un frame inicial.";
  return null;
}

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", "--output-format", "text"], { cwd: tmpdir() });
    let out = "";
    let errOut = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), 120_000);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (errOut += d));
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0 && out.trim()) resolve(out.trim());
      else reject(new Error(errOut.trim() || "Claude no devolvió respuesta. ¿Ejecutaste `claude` y te logueaste con tu cuenta Pro?"));
    });
    child.stdin.end(prompt);
  });
}

function buildEnhancePrompt({ prompt, style, client, mode }) {
  const lines = [
    "Eres director de fotografía y prompt engineer experto en modelos de video IA (Seedance, Kling, Veo).",
    mode === "variations"
      ? "Escribe 3 variaciones distintas del prompt de video. Devuelve SOLO las 3 variaciones, una por línea, sin numeración ni comillas."
      : "Reescribe el prompt de video para que sea visualmente preciso: sujeto, acción, entorno, iluminación, lente/movimiento de cámara, atmósfera. Devuelve SOLO el prompt final en un párrafo, sin explicaciones ni comillas.",
    "Escribe el prompt en inglés (los modelos rinden mejor), máximo 90 palabras.",
  ];
  if (style) lines.push(`Estilo visual a respetar: ${style}`);
  if (client) lines.push(`Contexto de marca del cliente: ${client}`);
  lines.push("", `Idea original: ${prompt}`);
  return lines.join("\n");
}

async function listCycles() {
  try {
    const cycles = [];
    for (const entry of await readdir(CYCLES_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      let piezas = [];
      try {
        piezas = (await readdir(path.join(CYCLES_DIR, entry.name, "piezas"), { withFileTypes: true }))
          .filter((d) => d.isDirectory())
          .map((d) => d.name);
      } catch {}
      cycles.push({ id: entry.name, piezas });
    }
    return cycles.sort((a, b) => b.id.localeCompare(a.id));
  } catch {
    return [];
  }
}

async function saveToCycle({ url, cycle, pieza, filename }) {
  if (![cycle, pieza, filename].every((v) => SAFE_NAME.test(v || ""))) throw Object.assign(new Error("Nombre de ciclo, pieza o archivo inválido."), { status: 400 });
  if (!/^https:\/\//.test(url || "")) throw Object.assign(new Error("URL de video inválida."), { status: 400 });
  const dir = path.join(CYCLES_DIR, cycle, "piezas", pieza, "media");
  if (!dir.startsWith(CYCLES_DIR + path.sep)) throw Object.assign(new Error("Ruta fuera de content/cycles."), { status: 400 });
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo descargar el video (${response.status}).`);
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, filename.endsWith(".mp4") ? filename : `${filename}.mp4`);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
  return path.relative(path.resolve(ROOT, ".."), file);
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) return send(res, 403, { error: "Prohibido" });
  try {
    if (!(await stat(file)).isFile()) throw new Error();
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    send(res, 404, { error: "No encontrado" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, "http://x");

    if (req.method === "GET" && pathname === "/api/status") {
      return send(res, 200, { higgsfield: Boolean(credentials), claude: claudeAvailable });
    }

    if (req.method === "POST" && pathname === "/api/generate") {
      if (!credentials) return send(res, 503, { error: "Falta HF_CREDENTIALS en .env.local." });
      const body = await readJson(req);
      const invalid = validateGenerate(body);
      if (invalid) return send(res, 400, { error: invalid });
      const job = { id: randomUUID(), status: "queued", createdAt: Date.now() };
      jobs.set(job.id, job);
      runJob(job, {
        prompt: String(body.prompt || "").trim(),
        duration: Number(body.duration),
        resolution: body.resolution,
        aspect_ratio: body.aspect_ratio,
        generate_audio: body.generate_audio !== false,
        start_image: body.start_image,
        end_image: body.end_image,
      });
      return send(res, 202, { jobId: job.id });
    }

    const jobMatch = /^\/api\/jobs\/([\w-]+)$/.exec(pathname);
    if (req.method === "GET" && jobMatch) {
      const job = jobs.get(jobMatch[1]);
      if (!job) return send(res, 404, { error: "Trabajo no encontrado (¿se reinició el servidor?)." });
      return send(res, 200, job);
    }

    if (req.method === "POST" && pathname === "/api/enhance") {
      if (!claudeAvailable) return send(res, 503, { error: "No se encontró el CLI `claude`. Instala Claude Code e inicia sesión con tu cuenta Pro." });
      const body = await readJson(req);
      if (!String(body.prompt || "").trim()) return send(res, 400, { error: "Escribe una idea primero." });
      const text = await runClaude(buildEnhancePrompt(body));
      const result = body.mode === "variations" ? { variations: text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 3) } : { prompt: text };
      return send(res, 200, result);
    }

    if (req.method === "GET" && pathname === "/api/cycles") {
      return send(res, 200, { cycles: await listCycles() });
    }

    if (req.method === "POST" && pathname === "/api/save-to-cycle") {
      const saved = await saveToCycle(await readJson(req));
      return send(res, 200, { path: saved });
    }

    if (req.method === "GET") return serveStatic(req, res);
    send(res, 405, { error: "Método no permitido" });
  } catch (err) {
    send(res, err.status || 500, { error: friendlyError(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`VideoFlow listo en http://${HOST}:${PORT}`);
  console.log(`  Higgsfield: ${credentials ? "configurado" : "FALTA HF_CREDENTIALS en .env.local"}`);
  console.log(`  Claude (suscripción vía CLI): ${claudeAvailable ? "disponible" : "no encontrado"}`);
});

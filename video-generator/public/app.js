// VideoFlow Studio — una sola página: compositor completo + feed + biblioteca en panel lateral.

// ---------- Utilidades DOM ----------
const $ = (sel) => document.querySelector(sel);
const uid = () => crypto.randomUUID();

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k in el && typeof v !== "string") el[k] = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

function toast(message, type = "info") {
  const el = h("div", { class: `toast ${type === "error" ? "error" : ""}` }, message);
  $("#toasts").append(el);
  setTimeout(() => el.remove(), type === "error" ? 8000 : 3500);
}

function storeGet(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(`vf2:${key}`)) ?? fallback;
  } catch {
    return fallback;
  }
}
function storeSet(key, value) {
  try {
    localStorage.setItem(`vf2:${key}`, JSON.stringify(value));
  } catch {}
}

const modal = $("#modal");
function openModal({ title, body, actions = [], wide = false }) {
  $("#modal-title").textContent = title;
  $("#modal-body").replaceChildren(...[].concat(body));
  $("#modal-foot").replaceChildren(
    ...actions.map((a) =>
      h("button", {
        type: "button",
        class: a.class || "btn-secondary",
        onclick: async (e) => {
          const btn = e.currentTarget;
          btn.disabled = true;
          try {
            if ((await a.onClick?.()) !== false) modal.close();
          } catch (err) {
            toast(err.message, "error");
          } finally {
            btn.disabled = false;
          }
        },
      }, a.label),
    ),
  );
  modal.classList.toggle("wide", wide);
  if (!modal.open) modal.showModal();
}
function field(label, input, hint) {
  return h("label", { class: "field" }, h("span", {}, label), input, hint && h("small", {}, hint));
}
function selectEl(options, value) {
  return h("select", {}, options.map(([v, l]) => h("option", { value: v, selected: v === value }, l)));
}
function confirmModal(title, text, onConfirm) {
  openModal({ title, body: h("p", { class: "muted" }, text), actions: [{ label: "Cancelar" }, { label: "Eliminar", class: "btn-danger", onClick: onConfirm }] });
}
function ratioBox(aspect, size = 14) {
  const [w, hh] = String(aspect).split(":").map(Number);
  if (!w || !hh) return null;
  const s = size / Math.max(w, hh);
  return h("span", { class: "ratio-box", style: { width: `${w * s}px`, height: `${hh * s}px` } });
}
const money = (usd) => (usd >= 10 ? `$${usd.toFixed(1)}` : `$${usd.toFixed(usd < 1 ? 3 : 2)}`);

// ---------- API ----------
class ApiError extends Error {}
async function api(path, { method = "GET", body, raw, headers } = {}) {
  const res = await fetch(path, {
    method,
    headers: raw ? headers : body ? { "Content-Type": "application/json" } : undefined,
    body: raw || (body ? JSON.stringify(body) : undefined),
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/api/login") showLogin();
  if (!res.ok) throw new ApiError(data.error || `Error ${res.status}`);
  return data;
}
const mediaUrl = (key) => `/api/media/${key}`;

// ---------- Estado ----------
const STORES = ["clients", "projects", "elements", "styles", "formats", "generations"];
const S = Object.fromEntries(STORES.map((s) => [s, []]));
let catalog = { families: [] };
const byId = (store, id) => S[store].find((x) => x.id === id);

const ui = {
  clientId: storeGet("clientId", ""),
  projectId: storeGet("projectId", ""),
  feedFilter: "all",
  feedSearch: "",
  status: {},
  libTab: "character",
  libSearch: "",
  pick: null, // { slotId, max, selected: string[] }
  estimate: null,
};

const EMPTY_SLOTS = () => ({ start: [], end: [], character: [], product: [], look: [], location: [], video: [], audio: [] });
const comp = Object.assign(
  { familySlug: "seedance-2-5", tier: "", mode: "auto", prompt: "", negative: "", slots: EMPTY_SLOTS(), styleId: "", camera: "", values: {} },
  storeGet("comp", {}),
);
comp.slots = { ...EMPTY_SLOTS(), ...comp.slots };
const saveComp = () => storeSet("comp", comp);

const ELEMENT_KINDS = [
  { id: "character", label: "Personajes", one: "Personaje", role: "main character" },
  { id: "product", label: "Productos", one: "Producto", role: "product" },
  { id: "look", label: "Looks", one: "Look / estilo", role: "visual style reference" },
  { id: "location", label: "Locaciones", one: "Locación", role: "location / environment" },
  { id: "frame", label: "Frames", one: "Frame", role: "frame" },
  { id: "video", label: "Videos", one: "Video", role: "reference video" },
  { id: "audio", label: "Audios", one: "Audio", role: "reference audio" },
];
const MANAGE_TABS = [
  { id: "clients", label: "Clientes" },
  { id: "projects", label: "Proyectos" },
  { id: "styles", label: "Estilos" },
  { id: "formats", label: "Formatos" },
];
const SLOTS = [
  { id: "start", label: "Inicio", icon: "▶", media: "image", max: 1, kind: "frame", role: "opening frame (first frame of the video)" },
  { id: "end", label: "Final", icon: "■", media: "image", max: 1, kind: "frame", role: "closing frame (last frame of the video)" },
  { id: "character", label: "Personajes", icon: "☺", media: "image", max: 4, kind: "character", role: "main character" },
  { id: "product", label: "Producto", icon: "◆", media: "image", max: 3, kind: "product", role: "product" },
  { id: "look", label: "Estilo", icon: "✦", media: "image", max: 3, kind: "look", role: "visual style / look reference" },
  { id: "location", label: "Locación", icon: "⌂", media: "image", max: 2, kind: "location", role: "location / environment" },
  { id: "video", label: "Video", icon: "🎬", media: "video", max: 3, kind: "video", role: "reference video" },
  { id: "audio", label: "Audio", icon: "♪", media: "audio", max: 3, kind: "audio", role: "reference audio" },
];
const REF_SLOTS = ["character", "product", "look", "location"];

const CAMERAS = [
  ["", "Libre"],
  ["static shot, locked-off camera", "Fija"],
  ["slow dolly in toward the subject", "Dolly in"],
  ["slow dolly out revealing the scene", "Dolly out"],
  ["smooth tracking shot following the subject", "Tracking"],
  ["handheld camera, subtle natural shake", "Cámara en mano"],
  ["slow 360 orbit around the subject", "Órbita 360"],
  ["crane shot rising up", "Grúa"],
  ["aerial drone shot", "Dron"],
  ["slow pan from left to right", "Paneo"],
  ["fast whip pan transition", "Whip pan"],
  ["first-person POV shot", "POV"],
  ["macro close-up with shallow depth of field", "Macro"],
];

const DEFAULT_STYLES = [
  { name: "Cinemático", color: "#c6f432", prompt: "cinematic film look, anamorphic lens, shallow depth of field, soft volumetric light, rich color grading, 35mm film grain" },
  { name: "UGC / Selfie", color: "#ff9f5a", prompt: "authentic handheld smartphone footage, natural daylight, casual real-life setting, person talking to camera" },
  { name: "Producto en estudio", color: "#7cc8ff", prompt: "premium product commercial, seamless studio backdrop, crisp softbox lighting, glossy reflections, macro details" },
  { name: "Documental", color: "#e3d9c6", prompt: "documentary style, natural available light, candid moments, muted realistic colors" },
  { name: "Neón nocturno", color: "#c77dff", prompt: "night city, neon signs, wet reflective streets, cyberpunk color palette, moody atmosphere" },
  { name: "Anime", color: "#ff6b9a", prompt: "high quality 2D anime style, vibrant colors, clean line art, expressive lighting" },
];
const DEFAULT_FORMATS = [
  { name: "Reels / TikTok", aspect: "9:16", duration: 8, resolution: "720p" },
  { name: "Feed IG", aspect: "3:4", duration: 6, resolution: "720p" },
  { name: "Cuadrado", aspect: "1:1", duration: 5, resolution: "720p" },
  { name: "YouTube / Web", aspect: "16:9", duration: 10, resolution: "1080p" },
  { name: "Borrador barato", aspect: "16:9", duration: 5, resolution: "480p" },
];

// ---------- Persistencia ----------
async function saveDoc(store, doc) {
  const saved = await api(`/api/docs/${store}/${doc.id}`, { method: "PUT", body: doc });
  const i = S[store].findIndex((x) => x.id === doc.id);
  if (i >= 0) S[store][i] = saved;
  else S[store].push(saved);
  return saved;
}
async function deleteDoc(store, id) {
  await api(`/api/docs/${store}/${id}`, { method: "DELETE" });
  S[store] = S[store].filter((x) => x.id !== id);
}

// ---------- Catálogo de modelos ----------
const MEDIA_PARAMS = {
  start: ["image_url", "first_frame_url"],
  end: ["end_image_url", "last_frame_url", "last_image_url"],
  video: ["video_url", "video_urls"],
  audio: ["audio_url", "audio_urls"],
};
const SKIP_PARAMS = new Set(["prompt", "negative_prompt", "image_url", "first_frame_url", "end_image_url", "last_frame_url", "last_image_url", "image_urls", "video_url", "video_urls", "audio_url", "audio_urls", "multi_prompt", "multi_shots", "elements", "file_url", "link_url"]);
const MAIN_PARAMS = ["duration", "aspect_ratio", "resolution", "mode", "generate_audio", "sound"];
const PARAM_LABELS = {
  duration: "Duración", aspect_ratio: "Aspecto", resolution: "Calidad", mode: "Nivel Kling", generate_audio: "Audio", sound: "Audio",
  seed: "Seed", cfg_scale: "Fidelidad al prompt (CFG)", bitrate_mode: "Bitrate", output_format: "Archivo", fps: "FPS",
  prompt_optimizer: "Optimizar prompt (Hailuo)", prompt_extend: "Ampliar prompt automáticamente", enable_thinking: "Deep thinking",
  aigc_watermark: "Marca de agua IA", keep_original_sound: "Mantener sonido original", character_orientation: "Orientación del personaje",
  shot_type: "Tipo de toma", camera_movement: "Movimiento de cámara (nativo)", camera_model: "Cámara", camera_lens: "Lente",
  camera_aperture: "Apertura", era: "Época", genre: "Género", light: "Luz", pacing: "Ritmo", color_palette: "Paleta de color",
};
const KIND_LABELS = { text: "Texto", image: "Imagen", reference: "Referencias", edit: "Edición", extend: "Extender", motion: "Movimiento", swap: "Cambio de objeto" };
const KIND_HINTS = {
  text: "Texto a video: solo con tu prompt. Agrega un frame de Inicio para animar una imagen.",
  image: "Imagen a video: anima el frame de Inicio (y llega al Final si el modelo lo permite).",
  reference: "Referencias: usa tus personajes, productos, looks y locaciones como guía visual.",
  edit: "Editar video: sube el video en el espacio Video y describe el cambio.",
  extend: "Extender video: sube el video en el espacio Video y describe cómo continúa.",
  motion: "Movimiento: copia el movimiento del Video a la persona del frame de Inicio.",
  swap: "Cambio de objeto: reemplaza un objeto/persona del Video por tus imágenes de referencia.",
};
const TIERS = /^(Pro|Standard|4K|Turbo|Fast)$/;

const family = () => catalog.families.find((f) => f.slug === comp.familySlug) || catalog.families[0];
const tierOf = (wf) => wf.label.split(" · ").find((p) => TIERS.test(p)) || "";
function tiersOf(fam) {
  return [...new Set(fam.workflows.map(tierOf).filter(Boolean))];
}
function defaultTier(fam) {
  const tiers = tiersOf(fam);
  return tiers.includes("Pro") ? "Pro" : tiers[0] || "";
}
function tierWorkflows(fam) {
  const tiers = tiersOf(fam);
  if (!tiers.length) return fam.workflows;
  if (!tiers.includes(comp.tier)) comp.tier = defaultTier(fam);
  return fam.workflows.filter((w) => tierOf(w) === comp.tier || !tierOf(w));
}
const firstParam = (wf, list) => list.find((p) => wf.params[p]);

// ---------- Referencias del compositor ----------
function slotEntries(slotId) {
  return comp.slots[slotId].map((id) => byId("elements", id)).filter(Boolean);
}
function elementMedia(el, type) {
  return (el.media || []).filter((m) => m.type === type);
}

// Decide cómo se usan las referencias con un flujo concreto.
function planFor(wf) {
  const plan = { media: {}, ignored: new Set(), asRef: new Set(), missing: [], warnings: [], imageRefs: [], textRefs: [] };
  const imgParam = wf.params.image_urls;
  const maxImgs = imgParam?.maxItems ?? 30;
  const images = [];

  for (const slotId of ["start", "end"]) {
    const el = slotEntries(slotId)[0];
    const img = el && elementMedia(el, "image")[0];
    if (!img) continue;
    const def = SLOTS.find((s) => s.id === slotId);
    const param = firstParam(wf, MEDIA_PARAMS[slotId]);
    if (param) plan.media[param] = img.key;
    else if (imgParam) {
      images.push({ key: img.key, role: def.role, name: el.name, description: el.description });
      plan.asRef.add(slotId);
    } else plan.ignored.add(slotId);
  }

  for (const slotId of REF_SLOTS) {
    const def = SLOTS.find((s) => s.id === slotId);
    for (const el of slotEntries(slotId)) {
      const imgs = elementMedia(el, "image");
      plan.textRefs.push({ role: def.role, name: el.name, description: el.description, key: imgs[0]?.key });
      if (imgParam) imgs.forEach((m, i) => images.push({ key: m.key, role: def.role, name: el.name, description: i === 0 ? el.description : "", angle: i > 0 }));
      else if (imgs.length) plan.ignored.add(slotId);
    }
  }
  if (images.length > maxImgs) plan.warnings.push(`Este modo acepta máximo ${maxImgs} imágenes; se usarán las primeras ${maxImgs}.`);
  plan.imageRefs = images.slice(0, maxImgs);
  if (imgParam && plan.imageRefs.length) plan.media.image_urls = plan.imageRefs.map((r) => r.key);

  for (const slotId of ["video", "audio"]) {
    const keys = slotEntries(slotId).flatMap((el) => elementMedia(el, slotId)).map((m) => m.key);
    if (!keys.length) continue;
    const param = firstParam(wf, MEDIA_PARAMS[slotId]);
    if (!param) {
      plan.ignored.add(slotId);
      continue;
    }
    if (param.endsWith("_urls")) {
      const max = wf.params[param].maxItems ?? 10;
      if (keys.length > max) plan.warnings.push(`Máximo ${max} ${slotId === "video" ? "videos" : "audios"} en este modo.`);
      plan.media[param] = keys.slice(0, max);
    } else {
      if (keys.length > 1) plan.warnings.push(`Este modo usa solo 1 ${slotId}; se tomará el primero.`);
      plan.media[param] = keys[0];
    }
  }

  const hasPrompt = Boolean(comp.prompt.trim()) || plan.textRefs.length > 0;
  const has = (p) => (p === "prompt" ? hasPrompt : SKIP_PARAMS.has(p) ? Boolean(plan.media[p]) : true);
  for (const r of wf.required) if (!has(r)) plan.missing.push(r);
  if (wf.oneOf?.length && !wf.oneOf.some((group) => group.every(has))) plan.missing.push(wf.oneOf.map((g) => g.join("+")).join(" o "));
  plan.score = -50 * plan.missing.length - 10 * plan.ignored.size - 2 * plan.asRef.size;
  return plan;
}

function currentWorkflow() {
  const fam = family();
  const wfs = tierWorkflows(fam);
  if (comp.mode !== "auto") {
    const wf = fam.workflows.find((w) => w.id === comp.mode);
    if (wf) return { wf, plan: planFor(wf) };
    comp.mode = "auto";
  }
  let best = null;
  for (const wf of wfs) {
    const plan = planFor(wf);
    if (!best || plan.score > best.plan.score) best = { wf, plan };
  }
  return best;
}

const MISSING_LABELS = { prompt: "un prompt", image_url: "un frame de inicio", first_frame_url: "un frame de inicio", video_url: "un video de referencia", video_urls: "un video de referencia", image_urls: "imágenes de referencia", audio_urls: "un audio" };
const missingText = (plan) => plan.missing.map((m) => MISSING_LABELS[m] || m.replace(/_/g, " ")).join(", ");

// ---------- Parámetros ----------
function coerce(param, spec, value) {
  if (spec.enum) {
    if (spec.enum.includes(value)) return value;
    if (param === "aspect_ratio" && value && !spec.enum.includes(value)) {
      const [w, hh] = String(value).split(":").map(Number);
      const target = w / hh;
      const numeric = spec.enum.filter((e) => /^\d+:\d+$/.test(e));
      if (numeric.length && target) return numeric.reduce((a, b) => (Math.abs(ratio(b) - target) < Math.abs(ratio(a) - target) ? b : a));
    }
    if (param === "resolution" && value) {
      const order = ["360p", "480p", "540p", "720p", "1080p", "2k", "2K", "4k"];
      const want = order.indexOf(value);
      const ranked = spec.enum.filter((e) => order.includes(e)).sort((a, b) => Math.abs(order.indexOf(a) - want) - Math.abs(order.indexOf(b) - want));
      if (ranked.length) return ranked[0];
    }
    if (typeof spec.enum[0] === "number" && typeof value === "number") return spec.enum.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));
    return spec.default ?? (spec.enum.length && isOptionalEnum(spec) ? "" : spec.enum[0]);
  }
  if (spec.type === "boolean") return typeof value === "boolean" ? value : spec.default ?? false;
  if (spec.type === "integer" || spec.type === "number") {
    if (value === "" || value == null) return spec.default ?? (param === "seed" ? "" : spec.minimum ?? 0);
    let n = Number(value);
    if (Number.isNaN(n)) return spec.default ?? "";
    if (spec.minimum != null) n = Math.max(spec.minimum, n);
    if (spec.maximum != null) n = Math.min(spec.maximum, n);
    return spec.type === "integer" ? Math.round(n) : n;
  }
  return value ?? spec.default ?? "";
}
const ratio = (a) => {
  const [w, hh] = a.split(":").map(Number);
  return w / hh;
};
const isOptionalEnum = (spec) => spec.default === undefined;

function paramValue(wf, param) {
  const spec = wf.params[param];
  return spec ? coerce(param, spec, comp.values[param]) : comp.values[param];
}

function buildInput(wf, plan) {
  const input = {};
  for (const [param, spec] of Object.entries(wf.params)) {
    if (SKIP_PARAMS.has(param)) continue;
    const v = paramValue(wf, param);
    if (v === "" || v == null) continue;
    input[param] = spec.type === "integer" || spec.type === "number" ? Number(v) : v;
  }
  if (wf.params.prompt) {
    const p = finalPrompt(wf, plan);
    if (p) input.prompt = p;
  }
  if (wf.params.negative_prompt && comp.negative.trim()) input.negative_prompt = comp.negative.trim();
  return input;
}

function finalPrompt(wf, plan) {
  const parts = [comp.prompt.trim()];
  const style = byId("styles", comp.styleId);
  if (style?.prompt) parts.push(`Style: ${style.prompt}.`);
  if (comp.camera) parts.push(`Camera: ${comp.camera}.`);
  const tokenStyle = wf.id.startsWith("higgsfield/cinema-studio");
  if (plan.imageRefs.length) {
    plan.imageRefs.forEach((r, i) => {
      if (r.angle) return;
      const ref = tokenStyle ? `<<<image_${i + 1}>>>` : `Reference image ${i + 1}`;
      parts.push(`${ref} is the ${r.role}${r.name ? ` "${r.name}"` : ""}${r.description ? `: ${r.description}` : ""}.`);
    });
  } else {
    for (const r of plan.textRefs) if (r.description || r.name) parts.push(`${cap(r.role)}${r.name ? ` "${r.name}"` : ""}${r.description ? `: ${r.description}` : ""}.`);
  }
  return parts.filter(Boolean).join("\n");
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- Costos ----------
const PLACEHOLDER = {
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
  video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  audio: "https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav",
};
const SHORT_SIDE = { "360p": 360, "480p": 480, "540p": 540, "720p": 720, "1080p": 1080, "2k": 1440, "2K": 1440, "4k": 2160 };

function videoSeconds() {
  return slotEntries("video").flatMap((el) => elementMedia(el, "video")).reduce((n, m) => n + (m.duration || 0), 0);
}
function localPrice(wf, input) {
  const p = wf.pricing;
  if (!p) return null;
  const res = input.resolution || wf.params.resolution?.default || "720p";
  const secs = Number(input.duration || wf.params.duration?.default || 5);
  const vsecs = videoSeconds();
  if (p.type === "per_second") return { usd: secs * (p.rates[res] ?? p.rates["720p"]), approx: true };
  if (p.type === "per_input_second") {
    const rate = p.rates[res] ?? p.rates["720p"];
    return vsecs ? { usd: Math.ceil(vsecs) * rate, approx: true } : { usd: null, note: `${money(rate)} por segundo de video de entrada` };
  }
  if (p.type === "tokens") {
    const short = SHORT_SIDE[res] || 720;
    const ar = /^\d+:\d+$/.test(input.aspect_ratio || "") ? input.aspect_ratio : "16:9";
    const [a, b] = ar.split(":").map(Number);
    const long = Math.round((short * Math.max(a, b)) / Math.min(a, b));
    const hasVideo = vsecs > 0;
    const rate = hasVideo && p.withVideoRate ? p.withVideoRate : p.rates[res.toLowerCase()] ?? p.rates.default;
    const billable = secs + (p.inputVideo || (hasVideo && p.withVideoRate) ? vsecs : 0);
    const tokens = Math.ceil((billable * short * long * 24) / 1024);
    return { usd: (tokens / 1000) * rate, approx: true, note: p.inputVideo && !vsecs ? "+ segundos del video de entrada" : "" };
  }
  return null;
}

let estimateTimer = null;
const estimateCache = new Map();
function scheduleEstimate() {
  clearTimeout(estimateTimer);
  estimateTimer = setTimeout(runEstimate, 450);
}
async function runEstimate() {
  const cw = currentWorkflow();
  if (!cw) return;
  const { wf, plan } = cw;
  const input = buildInput(wf, plan);
  for (const [param, value] of Object.entries(plan.media)) {
    const type = param.startsWith("video") ? "video" : param.startsWith("audio") ? "audio" : "image";
    input[param] = Array.isArray(value) ? value.map(() => PLACEHOLDER[type]) : PLACEHOLDER[type];
  }
  if (!input.prompt && wf.params.prompt) input.prompt = "preview";
  const cacheKey = JSON.stringify([wf.id, input, videoSeconds()]);
  let result = estimateCache.get(cacheKey);
  if (!result && ui.status.authed) {
    try {
      const r = await api("/api/estimate", { method: "POST", body: { model: wf.id, input } });
      if (r.type === "estimate") result = { usd: Number(r.usd), credits: Number(r.credits), discount: r.discount };
      else result = { ...localPrice(wf, input), description: r.pricing_description };
    } catch (err) {
      result = { ...(localPrice(wf, input) || {}), error: err.message };
    }
    estimateCache.set(cacheKey, result);
  }
  ui.estimate = result || null;
  renderCost();
}
function renderCost() {
  const e = ui.estimate;
  const main = $("#cost-main");
  const sub = $("#cost-sub");
  const box = $("#cost");
  if (!e || (e.usd == null && !e.note)) {
    main.textContent = "—";
    sub.textContent = e?.error ? "Precio no disponible" : "Calculando precio…";
    box.title = e?.error || "";
    return;
  }
  if (e.usd == null) {
    main.textContent = "Variable";
    sub.textContent = e.note;
    return;
  }
  const credits = e.credits ?? e.usd * 16;
  main.textContent = `${e.approx ? "≈ " : ""}${money(e.usd)}`;
  const bits = [`${credits.toFixed(1)} créditos`];
  if (e.discount?.percentage) bits.push(`−${Number(e.discount.percentage).toFixed(0)}% desc.`);
  if (e.approx) bits.push("tarifa antes de descuentos");
  if (e.note) bits.push(e.note);
  sub.textContent = bits.join(" · ");
  box.title = e.description || "Precio estimado por Higgsfield para tu cuenta.";
}

// ---------- Render: modelo ----------
function renderModel() {
  const fam = family();
  if (!fam) return;
  $("#model-vendor").textContent = fam.vendor;
  $("#model-name").textContent = fam.name;
  const tiers = tiersOf(fam);
  if (tiers.length && !tiers.includes(comp.tier)) comp.tier = defaultTier(fam);
  $("#model-tiers").replaceChildren(
    ...tiers.map((t) =>
      h("button", { class: `chip ${t === comp.tier ? "active" : ""}`, type: "button", onclick: () => {
        comp.tier = t;
        comp.mode = "auto";
        refresh();
      } }, t),
    ),
  );
  $("#model-tiers").classList.toggle("hidden", !tiers.length);
  const cw = currentWorkflow();
  const autoWf = comp.mode === "auto" ? cw.wf : null;
  const wfs = tierWorkflows(fam);
  $("#model-mode").replaceChildren(
    h("option", { value: "auto" }, `Automático${autoWf ? ` · ${autoWf.label}` : ""}`),
    ...wfs.map((w) => h("option", { value: w.id, selected: w.id === comp.mode }, `${w.label} (${KIND_LABELS[w.kind] || w.kind})`)),
  );
  $("#model-docs").href = cw.wf.docs;
  const hints = [];
  if (cw.plan.missing.length) hints.push(`⚠ Falta: ${missingText(cw.plan)}.`);
  if (cw.plan.ignored.size) hints.push(`⚠ Este modo no usa: ${[...cw.plan.ignored].map((s) => SLOTS.find((x) => x.id === s).label).join(", ")}.`);
  hints.push(...cw.plan.warnings);
  if (cw.plan.ignored.size && [...cw.plan.ignored].some((x) => REF_SLOTS.includes(x))) hints.push("Para usar personajes/producto como imagen elige un modo de Referencias (Seedance, Kling O3, Wan, MiniMax, Cinema Studio…); aquí solo se añade su descripción al prompt.");
  if (!hints.length) hints.push(KIND_HINTS[cw.wf.kind] || fam.description);
  $("#model-hint").textContent = hints.join(" ");
}

function openModelPicker() {
  const fam = family();
  const groups = {};
  for (const f of catalog.families) (groups[f.vendor] ||= []).push(f);
  const card = (f) => {
    const kinds = [...new Set(f.workflows.map((w) => w.kind))];
    const durations = f.workflows.map((w) => w.params.duration).filter(Boolean);
    const maxDur = Math.max(0, ...durations.map((d) => d.maximum ?? Math.max(...(d.enum || [0]))));
    const res = [...new Set(f.workflows.flatMap((w) => w.params.resolution?.enum || []))];
    const audio = f.workflows.some((w) => w.params.generate_audio || w.params.sound);
    return h("button", { class: `family-card ${f.slug === fam.slug ? "active" : ""}`, type: "button", onclick: () => {
      comp.familySlug = f.slug;
      comp.tier = defaultTier(f);
      comp.mode = "auto";
      modal.close();
      refresh();
    } },
      h("strong", {}, f.name),
      h("p", {}, f.description),
      h("div", { class: "badges" },
        kinds.map((k) => h("span", { class: "badge" }, KIND_LABELS[k] || k)),
        maxDur ? h("span", { class: "badge" }, `hasta ${maxDur}s`) : null,
        res.length ? h("span", { class: "badge" }, res.at(-1)) : null,
        audio ? h("span", { class: "badge" }, "🔊 audio") : null,
      ),
    );
  };
  openModal({
    title: `Modelos de video (${catalog.families.length} familias, ${catalog.families.reduce((n, f) => n + f.workflows.length, 0)} modos)`,
    wide: true,
    body: h("div", { class: "family-list" }, Object.entries(groups).map(([vendor, fams]) => h("div", { class: "family-group" }, h("h3", {}, vendor), h("div", { class: "family-grid" }, fams.map(card))))),
  });
}

// ---------- Render: slots ----------
function slotAccepted(slotId) {
  const wfs = comp.mode === "auto" ? tierWorkflows(family()) : [currentWorkflow().wf];
  return wfs.some((wf) => {
    if (slotId === "start" || slotId === "end") return firstParam(wf, MEDIA_PARAMS[slotId]) || wf.params.image_urls;
    if (REF_SLOTS.includes(slotId)) return wf.params.image_urls || wf.params.prompt;
    return firstParam(wf, MEDIA_PARAMS[slotId]);
  });
}
function renderSlots() {
  const { plan } = currentWorkflow();
  $("#slots").replaceChildren(
    ...SLOTS.map((def) => {
      const els = slotEntries(def.id);
      const filled = els.length > 0;
      const thumbs = els.slice(0, 3).map((el) => {
        const m = el.media?.find((x) => x.type === def.media) || el.media?.[0];
        if (!m) return null;
        if (m.type === "image") return h("img", { src: mediaUrl(m.key), alt: el.name, loading: "lazy" });
        if (m.type === "video") return h("video", { src: `${mediaUrl(m.key)}#t=0.5`, muted: true, preload: "metadata" });
        return h("span", { class: "slot-icon" }, "♪");
      });
      const cls = ["slot", filled && "filled", (filled ? plan.ignored.has(def.id) : !slotAccepted(def.id)) && "unsupported", plan.asRef.has(def.id) && "as-ref"].filter(Boolean).join(" ");
      return h("button", { class: cls, type: "button", title: slotTitle(def, filled, plan), onclick: () => openPicker(def.id) },
        filled && h("span", { class: "thumbs" }, thumbs),
        !filled && h("span", { class: "slot-icon" }, def.icon),
        h("span", { class: "slot-label" }, filled && els.length === 1 ? els[0].name || def.label : def.label),
        filled && els.length > 1 && h("span", { class: "count" }, els.length),
        filled && h("span", { class: "clear", title: "Quitar", onclick: (e) => {
          e.stopPropagation();
          comp.slots[def.id] = [];
          refresh();
        } }, "✕"),
      );
    }),
  );
  const n = SLOTS.reduce((acc, s) => acc + comp.slots[s.id].length, 0);
  $("#refs-hint").textContent = n ? `${n} en uso` : "Toca un espacio para elegir o subir";
}
function slotTitle(def, filled, plan) {
  if (filled && plan.ignored.has(def.id)) return `${def.label}: el modo actual no usa esta referencia. Cambia de modo o de modelo.`;
  if (plan.asRef.has(def.id)) return `${def.label}: este modo no tiene frame nativo; se envía como imagen de referencia.`;
  return `${def.label} — clic para elegir de la biblioteca o subir`;
}

// ---------- Render: dirección y parámetros ----------
function renderStyles() {
  $("#styles").replaceChildren(
    h("button", { class: `chip ${!comp.styleId ? "active" : ""}`, type: "button", onclick: () => setComp({ styleId: "" }) }, "Ninguno"),
    ...S.styles.map((s) =>
      h("button", { class: `chip ${comp.styleId === s.id ? "active" : ""}`, type: "button", title: s.prompt, onclick: () => setComp({ styleId: s.id }) },
        h("span", { class: "dot", style: { background: s.color } }), s.name,
        h("span", { class: "edit", title: "Editar", onclick: (e) => {
          e.stopPropagation();
          editStyle(s);
        } }, "✎"),
      ),
    ),
  );
  $("#cameras").replaceChildren(...CAMERAS.map(([v, l]) => h("button", { class: `chip ${comp.camera === v ? "active" : ""}`, type: "button", title: v, onclick: () => setComp({ camera: v }) }, l)));
}

function renderFormats() {
  const { wf } = currentWorkflow();
  $("#formats").replaceChildren(
    ...S.formats.map((f) => {
      const active = paramValue(wf, "aspect_ratio") === f.aspect && Number(comp.values.duration) === Number(f.duration);
      return h("button", { class: `chip ${active ? "active" : ""}`, type: "button", onclick: () => applyFormat(f) },
        ratioBox(f.aspect), f.name, h("span", { class: "hint" }, `${f.duration}s`),
        h("span", { class: "edit", title: "Editar", onclick: (e) => {
          e.stopPropagation();
          editFormat(f);
        } }, "✎"),
      );
    }),
  );
}
function applyFormat(f) {
  comp.values.aspect_ratio = f.aspect;
  comp.values.duration = Number(f.duration);
  comp.values.resolution = f.resolution;
  refresh();
}

function paramControl(wf, param) {
  const spec = wf.params[param];
  const label = PARAM_LABELS[param] || spec.title || param.replace(/_/g, " ");
  const value = paramValue(wf, param);
  const set = (v) => {
    comp.values[param] = v;
    refresh();
  };
  // Para campos de texto/número/slider: actualiza sin redibujar el control (evita perder el clic siguiente).
  const setLight = (v) => {
    comp.values[param] = v;
    saveComp();
    renderFormats();
    renderPromptExtras();
    scheduleEstimate();
  };
  const head = (extra) => h("div", { class: "param-head" }, h("span", {}, label), extra);

  if (param === "sound" || (spec.type === "boolean")) {
    const checked = param === "sound" ? value === "on" : Boolean(value);
    return h("div", { class: "param" }, h("label", { class: "toggle" },
      h("input", { type: "checkbox", checked, onchange: (e) => {
        comp.values[param] = param === "sound" ? (e.target.checked ? "on" : "off") : e.target.checked;
        if (param === "sound") comp.values.generate_audio = e.target.checked;
        if (param === "generate_audio") comp.values.sound = e.target.checked ? "on" : "off";
        refresh();
      } }),
      h("span", { class: "toggle-track" }), h("span", {}, label)));
  }
  if (spec.enum) {
    const options = spec.enum.map(String);
    const optional = isOptionalEnum(spec) && !wf.required.includes(param);
    if (options.length <= 8 && param !== "color_palette" && param !== "camera_movement") {
      return h("div", { class: "param" }, head(),
        h("div", { class: "seg" },
          optional && h("button", { type: "button", class: value === "" ? "active" : "", onclick: () => set("") }, "Auto"),
          spec.enum.map((opt) => h("button", { type: "button", class: String(value) === String(opt) ? "active" : "", onclick: () => set(opt) }, param === "aspect_ratio" ? ratioBox(opt, 12) : null, param === "duration" ? `${opt}s` : String(opt))),
        ));
    }
    const sel = selectEl([...(optional ? [["", "Auto"]] : []), ...spec.enum.map((o) => [String(o), String(o).replace(/-/g, " ")])], String(value));
    sel.addEventListener("change", () => set(typeof spec.enum[0] === "number" ? Number(sel.value) : sel.value));
    return h("div", { class: "param" }, head(), sel);
  }
  if ((spec.type === "integer" || spec.type === "number") && spec.minimum != null && spec.maximum != null && spec.maximum - spec.minimum <= 100) {
    const out = h("output", {}, param === "duration" ? `${value}s` : String(value));
    const input = h("input", { type: "range", min: spec.minimum, max: spec.maximum, step: spec.multipleOf || (spec.type === "integer" ? 1 : 0.05), value });
    input.addEventListener("input", () => (out.textContent = param === "duration" ? `${input.value}s` : input.value));
    input.addEventListener("change", () => setLight(Number(input.value)));
    return h("div", { class: "param" }, head(out), input);
  }
  if (spec.type === "integer" || spec.type === "number") {
    const input = h("input", { type: "number", min: spec.minimum, max: spec.maximum, value, placeholder: param === "seed" ? "aleatorio" : "" });
    input.addEventListener("change", () => setLight(input.value === "" ? "" : Number(input.value)));
    return h("div", { class: "param" }, head(), input);
  }
  const input = h("input", { type: "text", value: value || "" });
  input.addEventListener("change", () => setLight(input.value));
  return h("div", { class: "param" }, head(), input);
}

function renderParams() {
  const { wf } = currentWorkflow();
  const params = Object.keys(wf.params).filter((p) => !SKIP_PARAMS.has(p));
  let main = MAIN_PARAMS.filter((p) => params.includes(p));
  if (main.includes("sound") && main.includes("generate_audio")) main = main.filter((p) => p !== "sound");
  const advanced = params.filter((p) => !main.includes(p));
  $("#params").replaceChildren(...main.map((p) => paramControl(wf, p)));
  $("#params-advanced").replaceChildren(...advanced.map((p) => paramControl(wf, p)));
  $("#advanced").classList.toggle("hidden", !advanced.length);
  $("#negative").classList.toggle("hidden", !wf.params.negative_prompt);
}

function renderPromptExtras() {
  const { wf, plan } = currentWorkflow();
  $("#prompt-count").textContent = comp.prompt.length ? `${comp.prompt.length} caracteres` : "";
  const fp = $("#final-prompt");
  if (!fp.classList.contains("hidden")) fp.textContent = finalPrompt(wf, plan) || "(vacío)";
}

function renderGenerateState() {
  const { plan } = currentWorkflow();
  const btn = $("#btn-generate");
  const warn = $("#gen-warning");
  const reasons = [];
  if (!ui.status.higgsfield) reasons.push("Falta configurar la API de Higgsfield.");
  if (plan.missing.length) reasons.push(`Falta ${missingText(plan)}.`);
  btn.disabled = reasons.length > 0;
  warn.textContent = reasons.join(" ");
  warn.classList.toggle("hidden", !reasons.length);
}

function setComp(patch) {
  Object.assign(comp, patch);
  refresh();
}

function refresh() {
  if (!catalog.families.length) return;
  renderModel();
  renderSlots();
  renderStyles();
  renderFormats();
  renderParams();
  renderPromptExtras();
  renderGenerateState();
  saveComp();
  scheduleEstimate();
}

// ---------- Contexto: clientes y proyectos ----------
function renderContext() {
  const cs = $("#ctx-client");
  cs.replaceChildren(h("option", { value: "" }, "Todos los clientes"), ...S.clients.map((c) => h("option", { value: c.id, selected: c.id === ui.clientId }, c.name)));
  const client = byId("clients", ui.clientId);
  $("#ctx-client-dot").style.background = client?.color || "var(--text-3)";
  const projects = S.projects.filter((p) => !ui.clientId || p.clientId === ui.clientId);
  if (ui.projectId && !projects.some((p) => p.id === ui.projectId)) ui.projectId = "";
  $("#ctx-project").replaceChildren(h("option", { value: "" }, "Todos los proyectos"), ...projects.map((p) => h("option", { value: p.id, selected: p.id === ui.projectId }, p.name)));
  $("#btn-client-edit").textContent = client ? "✎" : "＋";
  $("#btn-client-edit").title = client ? "Editar cliente" : "Nuevo cliente";
  $("#btn-project-edit").textContent = ui.projectId ? "✎" : "＋";
  $("#btn-project-edit").title = ui.projectId ? "Editar proyecto" : "Nuevo proyecto";
  storeSet("clientId", ui.clientId);
  storeSet("projectId", ui.projectId);
  renderSpend();
}

function applyClientDefaults(client) {
  if (!client) return;
  if (client.styleId && byId("styles", client.styleId)) comp.styleId = client.styleId;
  const fmt = byId("formats", client.formatId);
  if (fmt) {
    comp.values.aspect_ratio = fmt.aspect;
    comp.values.duration = Number(fmt.duration);
    comp.values.resolution = fmt.resolution;
  }
  if (client.familySlug && catalog.families.some((f) => f.slug === client.familySlug)) {
    comp.familySlug = client.familySlug;
    comp.mode = "auto";
  }
}

function editClient(client) {
  const isNew = !client;
  const c = client || { id: uid(), name: "", color: "#c6f432", niche: "", brand: "", formatId: "", styleId: "", familySlug: "" };
  const name = h("input", { type: "text", value: c.name, placeholder: "Nombre de la marca o persona" });
  const color = h("input", { type: "color", value: c.color });
  const niche = h("input", { type: "text", value: c.niche, placeholder: "Ej. fitness, inmobiliaria, gastronomía" });
  const brand = h("textarea", { rows: 4, placeholder: "Tono, público, colores, qué evitar… (Claude lo usa al mejorar prompts)" }, c.brand);
  const fmt = selectEl([["", "—"], ...S.formats.map((f) => [f.id, f.name])], c.formatId);
  const sty = selectEl([["", "—"], ...S.styles.map((s) => [s.id, s.name])], c.styleId);
  const fam = selectEl([["", "—"], ...catalog.families.map((f) => [f.slug, f.name])], c.familySlug);
  openModal({
    title: isNew ? "Nuevo cliente" : `Cliente: ${c.name}`,
    body: [
      h("div", { class: "two" }, field("Nombre", name), field("Color", color)),
      field("Nicho", niche),
      field("Contexto de marca", brand),
      h("div", { class: "two" }, field("Formato por defecto", fmt), field("Estilo por defecto", sty)),
      field("Modelo por defecto", fam),
    ],
    actions: [
      !isNew && { label: "Eliminar", class: "btn-danger", onClick: async () => {
        await deleteDoc("clients", c.id);
        ui.clientId = "";
        renderContext();
        renderFeed();
      } },
      { label: "Cancelar" },
      { label: "Guardar", class: "btn-primary", onClick: async () => {
        if (!name.value.trim()) {
          toast("Ponle un nombre al cliente", "error");
          return false;
        }
        Object.assign(c, { name: name.value.trim(), color: color.value, niche: niche.value.trim(), brand: brand.value.trim(), formatId: fmt.value, styleId: sty.value, familySlug: fam.value, createdAt: c.createdAt || Date.now() });
        await saveDoc("clients", c);
        ui.clientId = c.id;
        applyClientDefaults(c);
        renderContext();
        renderLibrary();
        refresh();
        renderFeed();
      } },
    ].filter(Boolean),
  });
}

function editProject(project) {
  const isNew = !project;
  const p = project || { id: uid(), name: "", clientId: ui.clientId, notes: "" };
  const name = h("input", { type: "text", value: p.name, placeholder: "Ej. Campaña lanzamiento octubre" });
  const client = selectEl([["", "Sin cliente"], ...S.clients.map((c) => [c.id, c.name])], p.clientId);
  const notes = h("textarea", { rows: 3, placeholder: "Objetivo, entregables, notas…" }, p.notes);
  openModal({
    title: isNew ? "Nuevo proyecto" : `Proyecto: ${p.name}`,
    body: [field("Nombre", name), field("Cliente", client), field("Notas", notes)],
    actions: [
      !isNew && { label: "Eliminar", class: "btn-danger", onClick: async () => {
        await deleteDoc("projects", p.id);
        ui.projectId = "";
        renderContext();
        renderFeed();
        renderLibrary();
      } },
      { label: "Cancelar" },
      { label: "Guardar", class: "btn-primary", onClick: async () => {
        if (!name.value.trim()) {
          toast("Ponle un nombre al proyecto", "error");
          return false;
        }
        Object.assign(p, { name: name.value.trim(), clientId: client.value, notes: notes.value.trim(), createdAt: p.createdAt || Date.now() });
        await saveDoc("projects", p);
        if (p.clientId) ui.clientId = p.clientId;
        ui.projectId = p.id;
        renderContext();
        renderFeed();
        renderLibrary();
      } },
    ].filter(Boolean),
  });
}

function editStyle(style) {
  const isNew = !style;
  const s = style || { id: uid(), name: "", color: "#7cc8ff", prompt: "" };
  const name = h("input", { type: "text", value: s.name });
  const color = h("input", { type: "color", value: s.color });
  const prompt = h("textarea", { rows: 4, placeholder: "Descriptores visuales que se añaden al prompt (en inglés rinde mejor)" }, s.prompt);
  openModal({
    title: isNew ? "Nuevo estilo" : `Estilo: ${s.name}`,
    body: [h("div", { class: "two" }, field("Nombre", name), field("Color", color)), field("Dirección visual", prompt)],
    actions: [
      !isNew && { label: "Eliminar", class: "btn-danger", onClick: async () => {
        await deleteDoc("styles", s.id);
        if (comp.styleId === s.id) comp.styleId = "";
        refresh();
        renderLibrary();
      } },
      { label: "Cancelar" },
      { label: "Guardar", class: "btn-primary", onClick: async () => {
        if (!name.value.trim()) return (toast("Ponle un nombre", "error"), false);
        Object.assign(s, { name: name.value.trim(), color: color.value, prompt: prompt.value.trim() });
        await saveDoc("styles", s);
        refresh();
        renderLibrary();
      } },
    ].filter(Boolean),
  });
}

function editFormat(format) {
  const isNew = !format;
  const f = format || { id: uid(), name: "", aspect: "9:16", duration: 8, resolution: "720p" };
  const name = h("input", { type: "text", value: f.name });
  const aspect = selectEl(["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "3:2", "2:3"].map((a) => [a, a]), f.aspect);
  const duration = h("input", { type: "number", min: 1, max: 30, value: f.duration });
  const res = selectEl(["480p", "720p", "1080p", "4k"].map((r) => [r, r]), f.resolution);
  openModal({
    title: isNew ? "Nuevo formato" : `Formato: ${f.name}`,
    body: [field("Nombre", name, "Ej. Historia IG, Anuncio YouTube"), h("div", { class: "two" }, field("Aspecto", aspect), field("Duración (s)", duration)), field("Calidad preferida", res, "Si el modelo no la tiene, se usa la más cercana.")],
    actions: [
      !isNew && { label: "Eliminar", class: "btn-danger", onClick: async () => {
        await deleteDoc("formats", f.id);
        refresh();
        renderLibrary();
      } },
      { label: "Cancelar" },
      { label: "Guardar", class: "btn-primary", onClick: async () => {
        if (!name.value.trim()) return (toast("Ponle un nombre", "error"), false);
        Object.assign(f, { name: name.value.trim(), aspect: aspect.value, duration: Number(duration.value) || 5, resolution: res.value });
        await saveDoc("formats", f);
        refresh();
        renderLibrary();
      } },
    ].filter(Boolean),
  });
}

// ---------- Subida de archivos ----------
async function normalizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const max = 2048;
  if (Math.max(width, height) <= max && file.size < 4 * 1024 * 1024 && /^image\/(jpeg|png|webp)$/.test(file.type)) {
    bitmap.close();
    return { blob: file, width, height, type: file.type };
  }
  const scale = Math.min(1, max / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
  return { blob, width: canvas.width, height: canvas.height, type: "image/jpeg" };
}
function mediaDuration(file, tag) {
  return new Promise((resolve) => {
    const el = document.createElement(tag);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      resolve({ duration: el.duration, width: el.videoWidth, height: el.videoHeight });
      URL.revokeObjectURL(el.src);
    };
    el.onerror = () => resolve({});
    el.src = URL.createObjectURL(file);
  });
}
async function uploadFile(file) {
  let type = file.type;
  if (type === "audio/x-wav" || type === "audio/wave") type = "audio/wav";
  if (/^image\/(jpeg|png|webp|gif|heic|heif|avif)$/.test(type)) {
    const img = await normalizeImage(file);
    const { key } = await api("/api/media", { method: "POST", raw: img.blob, headers: { "Content-Type": img.type } });
    return { key, type: "image", w: img.width, h: img.height };
  }
  if (type === "video/mp4") {
    const meta = await mediaDuration(file, "video");
    const { key } = await api("/api/media", { method: "POST", raw: file, headers: { "Content-Type": type } });
    return { key, type: "video", duration: meta.duration, w: meta.width, h: meta.height };
  }
  if (type === "audio/wav") {
    const meta = await mediaDuration(file, "audio");
    const { key } = await api("/api/media", { method: "POST", raw: file, headers: { "Content-Type": type } });
    return { key, type: "audio", duration: meta.duration };
  }
  throw new Error(`${file.name}: formato no soportado. Usa JPG/PNG/WEBP, MP4 o WAV (Higgsfield no acepta otros).`);
}
async function uploadAsElements(files, kind) {
  const created = [];
  const busy = toastProgress(`Subiendo ${files.length} archivo(s)…`);
  for (const file of files) {
    try {
      const media = await uploadFile(file);
      const elKind = media.type === "video" ? "video" : media.type === "audio" ? "audio" : ["video", "audio"].includes(kind) ? "frame" : kind;
      const el = { id: uid(), kind: elKind, name: file.name.replace(/\.[^.]+$/, "").slice(0, 60), description: "", tags: [], media: [media], clientId: ui.clientId || "", projectId: ui.projectId || "", createdAt: Date.now() };
      created.push(await saveDoc("elements", el));
    } catch (err) {
      toast(err.message, "error");
    }
  }
  busy.remove();
  if (created.length) toast(`${created.length} archivo(s) guardado(s) en la biblioteca`);
  return created;
}
function toastProgress(text) {
  const el = h("div", { class: "toast" }, h("span", { class: "spinner", style: { width: "14px", height: "14px", display: "inline-block", verticalAlign: "-2px", marginRight: "8px" } }), text);
  $("#toasts").append(el);
  return el;
}

// ---------- Biblioteca (drawer) ----------
function openLibrary(tab) {
  if (tab) ui.libTab = tab;
  $("#drawer").classList.add("open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#drawer-backdrop").classList.remove("hidden");
  renderLibrary();
}
function closeLibrary() {
  ui.pick = null;
  $("#drawer").classList.remove("open");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#drawer-backdrop").classList.add("hidden");
}
function openPicker(slotId) {
  const def = SLOTS.find((s) => s.id === slotId);
  ui.pick = { slotId, max: def.max, selected: [...comp.slots[slotId]] };
  openLibrary(def.kind);
}

function libraryItems() {
  const q = ui.libSearch.trim().toLowerCase();
  const onlyClient = $("#lib-client-only").checked && ui.clientId;
  const pickDef = ui.pick && SLOTS.find((s) => s.id === ui.pick.slotId);
  return S.elements
    .filter((el) => {
      if (pickDef) {
        if (!el.media?.some((m) => m.type === pickDef.media)) return false;
        if (el.kind !== ui.libTab && ui.libTab !== "all") return false;
      } else if (el.kind !== ui.libTab) return false;
      if (onlyClient && el.clientId && el.clientId !== ui.clientId) return false;
      if (!q) return true;
      return [el.name, el.description, ...(el.tags || [])].join(" ").toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

function renderLibrary() {
  if (!$("#drawer").classList.contains("open")) return;
  const pickDef = ui.pick && SLOTS.find((s) => s.id === ui.pick.slotId);
  const kinds = pickDef ? ELEMENT_KINDS.filter((k) => (pickDef.media === "image" ? !["video", "audio"].includes(k.id) : k.id === pickDef.media)) : ELEMENT_KINDS;
  const tabs = pickDef ? kinds : [...kinds, ...MANAGE_TABS];
  if (!tabs.some((t) => t.id === ui.libTab)) ui.libTab = tabs[0].id;
  $("#drawer-title").textContent = pickDef ? `Elegir: ${pickDef.label}` : "Biblioteca";
  $("#drawer-sub").textContent = pickDef ? `Selecciona hasta ${pickDef.max}. También puedes subir archivos nuevos aquí.` : "Todo lo que subes queda guardado en la nube para reutilizarlo.";
  $("#drawer-tabs").replaceChildren(
    ...tabs.map((t) => {
      const count = ELEMENT_KINDS.some((k) => k.id === t.id) ? S.elements.filter((e) => e.kind === t.id).length : S[t.id]?.length;
      return h("button", { class: `chip ${ui.libTab === t.id ? "active" : ""}`, type: "button", onclick: () => {
        ui.libTab = t.id;
        renderLibrary();
      } }, t.label, count ? h("span", { class: "hint" }, count) : null);
    }),
  );
  const manage = MANAGE_TABS.some((t) => t.id === ui.libTab);
  $(".drawer-tools").classList.toggle("hidden", manage);
  $("#dropzone").classList.toggle("hidden", manage);
  const accept = ui.libTab === "video" ? "video/mp4" : ui.libTab === "audio" ? "audio/wav,audio/x-wav" : "image/png,image/jpeg,image/webp";
  $("#lib-files").accept = accept;
  $("#drop-hint").textContent = ui.libTab === "video" ? "MP4 (máx. 95 MB con R2, 20 MB sin R2)" : ui.libTab === "audio" ? "WAV" : "JPG, PNG, WEBP · se optimizan a 2048 px";

  if (manage) renderManage();
  else {
    const items = libraryItems();
    const kind = ELEMENT_KINDS.find((k) => k.id === ui.libTab);
    $("#lib-grid").replaceChildren(
      ...(items.length
        ? items.map(libCard)
        : [h("div", { class: "empty" }, h("strong", {}, `Sin ${kind?.label.toLowerCase() || "elementos"} todavía`), "Sube archivos arriba. Para un personaje, puedes agregar varias fotos (ángulos) al mismo elemento.")]),
    );
  }
  const foot = $("#drawer-foot");
  foot.classList.toggle("hidden", !ui.pick);
  if (ui.pick) $("#pick-count").textContent = `${ui.pick.selected.length} / ${ui.pick.max} seleccionados`;
}

function libCard(el) {
  const m = el.media?.[0];
  const selected = ui.pick?.selected.includes(el.id);
  const kind = ELEMENT_KINDS.find((k) => k.id === el.kind);
  const client = byId("clients", el.clientId);
  const thumb = !m ? h("span", { class: "hint" }, "vacío")
    : m.type === "image" ? h("img", { src: mediaUrl(m.key), alt: el.name, loading: "lazy" })
    : m.type === "video" ? h("video", { src: `${mediaUrl(m.key)}#t=0.5`, muted: true, preload: "metadata" })
    : h("span", { class: "audio" }, "♪");
  return h("div", { class: `lib-item ${selected ? "selected" : ""}` },
    h("div", { class: "lib-thumb", onclick: () => (ui.pick ? togglePick(el.id) : editElement(el)) },
      thumb,
      h("span", { class: "kind" }, kind?.one || el.kind),
      el.media?.length > 1 ? h("span", { class: "n" }, `${el.media.length} fotos`) : m?.duration ? h("span", { class: "n" }, `${m.duration.toFixed(1)}s`) : null,
    ),
    h("div", { class: "lib-info" },
      client && h("span", { class: "swatch", style: { background: client.color }, title: client.name }),
      h("strong", { title: el.description || el.name }, el.name || "Sin nombre"),
      h("button", { type: "button", title: "Editar", onclick: () => editElement(el) }, "✎"),
    ),
  );
}

function togglePick(id) {
  const p = ui.pick;
  if (p.selected.includes(id)) p.selected = p.selected.filter((x) => x !== id);
  else if (p.max === 1) p.selected = [id];
  else if (p.selected.length < p.max) p.selected.push(id);
  else toast(`Máximo ${p.max} en este espacio`, "error");
  renderLibrary();
}
function finishPick() {
  if (!ui.pick) return;
  comp.slots[ui.pick.slotId] = [...ui.pick.selected];
  closeLibrary();
  refresh();
}

function editElement(el) {
  const name = h("input", { type: "text", value: el.name });
  const kind = selectEl(ELEMENT_KINDS.map((k) => [k.id, k.one]), el.kind);
  const desc = h("textarea", { rows: 3, placeholder: "Describe a la persona/producto/lugar: se añade al prompt y ayuda a mantener consistencia." }, el.description || "");
  const tags = h("input", { type: "text", value: (el.tags || []).join(", "), placeholder: "etiquetas, separadas, por coma" });
  const client = selectEl([["", "Todos los clientes"], ...S.clients.map((c) => [c.id, c.name])], el.clientId || "");
  const project = selectEl([["", "Sin proyecto"], ...S.projects.map((p) => [p.id, p.name])], el.projectId || "");
  const gallery = h("div", { class: "lib-grid", style: { gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" } });
  const renderGallery = () =>
    gallery.replaceChildren(
      ...el.media.map((m, i) =>
        h("div", { class: "lib-item" },
          h("div", { class: "lib-thumb" }, m.type === "image" ? h("img", { src: mediaUrl(m.key) }) : m.type === "video" ? h("video", { src: mediaUrl(m.key), controls: true }) : h("audio", { src: mediaUrl(m.key), controls: true, style: { width: "100%" } })),
          h("div", { class: "lib-info" }, h("strong", {}, i === 0 ? "Principal" : `Ángulo ${i + 1}`), el.media.length > 1 && h("button", { type: "button", title: "Quitar", onclick: () => {
            el.media.splice(i, 1);
            renderGallery();
          } }, "✕")),
        ),
      ),
      el.media[0]?.type === "image"
        ? h("label", { class: "dropzone", style: { minHeight: "96px", justifyContent: "center" } }, "+ Foto", h("input", { type: "file", accept: "image/png,image/jpeg,image/webp", multiple: true, hidden: true, onchange: async (e) => {
          for (const f of e.target.files) {
            try {
              el.media.push(await uploadFile(f));
            } catch (err) {
              toast(err.message, "error");
            }
          }
          renderGallery();
        } }))
        : null,
    );
  renderGallery();
  openModal({
    title: el.name || "Elemento",
    wide: true,
    body: [
      h("div", { class: "two" }, field("Nombre", name), field("Tipo", kind)),
      field("Descripción", desc),
      h("div", { class: "two" }, field("Cliente", client), field("Proyecto", project)),
      field("Etiquetas", tags),
      field("Archivos", gallery, el.media[0]?.type === "image" ? "Varias fotos del mismo personaje o producto mejoran la consistencia en modelos de referencias." : null),
    ],
    actions: [
      { label: "Eliminar", class: "btn-danger", onClick: async () => {
        await deleteDoc("elements", el.id);
        for (const m of el.media) api(`/api/media/${m.key}`, { method: "DELETE" }).catch(() => {});
        for (const s of SLOTS) comp.slots[s.id] = comp.slots[s.id].filter((id) => id !== el.id);
        renderLibrary();
        refresh();
      } },
      { label: "Cancelar" },
      { label: "Guardar", class: "btn-primary", onClick: async () => {
        Object.assign(el, { name: name.value.trim(), kind: kind.value, description: desc.value.trim(), tags: tags.value.split(",").map((t) => t.trim()).filter(Boolean), clientId: client.value, projectId: project.value });
        await saveDoc("elements", el);
        renderLibrary();
        refresh();
      } },
    ],
  });
}

function renderManage() {
  const tab = ui.libTab;
  const rows = {
    clients: () => S.clients.map((c) => manageRow(c.color, c.name, [c.niche, c.brand].filter(Boolean).join(" · "), () => editClient(c))),
    projects: () => S.projects.map((p) => manageRow(byId("clients", p.clientId)?.color || "var(--text-3)", p.name, `${byId("clients", p.clientId)?.name || "Sin cliente"} · ${S.generations.filter((g) => g.projectId === p.id).length} videos`, () => editProject(p))),
    styles: () => S.styles.map((s) => manageRow(s.color, s.name, s.prompt, () => editStyle(s))),
    formats: () => S.formats.map((f) => manageRow("var(--accent)", f.name, `${f.aspect} · ${f.duration}s · ${f.resolution}`, () => editFormat(f))),
  }[tab]();
  const add = { clients: () => editClient(null), projects: () => editProject(null), styles: () => editStyle(null), formats: () => editFormat(null) }[tab];
  $("#lib-grid").replaceChildren(h("div", { class: "manage-list" }, h("button", { class: "btn-primary", type: "button", onclick: add }, `+ Nuevo ${MANAGE_TABS.find((t) => t.id === tab).label.toLowerCase().replace(/s$/, "").replace(/e$/, "")}`), ...rows));
}
function manageRow(color, title, subtitle, onEdit) {
  return h("div", { class: "manage-row" }, h("span", { class: "swatch", style: { background: color } }), h("div", { class: "grow" }, h("strong", {}, title), h("small", {}, subtitle || "")), h("button", { class: "btn-ghost", type: "button", onclick: onEdit }, "Editar"));
}

// ---------- Claude ----------
function enhancePayload(mode) {
  const { wf, plan } = currentWorkflow();
  const client = byId("clients", ui.clientId);
  const style = byId("styles", comp.styleId);
  return {
    mode,
    idea: comp.prompt.trim(),
    style: style?.prompt || "",
    camera: comp.camera,
    client: client ? [client.name, client.niche, client.brand].filter(Boolean).join(" — ") : "",
    model: `${family().name} (${wf.label})`,
    duration: paramValue(wf, "duration") || undefined,
    references: [
      ...["start", "end"].flatMap((s) => slotEntries(s).map((el) => ({ role: SLOTS.find((x) => x.id === s).role, name: el.name, description: el.description, key: elementMedia(el, "image")[0]?.key }))),
      ...plan.textRefs,
    ],
  };
}
async function enhance(mode) {
  if (!comp.prompt.trim()) return toast("Escribe una idea primero", "error");
  if (!ui.status.claude) return manualClaude(mode);
  const btn = mode === "variations" ? $("#btn-variations") : $("#btn-enhance");
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Pensando…";
  try {
    const r = await api("/api/enhance", { method: "POST", body: enhancePayload(mode) });
    if (r.manual) return manualClaude(mode);
    if (r.prompt) {
      comp.prompt = r.prompt;
      $("#prompt").value = r.prompt;
      autoGrow();
      refresh();
      toast("Prompt mejorado con Claude");
    }
    if (r.variations) showSuggestions(r.variations);
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}
function showSuggestions(list) {
  const box = $("#suggestions");
  box.replaceChildren(
    ...list.map((text) => h("button", { class: "suggestion", type: "button", onclick: () => {
      comp.prompt = text;
      $("#prompt").value = text;
      box.classList.add("hidden");
      autoGrow();
      refresh();
    } }, text)),
    h("button", { class: "btn-ghost", type: "button", onclick: () => box.classList.add("hidden") }, "Cerrar sugerencias"),
  );
  box.classList.remove("hidden");
}
async function manualClaude(mode = "enhance") {
  if (!comp.prompt.trim()) return toast("Escribe una idea primero", "error");
  const r = await api("/api/enhance", { method: "POST", body: { ...enhancePayload(mode), dryRun: true } }).catch((err) => toast(err.message, "error"));
  if (!r) return;
  try {
    await navigator.clipboard.writeText(r.text);
  } catch {}
  const paste = h("textarea", { rows: 6, placeholder: "Pega aquí la respuesta de Claude…" });
  openModal({
    title: "Mejorar con tu cuenta de Claude",
    body: [
      h("p", { class: "muted" }, "Copiamos el pedido (con tu idea, estilo, cliente y referencias) al portapapeles. Ábrelo en Claude.ai, pégalo y trae la respuesta aquí. Las imágenes no viajan en este modo: adjúntalas en Claude.ai si quieres que las vea."),
      h("div", { class: "row" },
        h("a", { class: "btn-primary", href: "https://claude.ai/new", target: "_blank", rel: "noreferrer" }, "Abrir Claude.ai ↗"),
        h("button", { class: "btn-secondary", type: "button", onclick: async () => {
          await navigator.clipboard.writeText(r.text).catch(() => {});
          toast("Pedido copiado");
        } }, "Copiar pedido otra vez"),
      ),
      field("Respuesta de Claude", paste),
    ],
    actions: [
      { label: "Cancelar" },
      { label: "Usar como prompt", class: "btn-primary", onClick: () => {
        const text = paste.value.trim();
        if (!text) return (toast("Pega la respuesta primero", "error"), false);
        const parts = text.split(/\n\s*---+\s*\n/).map((t) => t.trim()).filter(Boolean);
        if (parts.length > 1) showSuggestions(parts.slice(0, 3));
        else {
          comp.prompt = text;
          $("#prompt").value = text;
          autoGrow();
          refresh();
        }
      } },
    ],
  });
}

// ---------- Generar ----------
async function generate() {
  const cw = currentWorkflow();
  if (!cw) return;
  const { wf, plan } = cw;
  if (plan.missing.length) return toast(`Falta ${missingText(plan)}.`, "error");
  const btn = $("#btn-generate");
  btn.disabled = true;
  try {
    const input = buildInput(wf, plan);
    const e = ui.estimate;
    const gen = await api("/api/generate", {
      method: "POST",
      body: {
        model: wf.id,
        input,
        media: plan.media,
        doc: {
          familySlug: family().slug,
          familyName: family().name,
          workflowLabel: wf.label,
          idea: comp.prompt.trim(),
          prompt: input.prompt || "",
          clientId: ui.clientId,
          projectId: ui.projectId,
          aspect: input.aspect_ratio || null,
          duration: input.duration || null,
          costUsd: e?.usd ?? null,
          credits: e?.credits ?? (e?.usd != null ? e.usd * 16 : null),
          comp: JSON.parse(JSON.stringify({ ...comp })),
        },
      },
    });
    S.generations.push(gen);
    renderFeed();
    if (gen.status === "failed") toast(gen.error, "error");
    else toast(`Enviado a ${family().name}. Tarda de 1 a 5 min.`);
    startPolling();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    renderGenerateState();
  }
}

let pollTimer = null;
function startPolling() {
  if (pollTimer) return;
  const tick = async () => {
    const pending = S.generations.filter((g) => ["queued", "in_progress", "submitting"].includes(g.status));
    if (!pending.length) {
      pollTimer = null;
      return;
    }
    if (!document.hidden) {
      for (const g of pending) {
        try {
          const updated = await api(`/api/generations/${g.id}/refresh`, { method: "POST" });
          const i = S.generations.findIndex((x) => x.id === g.id);
          S.generations[i] = updated;
          if (updated.status !== g.status) {
            renderFeed();
            if (updated.status === "completed") toast("¡Video listo!");
            else if (!["queued", "in_progress"].includes(updated.status)) toast(updated.error || "La generación falló", "error");
          }
        } catch {}
      }
    }
    pollTimer = setTimeout(tick, 6000);
  };
  pollTimer = setTimeout(tick, 4000);
}

// ---------- Feed ----------
const isPending = (g) => ["queued", "in_progress", "submitting"].includes(g.status);
function visibleGenerations() {
  const q = ui.feedSearch.trim().toLowerCase();
  return S.generations
    .filter((g) => !ui.clientId || g.clientId === ui.clientId)
    .filter((g) => !ui.projectId || g.projectId === ui.projectId)
    .filter((g) => {
      if (ui.feedFilter === "completed") return g.status === "completed";
      if (ui.feedFilter === "pending") return isPending(g);
      if (ui.feedFilter === "failed") return ["failed", "nsfw", "canceled"].includes(g.status);
      if (ui.feedFilter === "fav") return g.favorite;
      return true;
    })
    .filter((g) => !q || `${g.idea} ${g.prompt} ${g.familyName}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);
}
const videoSrc = (g) => (g.videoKey ? mediaUrl(g.videoKey) : g.videoUrl);

function renderFeed() {
  const list = visibleGenerations();
  const client = byId("clients", ui.clientId);
  const project = byId("projects", ui.projectId);
  $("#feed-title").textContent = project ? project.name : client ? client.name : "Generaciones";
  $("#feed-sub").textContent = `${list.length} video(s)${project && client ? ` · ${client.name}` : ""}`;
  $("#feed").replaceChildren(
    ...(list.length
      ? list.map(genCard)
      : [h("div", { class: "empty" }, h("strong", {}, "Aún no hay videos aquí"), "Elige un modelo, agrega referencias, escribe tu idea y pulsa Generar.")]),
  );
  renderSpend();
}

function genCard(g) {
  const media = h("div", { class: "gen-media", style: g.aspect && /^\d+:\d+$/.test(g.aspect) ? { aspectRatio: g.aspect.replace(":", " / ") } : {} });
  if (g.status === "completed" && videoSrc(g)) media.append(h("video", { src: videoSrc(g), controls: true, loop: true, playsInline: true, preload: "metadata" }));
  else if (isPending(g)) media.append(h("div", { class: "state" }, h("span", { class: "spinner" }), g.status === "queued" ? "En cola…" : g.status === "submitting" ? "Enviando…" : "Generando…"));
  else media.append(h("div", { class: "state error" }, g.error || `Estado: ${g.status}`));
  const client = byId("clients", g.clientId);
  const expired = g.status === "completed" && !g.videoKey && Date.now() - (g.completedAt || g.createdAt) > 7 * 86400_000;
  return h("article", { class: "gen-card" },
    media,
    h("div", { class: "gen-body" },
      h("p", { class: "gen-prompt", title: g.prompt }, g.idea || g.prompt || "(sin prompt)"),
      h("div", { class: "gen-meta" },
        h("span", {}, `${g.familyName || g.model} · ${g.workflowLabel || ""}`),
        g.duration && h("span", {}, `${g.duration}s`),
        g.aspect && h("span", {}, g.aspect),
        g.costUsd != null && h("span", {}, money(g.costUsd)),
        client && h("span", { style: { borderColor: client.color } }, client.name),
        expired && h("span", { style: { color: "var(--warn)" } }, "CDN vencido"),
        g.savedTo?.length && h("span", { title: g.savedTo.join("\n") }, "✓ en ciclo"),
      ),
      h("div", { class: "gen-actions" },
        h("button", { class: `fav ${g.favorite ? "on" : ""}`, type: "button", title: "Favorito", onclick: async () => {
          g.favorite = !g.favorite;
          await saveDoc("generations", g).catch((err) => toast(err.message, "error"));
          renderFeed();
        } }, "★"),
        h("button", { type: "button", title: "Cargar esta configuración en el compositor", onclick: () => reuse(g) }, "↺ Reusar"),
        g.status === "completed" && videoSrc(g) && h("a", { href: videoSrc(g), download: `videoflow-${g.id.slice(0, 8)}.mp4`, target: "_blank", rel: "noreferrer" }, "⬇"),
        g.status === "completed" && h("button", { type: "button", onclick: () => saveToCycleModal(g) }, "A ciclo"),
        h("button", { type: "button", onclick: () => genDetails(g) }, "Detalles"),
        h("button", { class: "del", type: "button", title: "Eliminar del historial", onclick: () => confirmModal("Eliminar video", "Se borra del historial de VideoFlow (no de Higgsfield).", async () => {
          await deleteDoc("generations", g.id);
          if (g.videoKey) api(`/api/media/${g.videoKey}`, { method: "DELETE" }).catch(() => {});
          renderFeed();
        }) }, "🗑"),
      ),
    ),
  );
}

function reuse(g) {
  if (g.comp) {
    Object.assign(comp, JSON.parse(JSON.stringify(g.comp)));
    comp.slots = { ...EMPTY_SLOTS(), ...comp.slots };
  } else {
    comp.prompt = g.idea || g.prompt || "";
  }
  $("#prompt").value = comp.prompt;
  $("#negative").value = comp.negative || "";
  autoGrow();
  refresh();
  $("#composer").scrollTo({ top: 0, behavior: "smooth" });
  toast("Configuración cargada en el compositor");
}

function genDetails(g) {
  openModal({
    title: `${g.familyName || g.model} · ${g.workflowLabel || ""}`,
    wide: true,
    body: h("div", { class: "detail-grid" },
      h("div", {}, g.status === "completed" && videoSrc(g) ? h("video", { src: videoSrc(g), controls: true, autoplay: true, loop: true, playsInline: true }) : h("p", { class: "muted" }, g.error || `Estado: ${g.status}`)),
      h("div", { class: "params" },
        field("Prompt enviado", h("pre", {}, g.prompt || "(sin prompt)")),
        field("Parámetros", h("pre", {}, JSON.stringify(g.input, null, 2))),
        h("p", { class: "hint" }, `Modelo: ${g.model}`, h("br"), `Request: ${g.requestId || "—"}`, h("br"), `Creado: ${new Date(g.createdAt).toLocaleString()}`, g.costUsd != null ? [h("br"), `Costo estimado: ${money(g.costUsd)}`] : null),
      ),
    ),
    actions: [
      g.status === "queued" && { label: "Cancelar (reembolso)", class: "btn-danger", onClick: async () => {
        const updated = await api(`/api/generations/${g.id}/cancel`, { method: "POST" });
        Object.assign(g, updated);
        renderFeed();
      } },
      { label: "Cerrar" },
    ].filter(Boolean),
  });
}

async function saveToCycleModal(g) {
  if (!ui.status.github) {
    openModal({
      title: "Guardar en un ciclo de contenido",
      body: [
        h("p", { class: "muted" }, "Para guardar directo en content/cycles/<ciclo>/piezas/<pieza>/media/ del repo, configura el secret GITHUB_TOKEN (ver Ajustes). Mientras tanto, descarga el video y déjalo en esa carpeta."),
        h("a", { class: "btn-primary", href: videoSrc(g), download: "", target: "_blank", rel: "noreferrer" }, "Descargar video"),
      ],
      actions: [{ label: "Cerrar" }],
    });
    return;
  }
  let cycles = [];
  try {
    cycles = (await api("/api/cycles")).cycles;
  } catch (err) {
    toast(err.message, "error");
  }
  const cycleInput = h("input", { type: "text", list: "cycle-list", value: cycles[0]?.id || "", placeholder: "2026-10" });
  const piezaInput = h("input", { type: "text", list: "pieza-list", value: cycles[0]?.piezas?.[0] || "pieza-01" });
  const piezaList = h("datalist", { id: "pieza-list" });
  const fillPiezas = () => piezaList.replaceChildren(...(cycles.find((c) => c.id === cycleInput.value)?.piezas || []).map((p) => h("option", { value: p })));
  cycleInput.addEventListener("input", fillPiezas);
  fillPiezas();
  const file = h("input", { type: "text", value: `clip-${new Date().toISOString().slice(0, 10)}-${g.id.slice(0, 4)}` });
  openModal({
    title: "Guardar en un ciclo de contenido",
    body: [
      h("p", { class: "muted" }, "Se guarda como commit en el repo (GitHub Actions, tarda 1–2 min). Es la carpeta que usa el agente publicar."),
      h("datalist", { id: "cycle-list" }, cycles.map((c) => h("option", { value: c.id }))),
      piezaList,
      h("div", { class: "two" }, field("Ciclo", cycleInput), field("Pieza", piezaInput)),
      field("Nombre del archivo", file, ".mp4 se añade solo"),
    ],
    actions: [
      { label: "Cancelar" },
      { label: "Guardar en el repo", class: "btn-primary", onClick: async () => {
        const updated = await api("/api/save-to-cycle", { method: "POST", body: { generationId: g.id, cycle: cycleInput.value.trim(), pieza: piezaInput.value.trim(), filename: file.value.trim() } });
        Object.assign(g, updated);
        renderFeed();
        toast("Enviado a GitHub. Aparecerá en el repo en 1–2 min.");
      } },
    ],
  });
}

function renderSpend() {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const total = S.generations.filter((g) => g.status === "completed" && g.createdAt >= start.getTime() && (!ui.clientId || g.clientId === ui.clientId)).reduce((n, g) => n + (g.costUsd || 0), 0);
  $("#spend").textContent = `Este mes: ${money(total)}`;
}

// ---------- Ajustes ----------
function openSettings() {
  const st = ui.status;
  const item = (on, title, text) => h("li", {}, h("span", { class: `status-dot ${on ? "on" : ""}` }), h("div", {}, h("strong", {}, title), h("div", { class: "hint" }, text)));
  const cmd = (s) => h("code", {}, s);
  openModal({
    title: "Conexiones y respaldo",
    wide: true,
    body: [
      h("ul", { class: "conn-list" },
        item(st.higgsfield, "Higgsfield API", st.higgsfield ? "Conectada. Los créditos se cobran de tu cuenta de console.higgsfield.ai." : ["Falta el secret: ", cmd("npx wrangler secret put HF_CREDENTIALS")]),
        item(st.claude, "Claude API (✨ Mejorar con imágenes)", st.claude ? "Conectada." : ["Opcional. Sin ella, el botón Claude.ai ↗ usa tu suscripción Pro copiando el pedido. Para activarla: ", cmd("npx wrangler secret put ANTHROPIC_API_KEY")]),
        item(st.github, "GitHub (botón A ciclo)", st.github ? "Conectado: guarda videos en content/cycles vía GitHub Actions." : ["Opcional. Crea un token fine-grained con Contents y Actions (lectura/escritura) para iguanaec/content-strategy y: ", cmd("npx wrangler secret put GITHUB_TOKEN")]),
        item(st.r2, "Cloudflare R2 (videos permanentes)", st.r2 ? "Activo: los videos generados se copian a tu almacenamiento." : "Sin R2 las imágenes se guardan en D1 y los videos viven 7 días en el CDN de Higgsfield. Activa R2 en el panel de Cloudflare para guardarlos siempre."),
      ),
      h("div", { class: "row" },
        h("button", { class: "btn-secondary", type: "button", onclick: exportData }, "Exportar respaldo (JSON)"),
        h("label", { class: "btn-secondary" }, "Importar", h("input", { type: "file", accept: "application/json", hidden: true, onchange: (e) => importData(e.target.files[0]) })),
        h("button", { class: "btn-ghost push", type: "button", onclick: async () => {
          await api("/api/logout", { method: "POST" });
          location.reload();
        } }, "Cerrar sesión"),
      ),
      h("p", { class: "hint" }, `Catálogo de modelos: ${catalog.families.length} familias, generado ${catalog.generatedAt ? new Date(catalog.generatedAt).toLocaleDateString() : "—"} desde docs.higgsfield.ai.`),
    ],
    actions: [{ label: "Cerrar" }],
  });
}
function exportData() {
  const blob = new Blob([JSON.stringify({ app: "videoflow", version: 2, exportedAt: new Date().toISOString(), data: S }, null, 2)], { type: "application/json" });
  h("a", { href: URL.createObjectURL(blob), download: `videoflow-${new Date().toISOString().slice(0, 10)}.json` }).click();
}
async function importData(file) {
  if (!file) return;
  try {
    const { data } = JSON.parse(await file.text());
    let n = 0;
    for (const store of STORES) for (const doc of data?.[store] || []) {
      if (doc?.id) {
        await saveDoc(store, doc);
        n++;
      }
    }
    toast(`${n} registros importados`);
    renderAll();
  } catch (err) {
    toast(`No se pudo importar: ${err.message}`, "error");
  }
}

// ---------- Login y arranque ----------
function showLogin(message) {
  $("#login").classList.remove("hidden");
  if (message) $("#login-msg").textContent = message;
  setTimeout(() => $("#login-password").focus(), 50);
}

async function seedDefaults() {
  if (!S.styles.length) for (const s of DEFAULT_STYLES) await saveDoc("styles", { id: uid(), ...s });
  if (!S.formats.length) for (const f of DEFAULT_FORMATS) await saveDoc("formats", { id: uid(), ...f });
}

function renderAll() {
  renderContext();
  refresh();
  renderFeed();
  renderLibrary();
}

async function loadData() {
  const data = await api("/api/bootstrap");
  for (const s of STORES) S[s] = data[s] || [];
  await seedDefaults();
  if (ui.clientId && !byId("clients", ui.clientId)) ui.clientId = "";
  $("#prompt").value = comp.prompt;
  $("#negative").value = comp.negative;
  autoGrow();
  renderAll();
  startPolling();
}

async function boot() {
  try {
    catalog = await fetch("catalog.json").then((r) => r.json());
  } catch {
    toast("No se pudo cargar el catálogo de modelos", "error");
  }
  if (!catalog.families.some((f) => f.slug === comp.familySlug)) comp.familySlug = catalog.families[0]?.slug;
  try {
    ui.status = await api("/api/status");
  } catch (err) {
    toast(`Sin conexión con el servidor: ${err.message}`, "error");
    return;
  }
  if (!ui.status.configured) return showLogin("Falta configurar APP_PASSWORD y SESSION_SECRET en Cloudflare.");
  if (!ui.status.authed) return showLogin();
  await loadData().catch((err) => toast(err.message, "error"));
}

function autoGrow() {
  const t = $("#prompt");
  t.style.height = "auto";
  t.style.height = `${Math.min(t.scrollHeight + 2, 320)}px`;
}

// ---------- Eventos (se enlazan antes de cargar datos, así la UI siempre responde) ----------
function bindEvents() {
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await api("/api/login", { method: "POST", body: { password: $("#login-password").value } });
      $("#login").classList.add("hidden");
      ui.status = await api("/api/status");
      await loadData();
    } catch (err) {
      $("#login-msg").textContent = err.message;
    }
  });

  $("#modal-close").addEventListener("click", () => modal.close());
  $("#modal-form").addEventListener("submit", (e) => e.preventDefault());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  $("#ctx-client").addEventListener("change", (e) => {
    ui.clientId = e.target.value;
    ui.projectId = "";
    applyClientDefaults(byId("clients", ui.clientId));
    renderContext();
    refresh();
    renderFeed();
  });
  $("#ctx-project").addEventListener("change", (e) => {
    ui.projectId = e.target.value;
    const p = byId("projects", ui.projectId);
    if (p?.clientId) ui.clientId = p.clientId;
    renderContext();
    renderFeed();
  });
  $("#btn-client-edit").addEventListener("click", () => editClient(byId("clients", ui.clientId)));
  $("#btn-project-edit").addEventListener("click", () => editProject(byId("projects", ui.projectId)));
  $("#btn-library").addEventListener("click", () => {
    ui.pick = null;
    openLibrary();
  });
  $("#btn-settings").addEventListener("click", openSettings);

  $("#model-picker").addEventListener("click", openModelPicker);
  $("#model-mode").addEventListener("change", (e) => setComp({ mode: e.target.value }));

  // Solo "input" (nunca "change"): redibujar al perder el foco se tragaría el clic siguiente.
  $("#prompt").addEventListener("input", (e) => {
    comp.prompt = e.target.value;
    autoGrow();
    saveComp();
    renderModel();
    renderSlots();
    renderPromptExtras();
    renderGenerateState();
    scheduleEstimate();
  });
  $("#negative").addEventListener("input", (e) => {
    comp.negative = e.target.value;
    saveComp();
  });
  $("#btn-enhance").addEventListener("click", () => enhance("enhance"));
  $("#btn-variations").addEventListener("click", () => enhance("variations"));
  $("#btn-manual").addEventListener("click", () => manualClaude("enhance"));
  $("#btn-preview-prompt").addEventListener("click", () => {
    const fp = $("#final-prompt");
    fp.classList.toggle("hidden");
    $("#btn-preview-prompt").textContent = fp.classList.contains("hidden") ? "Ver prompt final" : "Ocultar prompt final";
    renderPromptExtras();
  });
  $("#btn-new-style").addEventListener("click", () => editStyle(null));
  $("#btn-new-format").addEventListener("click", () => editFormat(null));
  $("#btn-generate").addEventListener("click", generate);
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !$("#btn-generate").disabled) generate();
    if (e.key === "Escape" && $("#drawer").classList.contains("open") && !modal.open) closeLibrary();
  });

  $("#feed-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    ui.feedFilter = btn.dataset.filter;
    for (const b of $("#feed-filters").children) b.classList.toggle("active", b === btn);
    renderFeed();
  });
  $("#feed-search").addEventListener("input", (e) => {
    ui.feedSearch = e.target.value;
    renderFeed();
  });

  $("#drawer-close").addEventListener("click", closeLibrary);
  $("#drawer-backdrop").addEventListener("click", closeLibrary);
  $("#pick-done").addEventListener("click", finishPick);
  $("#lib-search").addEventListener("input", (e) => {
    ui.libSearch = e.target.value;
    renderLibrary();
  });
  $("#lib-client-only").addEventListener("change", renderLibrary);
  const handleFiles = async (files) => {
    const created = await uploadAsElements([...files], ui.libTab);
    if (ui.pick) for (const el of created) if (ui.pick.selected.length < ui.pick.max || ui.pick.max === 1) {
      if (ui.pick.max === 1) ui.pick.selected = [el.id];
      else ui.pick.selected.push(el.id);
    }
    renderLibrary();
    refresh();
  };
  $("#lib-files").addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  });
  const dz = $("#dropzone");
  dz.addEventListener("dragover", (e) => {
    e.preventDefault();
    dz.classList.add("drag");
  });
  dz.addEventListener("dragleave", () => dz.classList.remove("drag"));
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.classList.remove("drag");
    handleFiles(e.dataTransfer.files);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && ui.status.authed) startPolling();
  });
}

bindEvents();
boot();

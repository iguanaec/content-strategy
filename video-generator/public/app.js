// ---------- IndexedDB ----------
const STORES = ["clients", "projects", "boards", "references", "styles", "formats", "generations"];

const dbPromise = new Promise((resolve, reject) => {
  const req = indexedDB.open("videoflow", 1);
  req.onupgradeneeded = () => {
    for (const name of STORES) {
      if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, { keyPath: "id" });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

async function tx(store, mode, fn) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const result = fn(t.objectStore(store));
    t.oncomplete = () => resolve(result?.result);
    t.onerror = () => reject(t.error);
  });
}
const dbAll = (store) => tx(store, "readonly", (s) => s.getAll());
const dbPut = (store, value) => tx(store, "readwrite", (s) => s.put(value));
const dbDel = (store, id) => tx(store, "readwrite", (s) => s.delete(id));

// ---------- State ----------
const state = Object.fromEntries(STORES.map((s) => [s, []]));
const ui = {
  view: "create",
  clientId: "",
  projectId: "",
  boardId: "all",
  feedFilter: "all",
  refSearch: "",
  start: null,
  end: null,
  aspect: "16:9",
  resolution: "720p",
  status: { higgsfield: false, claude: false, server: false },
};

const ASPECTS = ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
const DURATIONS = [4, 5, 6, 8, 10, 12, 15, 20, 25, 30];

const DEFAULT_STYLES = [
  { name: "Cinemático", color: "#c6f432", prompt: "cinematic film look, anamorphic lens, shallow depth of field, soft volumetric light, rich color grading, 35mm film grain", camera: "slow dolly in" },
  { name: "UGC / Selfie", color: "#ff9f5a", prompt: "authentic handheld smartphone footage, natural daylight, casual real-life setting, person talking to camera", camera: "handheld, slight shake" },
  { name: "Producto en estudio", color: "#7cc8ff", prompt: "premium product commercial, seamless studio backdrop, crisp softbox lighting, glossy reflections, macro details", camera: "slow 360 orbit around the product" },
  { name: "Documental", color: "#e3d9c6", prompt: "documentary style, natural available light, candid moments, muted realistic colors", camera: "steady observational shot" },
  { name: "Neón nocturno", color: "#c77dff", prompt: "night city, neon signs, wet reflective streets, cyberpunk color palette, moody atmosphere", camera: "tracking shot following the subject" },
  { name: "Anime", color: "#ff6b9a", prompt: "high quality 2D anime style, vibrant colors, clean line art, expressive lighting", camera: "dynamic push in" },
];
const DEFAULT_FORMATS = [
  { name: "Reels / TikTok / Shorts", aspect: "9:16", duration: 8, resolution: "720p" },
  { name: "Feed Instagram", aspect: "3:4", duration: 6, resolution: "720p" },
  { name: "Cuadrado", aspect: "1:1", duration: 5, resolution: "720p" },
  { name: "YouTube / Web", aspect: "16:9", duration: 10, resolution: "720p" },
  { name: "Cinemascope", aspect: "21:9", duration: 8, resolution: "720p" },
  { name: "Borrador rápido", aspect: "16:9", duration: 4, resolution: "480p" },
];

const uid = () => crypto.randomUUID();
const byId = (store, id) => state[store].find((x) => x.id === id);
const $ = (sel) => document.querySelector(sel);

function storeGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(`vf:${key}`)) ?? fallback; } catch { return fallback; }
}
function storeSet(key, value) {
  try { localStorage.setItem(`vf:${key}`, JSON.stringify(value)); } catch {}
}

// ---------- DOM helpers ----------
function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
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
  setTimeout(() => el.remove(), type === "error" ? 7000 : 3500);
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
        onclick: async () => {
          if ((await a.onClick?.()) !== false) modal.close();
        },
      }, a.label),
    ),
  );
  modal.classList.toggle("wide", wide);
  modal.showModal();
}
$("#modal-close").addEventListener("click", () => modal.close());
$("#modal-form").addEventListener("submit", (e) => e.preventDefault());
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

function field(label, input, hint) {
  return h("label", { class: "field" }, h("span", {}, label), input, hint && h("small", {}, hint));
}
function selectEl(options, value) {
  return h("select", {}, options.map(([v, l]) => h("option", { value: v, selected: v === value }, l)));
}
function confirmModal(title, text, onConfirm) {
  openModal({
    title,
    body: h("p", { class: "muted" }, text),
    actions: [{ label: "Cancelar" }, { label: "Eliminar", class: "btn-danger", onClick: onConfirm }],
  });
}

function ratioBox(aspect, size = 22) {
  const [w, hgt] = aspect.split(":").map(Number);
  const scale = size / Math.max(w, hgt);
  return h("span", { class: "ratio-box", style: { width: `${w * scale}px`, height: `${hgt * scale}px` } });
}

// ---------- Images ----------
const objectUrls = new Map();
function refUrl(ref) {
  if (!objectUrls.has(ref.id)) objectUrls.set(ref.id, URL.createObjectURL(ref.blob));
  return objectUrls.get(ref.id);
}
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob();
}
async function normalizeImage(file) {
  const bitmap = await createImageBitmap(file);
  const max = 2048;
  const { width, height } = bitmap;
  if (Math.max(width, height) <= max && file.size < 8 * 1024 * 1024) {
    bitmap.close();
    return { blob: file, width, height };
  }
  const scale = Math.min(1, max / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.9));
  return { blob, width: canvas.width, height: canvas.height };
}
async function addReferences(files, boardId = null) {
  const added = [];
  for (const file of files) {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      toast(`${file.name}: formato no soportado (usa PNG, JPG o WEBP)`, "error");
      continue;
    }
    const { blob, width, height } = await normalizeImage(file);
    const ref = {
      id: uid(),
      name: file.name.replace(/\.[^.]+$/, ""),
      tags: [],
      boardId,
      blob,
      width,
      height,
      createdAt: Date.now(),
    };
    await dbPut("references", ref);
    state.references.push(ref);
    added.push(ref);
  }
  if (added.length) toast(`${added.length} referencia(s) guardada(s)`);
  return added;
}

// ---------- API ----------
async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json" },
    body: options.body && JSON.stringify(options.body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Error ${res.status}`), { status: res.status });
  return data;
}

async function loadStatus() {
  try {
    ui.status = { ...(await api("/api/status")), server: true };
  } catch {
    ui.status = { higgsfield: false, claude: false, server: false };
    toast("No hay servidor local. Abre la app con `npm start` en la carpeta video-generator.", "error");
  }
  $("#status-hf").className = `pill ${ui.status.higgsfield ? "on" : "off"}`;
  $("#status-claude").className = `pill ${ui.status.claude ? "on" : "off"}`;
  renderSettings();
}

// ---------- Context (client / project) ----------
function projectsForClient() {
  return state.projects.filter((p) => !ui.clientId || p.clientId === ui.clientId);
}

function renderContext() {
  $("#ctx-client").replaceChildren(
    h("option", { value: "" }, "Todos"),
    ...state.clients.map((c) => h("option", { value: c.id, selected: c.id === ui.clientId }, c.name)),
  );
  const projects = projectsForClient();
  if (ui.projectId && !projects.some((p) => p.id === ui.projectId)) ui.projectId = "";
  $("#ctx-project").replaceChildren(
    h("option", { value: "" }, "Sin proyecto"),
    ...projects.map((p) => h("option", { value: p.id, selected: p.id === ui.projectId }, p.name)),
  );
  storeSet("ctx", { clientId: ui.clientId, projectId: ui.projectId });
}

function setClient(clientId, { applyDefaults = true } = {}) {
  ui.clientId = clientId;
  renderContext();
  if (applyDefaults) {
    const client = byId("clients", clientId);
    if (client?.defaultFormatId && byId("formats", client.defaultFormatId)) applyFormat(client.defaultFormatId);
    if (client?.defaultStyleId && byId("styles", client.defaultStyleId)) $("#opt-style").value = client.defaultStyleId;
  }
  renderFeed();
}

function setProject(projectId) {
  ui.projectId = projectId;
  const project = byId("projects", projectId);
  if (project?.clientId && project.clientId !== ui.clientId) {
    setClient(project.clientId);
    ui.projectId = projectId;
  }
  renderContext();
  renderFeed();
}

$("#ctx-client").addEventListener("change", (e) => setClient(e.target.value));
$("#ctx-project").addEventListener("change", (e) => setProject(e.target.value));

// ---------- Navigation ----------
function showView(view) {
  ui.view = view;
  document.querySelectorAll(".rail-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  const renderers = { create: renderFeed, projects: renderProjects, references: renderReferences, clients: renderClients, styles: renderStyles, settings: renderSettings };
  renderers[view]?.();
}
document.querySelectorAll(".rail-btn").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));

// ---------- Composer ----------
function renderComposerOptions() {
  const styleSel = $("#opt-style");
  const prevStyle = styleSel.value;
  styleSel.replaceChildren(h("option", { value: "" }, "Ninguno"), ...state.styles.map((s) => h("option", { value: s.id }, s.name)));
  styleSel.value = byId("styles", prevStyle) ? prevStyle : "";

  const formatSel = $("#opt-format");
  const prevFormat = formatSel.value;
  formatSel.replaceChildren(h("option", { value: "" }, "Personalizado"), ...state.formats.map((f) => h("option", { value: f.id }, `${f.name} · ${f.aspect}`)));
  formatSel.value = byId("formats", prevFormat) ? prevFormat : "";

  $("#opt-duration").replaceChildren(...DURATIONS.map((d) => h("option", { value: d }, `${d} s`)));
  $("#opt-duration").value = storeGet("duration", 5);

  $("#opt-aspect").replaceChildren(
    ...ASPECTS.map((a) => h("button", { type: "button", "data-value": a, title: a, class: a === ui.aspect ? "active" : "", onclick: () => setAspect(a, true) }, a)),
  );
  updateModelHint();
}

function setAspect(aspect, manual = false) {
  ui.aspect = aspect;
  document.querySelectorAll("#opt-aspect button").forEach((b) => b.classList.toggle("active", b.dataset.value === aspect));
  if (manual) $("#opt-format").value = "";
  storeSet("aspect", aspect);
}
function setResolution(res, manual = false) {
  ui.resolution = res;
  document.querySelectorAll("#opt-resolution button").forEach((b) => b.classList.toggle("active", b.dataset.value === res));
  if (manual) $("#opt-format").value = "";
  storeSet("resolution", res);
}
document.querySelectorAll("#opt-resolution button").forEach((b) => b.addEventListener("click", () => setResolution(b.dataset.value, true)));
$("#opt-duration").addEventListener("change", (e) => { $("#opt-format").value = ""; storeSet("duration", Number(e.target.value)); });

function applyFormat(formatId) {
  const f = byId("formats", formatId);
  $("#opt-format").value = f ? f.id : "";
  if (!f) return;
  setAspect(f.aspect);
  setResolution(f.resolution);
  $("#opt-duration").value = f.duration;
}
$("#opt-format").addEventListener("change", (e) => applyFormat(e.target.value));

function updateModelHint() {
  const i2v = Boolean(ui.start);
  document.querySelectorAll("#opt-aspect button").forEach((b) => (b.disabled = i2v));
  $("#opt-aspect-wrap").title = i2v ? "Con frame inicial, el aspecto lo define la imagen" : "";
  $("#slot-end").disabled = !i2v;
  $("#composer-model").textContent = i2v
    ? `Seedance 2.5 · image-to-video${ui.end ? " · con frame final" : ""} · el aspecto lo define la imagen`
    : "Seedance 2.5 · text-to-video";
}

function renderSlot(slot) {
  const btn = $(`#slot-${slot}`);
  const ref = byId("references", ui[slot]);
  if (!ref) ui[slot] = null;
  btn.classList.toggle("filled", Boolean(ref));
  btn.replaceChildren(
    ...(ref
      ? [
          h("img", { src: refUrl(ref), alt: ref.name }),
          h("span", {
            class: "frame-clear",
            title: "Quitar",
            onclick: (e) => {
              e.stopPropagation();
              setSlot(slot, null);
            },
          }, "✕"),
        ]
      : [h("span", { class: "frame-plus" }, "+"), h("span", { class: "frame-label" }, slot === "start" ? "Inicio" : "Final")]),
  );
}
function setSlot(slot, refId) {
  ui[slot] = refId;
  if (slot === "start" && !refId) ui.end = null;
  renderSlot("start");
  renderSlot("end");
  updateModelHint();
}
document.querySelectorAll(".frame-slot").forEach((b) => b.addEventListener("click", () => pickReference(b.dataset.slot)));

function pickReference(slot) {
  const fileInput = h("input", { type: "file", accept: "image/png,image/jpeg,image/webp", hidden: true });
  fileInput.addEventListener("change", async () => {
    const [ref] = await addReferences(fileInput.files, ui.boardId !== "all" && ui.boardId !== "none" ? ui.boardId : null);
    if (ref) {
      setSlot(slot, ref.id);
      modal.close();
    }
  });
  const boardSel = selectEl([["all", "Todos los tableros"], ...state.boards.map((b) => [b.id, b.name])], "all");
  const grid = h("div", { class: "picker" });
  const renderGrid = () => {
    const refs = state.references.filter((r) => boardSel.value === "all" || r.boardId === boardSel.value).sort((a, b) => b.createdAt - a.createdAt);
    grid.replaceChildren(
      ...(refs.length
        ? refs.map((r) => h("button", { type: "button", title: r.name, onclick: () => { setSlot(slot, r.id); modal.close(); } }, h("img", { src: refUrl(r), alt: r.name })))
        : [h("p", { class: "muted" }, "No hay referencias todavía. Sube una imagen.")]),
    );
  };
  boardSel.addEventListener("change", renderGrid);
  renderGrid();
  openModal({
    title: slot === "start" ? "Frame inicial" : "Frame final",
    wide: true,
    body: [
      h("div", { class: "row" }, boardSel, h("label", { class: "btn-primary" }, "Subir imagen", fileInput)),
      grid,
    ],
  });
}

function currentStyle() {
  return byId("styles", $("#opt-style").value);
}
function clientContext() {
  const c = byId("clients", ui.clientId);
  return c ? [c.name, c.industry, c.brand].filter(Boolean).join(". ") : "";
}
function styleContext() {
  const s = currentStyle();
  return s ? `${s.name}: ${s.prompt}${s.camera ? `. Camera: ${s.camera}` : ""}` : "";
}
function buildFinalPrompt(prompt) {
  const s = currentStyle();
  return [prompt.trim(), s?.prompt, s?.camera && `Camera: ${s.camera}`].filter(Boolean).join(". ");
}

async function enhance(mode) {
  const promptEl = $("#prompt");
  if (!promptEl.value.trim()) return toast("Escribe primero una idea.", "error");
  const btn = mode === "variations" ? $("#btn-variations") : $("#btn-enhance");
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Pensando…";
  try {
    const data = await api("/api/enhance", {
      method: "POST",
      body: { prompt: promptEl.value, style: styleContext(), client: clientContext(), mode },
    });
    if (mode === "variations") {
      const box = $("#suggestions");
      box.replaceChildren(
        ...data.variations.map((v) => h("button", { class: "suggestion", onclick: () => { promptEl.value = v; box.classList.add("hidden"); } }, v)),
        h("button", { class: "btn-ghost", onclick: () => box.classList.add("hidden") }, "Cerrar sugerencias"),
      );
      box.classList.remove("hidden");
    } else {
      promptEl.dataset.original = promptEl.value;
      promptEl.value = data.prompt;
      autoGrow();
      toast("Prompt mejorado con Claude");
    }
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}
$("#btn-enhance").addEventListener("click", () => enhance("rewrite"));
$("#btn-variations").addEventListener("click", () => enhance("variations"));

async function generate() {
  const prompt = $("#prompt").value;
  if (!prompt.trim() && !ui.start) return toast("Escribe un prompt o agrega un frame inicial.", "error");
  if (!ui.status.higgsfield) return toast("Higgsfield no está configurado: agrega HF_CREDENTIALS en .env.local y reinicia el servidor.", "error");
  const startRef = byId("references", ui.start);
  const endRef = byId("references", ui.end);
  const gen = {
    id: uid(),
    status: "pending",
    prompt,
    finalPrompt: buildFinalPrompt(prompt),
    styleId: $("#opt-style").value || null,
    formatId: $("#opt-format").value || null,
    aspect: startRef ? null : ui.aspect,
    duration: Number($("#opt-duration").value),
    resolution: ui.resolution,
    audio: $("#opt-audio").checked,
    startRefId: startRef?.id || null,
    endRefId: endRef?.id || null,
    model: startRef ? "seedance-2.5 · image-to-video" : "seedance-2.5 · text-to-video",
    clientId: ui.clientId || null,
    projectId: ui.projectId || null,
    createdAt: Date.now(),
  };
  const btn = $("#btn-generate");
  btn.disabled = true;
  try {
    const { jobId } = await api("/api/generate", {
      method: "POST",
      body: {
        prompt: gen.finalPrompt,
        duration: gen.duration,
        resolution: gen.resolution,
        aspect_ratio: ui.aspect,
        generate_audio: gen.audio,
        start_image: startRef ? await blobToDataUrl(startRef.blob) : undefined,
        end_image: endRef ? await blobToDataUrl(endRef.blob) : undefined,
      },
    });
    gen.jobId = jobId;
    await dbPut("generations", gen);
    state.generations.push(gen);
    ui.feedFilter = "all";
    renderFeed();
    toast("Generación en cola");
    schedulePoll();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
  }
}
$("#btn-generate").addEventListener("click", generate);
$("#prompt").addEventListener("input", autoGrow);
function autoGrow() {
  const el = $("#prompt");
  el.style.height = "auto";
  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
}
$("#prompt").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    generate();
  }
});

// ---------- Polling ----------
let pollTimer = null;
function schedulePoll() {
  clearTimeout(pollTimer);
  if (state.generations.some((g) => g.status === "pending")) pollTimer = setTimeout(pollJobs, 4000);
}
async function pollJobs() {
  const pending = state.generations.filter((g) => g.status === "pending");
  let changed = false;
  for (const gen of pending) {
    try {
      const job = await api(`/api/jobs/${gen.jobId}`);
      if (job.status === "completed" || job.status === "failed") {
        Object.assign(gen, { status: job.status, videoUrl: job.videoUrl || null, error: job.error || null, requestId: job.requestId || null });
        await dbPut("generations", gen);
        changed = true;
        toast(job.status === "completed" ? "¡Video listo!" : `Falló la generación: ${job.error}`, job.status === "completed" ? "info" : "error");
      } else if (gen.stage !== job.status) {
        gen.stage = job.status;
        changed = true;
      }
    } catch (err) {
      if (err.status === 404) {
        Object.assign(gen, { status: "failed", error: "Se perdió el seguimiento porque el servidor se reinició. Revisa tu historial en Higgsfield." });
        await dbPut("generations", gen);
        changed = true;
      }
    }
  }
  if (changed && ui.view === "create") renderFeed();
  schedulePoll();
}

// ---------- Feed ----------
document.querySelectorAll("#feed-filters .chip").forEach((c) =>
  c.addEventListener("click", () => {
    ui.feedFilter = c.dataset.filter;
    renderFeed();
  }),
);

function renderFeed() {
  document.querySelectorAll("#feed-filters .chip").forEach((c) => c.classList.toggle("active", c.dataset.filter === ui.feedFilter));
  const project = byId("projects", ui.projectId);
  const client = byId("clients", ui.clientId);
  $("#feed-title").textContent = project ? project.name : client ? `Generaciones · ${client.name}` : "Generaciones";
  const gens = state.generations
    .filter((g) => (ui.projectId ? g.projectId === ui.projectId : !ui.clientId || g.clientId === ui.clientId))
    .filter((g) => ui.feedFilter === "all" || g.status === ui.feedFilter)
    .sort((a, b) => b.createdAt - a.createdAt);
  $("#feed").replaceChildren(
    ...(gens.length
      ? gens.map(genCard)
      : [h("div", { class: "empty" }, h("strong", {}, "Aún no hay videos aquí"), "Escribe un prompt abajo, elige formato y estilo, y pulsa Generar.")]),
  );
}

function genCard(g) {
  const style = byId("styles", g.styleId);
  const media = h("div", { class: "gen-media", style: g.aspect ? { aspectRatio: g.aspect.replace(":", " / ") } : {} });
  if (g.status === "completed" && /^https:\/\//.test(g.videoUrl || "")) {
    const video = h("video", { src: g.videoUrl, muted: true, loop: true, playsInline: true, controls: true, preload: "metadata" });
    media.addEventListener("mouseenter", () => video.play().catch(() => {}));
    media.addEventListener("mouseleave", () => video.pause());
    media.append(video);
  } else if (g.status === "pending") {
    const stage = { uploading: "Subiendo referencias…", generating: "Generando video…" }[g.stage] || "En cola…";
    media.append(h("div", { class: "gen-state" }, h("div", { class: "spinner" }), stage));
  } else {
    media.append(h("div", { class: "gen-state failed" }, g.error || "Falló la generación"));
  }
  const actions = [
    h("button", { title: "Cargar en el compositor", onclick: () => reuseGeneration(g) }, "Reusar"),
  ];
  if (g.status === "completed" && g.videoUrl) {
    actions.push(
      h("a", { href: g.videoUrl, target: "_blank", rel: "noopener", download: "" }, "Descargar"),
      h("button", { onclick: () => saveToCycle(g) }, "A ciclo"),
    );
  }
  actions.push(
    h("span", { class: "spacer" }),
    h("button", {
      title: "Eliminar",
      onclick: () =>
        confirmModal("Eliminar generación", "Se borrará del historial local (el video sigue en Higgsfield).", async () => {
          await dbDel("generations", g.id);
          state.generations = state.generations.filter((x) => x.id !== g.id);
          renderFeed();
        }),
    }, "✕"),
  );
  return h("article", { class: "gen" },
    media,
    h("div", { class: "gen-body" },
      h("div", { class: "gen-prompt", title: g.finalPrompt }, g.prompt || "(solo imagen)"),
      h("div", { class: "gen-meta" },
        h("span", { class: "tag" }, g.aspect || "auto"),
        h("span", { class: "tag" }, `${g.duration}s`),
        h("span", { class: "tag" }, g.resolution),
        g.startRefId && h("span", { class: "tag" }, "img→video"),
        style && h("span", { class: "tag accent" }, style.name),
      ),
      h("div", { class: "gen-actions" }, actions),
    ),
  );
}

function reuseGeneration(g) {
  $("#prompt").value = g.prompt;
  if (byId("styles", g.styleId)) $("#opt-style").value = g.styleId;
  if (g.aspect) setAspect(g.aspect);
  setResolution(g.resolution);
  $("#opt-duration").value = g.duration;
  $("#opt-format").value = byId("formats", g.formatId) ? g.formatId : "";
  $("#opt-audio").checked = g.audio !== false;
  setSlot("start", byId("references", g.startRefId) ? g.startRefId : null);
  if (byId("references", g.endRefId)) setSlot("end", g.endRefId);
  $("#prompt").focus();
}

async function saveToCycle(g) {
  let cycles = [];
  try {
    ({ cycles } = await api("/api/cycles"));
  } catch (err) {
    return toast(err.message, "error");
  }
  if (!cycles.length) {
    return openModal({
      title: "Guardar en ciclo de contenido",
      body: h("p", { class: "muted" }, "No hay ciclos en content/cycles/. Crea uno corriendo /content-cycle en Claude Code; el planificador crea las carpetas de cada pieza."),
      actions: [{ label: "Entendido", class: "btn-primary" }],
    });
  }
  const cycleSel = selectEl(cycles.map((c) => [c.id, c.id]), cycles[0].id);
  const piezaSel = h("select");
  const fillPiezas = () => {
    const c = cycles.find((x) => x.id === cycleSel.value);
    piezaSel.replaceChildren(...(c.piezas.length ? c.piezas.map((p) => h("option", { value: p }, p)) : [h("option", { value: "" }, "Este ciclo no tiene piezas")]));
  };
  cycleSel.addEventListener("change", fillPiezas);
  fillPiezas();
  const name = h("input", { type: "text", value: `video-${new Date(g.createdAt).toISOString().slice(0, 10)}-${g.id.slice(0, 6)}` });
  openModal({
    title: "Guardar en ciclo de contenido",
    body: [
      h("p", { class: "muted" }, "Descarga el video a piezas/<pieza>/media/ para que el agente publicar lo detecte."),
      field("Ciclo", cycleSel),
      field("Pieza", piezaSel),
      field("Nombre de archivo", name, "Solo letras, números, guiones, puntos y guion bajo."),
    ],
    actions: [
      { label: "Cancelar" },
      {
        label: "Guardar",
        class: "btn-primary",
        onClick: async () => {
          if (!piezaSel.value) {
            toast("Elige una pieza.", "error");
            return false;
          }
          try {
            const { path } = await api("/api/save-to-cycle", { method: "POST", body: { url: g.videoUrl, cycle: cycleSel.value, pieza: piezaSel.value, filename: name.value.trim() } });
            toast(`Guardado en ${path}`);
          } catch (err) {
            toast(err.message, "error");
            return false;
          }
        },
      },
    ],
  });
}

// ---------- Projects ----------
function projectForm(project = {}) {
  const name = h("input", { type: "text", value: project.name || "", placeholder: "Campaña de lanzamiento" });
  const client = selectEl([["", "Sin cliente"], ...state.clients.map((c) => [c.id, c.name])], project.id ? project.clientId || "" : ui.clientId);
  const desc = h("textarea", { placeholder: "Objetivo, mensajes clave, entregables…" }, project.description || "");
  openModal({
    title: project.id ? "Editar proyecto" : "Nuevo proyecto",
    body: [field("Nombre", name), field("Cliente", client), field("Descripción / brief", desc)],
    actions: [
      { label: "Cancelar" },
      {
        label: project.id ? "Guardar" : "Crear",
        class: "btn-primary",
        onClick: async () => {
          if (!name.value.trim()) {
            toast("El proyecto necesita un nombre.", "error");
            return false;
          }
          const record = { ...project, id: project.id || uid(), name: name.value.trim(), clientId: client.value || null, description: desc.value.trim(), createdAt: project.createdAt || Date.now() };
          await dbPut("projects", record);
          state.projects = state.projects.filter((p) => p.id !== record.id).concat(record);
          renderContext();
          renderProjects();
          if (!project.id) toast("Proyecto creado");
        },
      },
    ],
  });
}
$("#btn-new-project").addEventListener("click", () => projectForm());

function renderProjects() {
  const grid = $("#projects-grid");
  const projects = [...state.projects].sort((a, b) => b.createdAt - a.createdAt);
  if (!projects.length) return grid.replaceChildren(h("div", { class: "empty" }, h("strong", {}, "Sin proyectos"), "Crea un proyecto para agrupar las generaciones de una campaña."));
  grid.replaceChildren(
    ...projects.map((p) => {
      const client = byId("clients", p.clientId);
      const gens = state.generations.filter((g) => g.projectId === p.id);
      return h("div", { class: `card ${p.id === ui.projectId ? "selected" : ""}` },
        h("div", { class: "card-top" },
          h("span", { class: "swatch", style: { background: client?.color || "#363642" } }, (client?.name || "?")[0].toUpperCase()),
          h("span", { class: "card-title" }, p.name),
        ),
        h("div", { class: "gen-meta" },
          h("span", { class: "tag" }, client?.name || "Sin cliente"),
          h("span", { class: "tag" }, `${gens.length} video(s)`),
          h("span", { class: "tag" }, `${gens.filter((g) => g.status === "completed").length} listos`),
        ),
        p.description && h("p", { class: "card-text" }, p.description),
        h("div", { class: "card-actions" },
          h("button", { class: "btn-primary", onclick: () => { setProject(p.id); showView("create"); } }, "Abrir"),
          h("button", { class: "btn-secondary", onclick: () => projectForm(p) }, "Editar"),
          h("button", {
            class: "btn-danger",
            onclick: () =>
              confirmModal("Eliminar proyecto", `"${p.name}" se eliminará. Sus videos quedarán en el historial sin proyecto.`, async () => {
                await dbDel("projects", p.id);
                state.projects = state.projects.filter((x) => x.id !== p.id);
                for (const g of state.generations.filter((g) => g.projectId === p.id)) {
                  g.projectId = null;
                  await dbPut("generations", g);
                }
                if (ui.projectId === p.id) ui.projectId = "";
                renderContext();
                renderProjects();
              }),
          }, "Eliminar"),
        ),
      );
    }),
  );
}

// ---------- References ----------
$("#btn-new-board").addEventListener("click", () => boardForm());
function boardForm(board = {}) {
  const name = h("input", { type: "text", value: board.name || "", placeholder: "Moodboard verano 2026" });
  const client = selectEl([["", "Sin cliente"], ...state.clients.map((c) => [c.id, c.name])], board.id ? board.clientId || "" : ui.clientId);
  const desc = h("textarea", { placeholder: "Para qué sirve este tablero" }, board.description || "");
  openModal({
    title: board.id ? "Editar tablero" : "Nuevo tablero",
    body: [field("Nombre", name), field("Cliente", client), field("Descripción", desc)],
    actions: [
      { label: "Cancelar" },
      {
        label: board.id ? "Guardar" : "Crear",
        class: "btn-primary",
        onClick: async () => {
          if (!name.value.trim()) {
            toast("El tablero necesita un nombre.", "error");
            return false;
          }
          const record = { ...board, id: board.id || uid(), name: name.value.trim(), clientId: client.value || null, description: desc.value.trim(), createdAt: board.createdAt || Date.now() };
          await dbPut("boards", record);
          state.boards = state.boards.filter((b) => b.id !== record.id).concat(record);
          ui.boardId = record.id;
          renderReferences();
        },
      },
    ],
  });
}

function renderReferences() {
  const boards = [...state.boards].sort((a, b) => a.name.localeCompare(b.name));
  if (ui.boardId !== "all" && ui.boardId !== "none" && !byId("boards", ui.boardId)) ui.boardId = "all";
  const count = (id) => state.references.filter((r) => (id === "all" ? true : id === "none" ? !r.boardId : r.boardId === id)).length;
  const item = (id, label, color) =>
    h("li", {}, h("button", { class: `board-item ${ui.boardId === id ? "active" : ""}`, onclick: () => { ui.boardId = id; renderReferences(); } },
      color && h("span", { class: "dot", style: { background: color } }),
      h("span", { class: "board-name" }, label),
      h("span", { class: "count" }, count(id)),
    ));
  $("#boards-list").replaceChildren(
    item("all", "Todas las referencias"),
    item("none", "Sin tablero"),
    ...boards.map((b) => item(b.id, b.name, byId("clients", b.clientId)?.color || "#6e6e7c")),
  );

  const board = byId("boards", ui.boardId);
  $("#board-title").textContent = board ? board.name : ui.boardId === "none" ? "Sin tablero" : "Todas las referencias";
  $("#board-actions").replaceChildren(
    ...(board
      ? [
          h("button", { class: "btn-secondary", onclick: () => boardForm(board) }, "Editar"),
          h("button", {
            class: "btn-danger",
            onclick: () =>
              confirmModal("Eliminar tablero", "Las imágenes no se borran: pasan a “Sin tablero”.", async () => {
                await dbDel("boards", board.id);
                state.boards = state.boards.filter((b) => b.id !== board.id);
                for (const r of state.references.filter((r) => r.boardId === board.id)) {
                  r.boardId = null;
                  await dbPut("references", r);
                }
                ui.boardId = "all";
                renderReferences();
              }),
          }, "Eliminar"),
        ]
      : []),
  );

  const q = ui.refSearch.toLowerCase();
  const refs = state.references
    .filter((r) => (ui.boardId === "all" ? true : ui.boardId === "none" ? !r.boardId : r.boardId === ui.boardId))
    .filter((r) => !q || r.name.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)))
    .sort((a, b) => b.createdAt - a.createdAt);
  $("#refs-grid").replaceChildren(
    ...(refs.length
      ? refs.map(refCard)
      : [h("p", { class: "muted" }, q ? "Nada coincide con la búsqueda." : "Este tablero está vacío. Sube imágenes arriba.")]),
  );
}

function refCard(r) {
  const useAs = (slot) => {
    if (slot === "end" && !ui.start) return toast("Primero elige un frame inicial.", "error");
    setSlot(slot, r.id);
    showView("create");
    toast(`Referencia usada como frame ${slot === "start" ? "inicial" : "final"}`);
  };
  return h("figure", { class: "ref", tabindex: "0" },
    h("img", { src: refUrl(r), alt: r.name, loading: "lazy" }),
    h("figcaption", { class: "ref-overlay" },
      h("div", { class: "ref-name" }, r.name),
      r.tags.length > 0 && h("div", { class: "ref-tags" }, r.tags.map((t) => h("span", { class: "tag" }, t))),
      h("div", { class: "ref-actions" },
        h("button", { onclick: () => useAs("start") }, "Inicio"),
        h("button", { onclick: () => useAs("end") }, "Final"),
        h("button", { onclick: () => refForm(r) }, "Editar"),
        h("button", {
          onclick: () =>
            confirmModal("Eliminar referencia", `Se borrará "${r.name}" de este navegador.`, async () => {
              await dbDel("references", r.id);
              state.references = state.references.filter((x) => x.id !== r.id);
              URL.revokeObjectURL(objectUrls.get(r.id));
              objectUrls.delete(r.id);
              if (ui.start === r.id) setSlot("start", null);
              if (ui.end === r.id) setSlot("end", null);
              renderReferences();
            }),
        }, "✕"),
      ),
    ),
  );
}

function refForm(r) {
  const name = h("input", { type: "text", value: r.name });
  const tags = h("input", { type: "text", value: r.tags.join(", "), placeholder: "personaje, noche, producto" });
  const board = selectEl([["", "Sin tablero"], ...state.boards.map((b) => [b.id, b.name])], r.boardId || "");
  openModal({
    title: "Editar referencia",
    body: [h("img", { src: refUrl(r), alt: r.name, style: { width: "100%", maxHeight: "260px", objectFit: "contain", borderRadius: "10px", background: "#000" } }), field("Nombre", name), field("Etiquetas", tags, "Separadas por coma"), field("Tablero", board)],
    actions: [
      { label: "Cancelar" },
      {
        label: "Guardar",
        class: "btn-primary",
        onClick: async () => {
          Object.assign(r, { name: name.value.trim() || r.name, tags: tags.value.split(",").map((t) => t.trim()).filter(Boolean), boardId: board.value || null });
          await dbPut("references", r);
          renderReferences();
        },
      },
    ],
  });
}

const dropzone = $("#dropzone");
const targetBoard = () => (ui.boardId === "all" || ui.boardId === "none" ? null : ui.boardId);
$("#ref-files").addEventListener("change", async (e) => {
  await addReferences(e.target.files, targetBoard());
  e.target.value = "";
  renderReferences();
});
dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("over"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("over"));
dropzone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropzone.classList.remove("over");
  await addReferences(e.dataTransfer.files, targetBoard());
  renderReferences();
});
$("#refs-search").addEventListener("input", (e) => { ui.refSearch = e.target.value; renderReferences(); });

// ---------- Clients ----------
$("#btn-new-client").addEventListener("click", () => clientForm());
function clientForm(client = {}) {
  const name = h("input", { type: "text", value: client.name || "", placeholder: "Nombre del cliente o marca" });
  const color = h("input", { type: "color", value: client.color || "#c6f432" });
  const industry = h("input", { type: "text", value: client.industry || "", placeholder: "Ej: café de especialidad, fitness, inmobiliaria" });
  const brand = h("textarea", { placeholder: "Tono, público, colores, qué evitar… Claude lo usa al mejorar prompts." }, client.brand || "");
  const format = selectEl([["", "Ninguno"], ...state.formats.map((f) => [f.id, `${f.name} · ${f.aspect}`])], client.defaultFormatId || "");
  const style = selectEl([["", "Ninguno"], ...state.styles.map((s) => [s.id, s.name])], client.defaultStyleId || "");
  openModal({
    title: client.id ? "Editar cliente" : "Nuevo cliente",
    body: [
      h("div", { class: "field-row" }, field("Nombre", name), field("Color de marca", color)),
      field("Industria / nicho", industry),
      field("Contexto de marca", brand),
      h("div", { class: "field-row" }, field("Formato por defecto", format), field("Estilo por defecto", style)),
    ],
    actions: [
      { label: "Cancelar" },
      {
        label: client.id ? "Guardar" : "Crear",
        class: "btn-primary",
        onClick: async () => {
          if (!name.value.trim()) {
            toast("El cliente necesita un nombre.", "error");
            return false;
          }
          const record = {
            ...client,
            id: client.id || uid(),
            name: name.value.trim(),
            color: color.value,
            industry: industry.value.trim(),
            brand: brand.value.trim(),
            defaultFormatId: format.value || null,
            defaultStyleId: style.value || null,
            createdAt: client.createdAt || Date.now(),
          };
          await dbPut("clients", record);
          state.clients = state.clients.filter((c) => c.id !== record.id).concat(record);
          renderContext();
          renderClients();
        },
      },
    ],
  });
}

function renderClients() {
  const grid = $("#clients-grid");
  if (!state.clients.length) return grid.replaceChildren(h("div", { class: "empty" }, h("strong", {}, "Sin clientes"), "Agrega un cliente con su contexto de marca, formato y estilo por defecto."));
  grid.replaceChildren(
    ...[...state.clients].sort((a, b) => a.name.localeCompare(b.name)).map((c) => {
      const fmt = byId("formats", c.defaultFormatId);
      const sty = byId("styles", c.defaultStyleId);
      return h("div", { class: `card ${c.id === ui.clientId ? "selected" : ""}` },
        h("div", { class: "card-top" },
          h("span", { class: "swatch", style: { background: c.color } }, c.name[0].toUpperCase()),
          h("span", { class: "card-title" }, c.name),
        ),
        h("div", { class: "gen-meta" },
          c.industry && h("span", { class: "tag" }, c.industry),
          fmt && h("span", { class: "tag" }, fmt.aspect),
          sty && h("span", { class: "tag accent" }, sty.name),
          h("span", { class: "tag" }, `${state.projects.filter((p) => p.clientId === c.id).length} proyecto(s)`),
        ),
        c.brand && h("p", { class: "card-text" }, c.brand),
        h("div", { class: "card-actions" },
          h("button", { class: "btn-primary", onclick: () => { setClient(c.id); showView("create"); } }, "Trabajar"),
          h("button", { class: "btn-secondary", onclick: () => clientForm(c) }, "Editar"),
          h("button", {
            class: "btn-danger",
            onclick: () =>
              confirmModal("Eliminar cliente", `"${c.name}" se eliminará. Sus proyectos y tableros quedarán sin cliente.`, async () => {
                await dbDel("clients", c.id);
                state.clients = state.clients.filter((x) => x.id !== c.id);
                for (const store of ["projects", "boards", "generations"]) {
                  for (const item of state[store].filter((x) => x.clientId === c.id)) {
                    item.clientId = null;
                    await dbPut(store, item);
                  }
                }
                if (ui.clientId === c.id) ui.clientId = "";
                renderContext();
                renderClients();
              }),
          }, "Eliminar"),
        ),
      );
    }),
  );
}

// ---------- Styles & formats ----------
$("#btn-new-style").addEventListener("click", () => styleForm());
$("#btn-new-format").addEventListener("click", () => formatForm());

function styleForm(style = {}) {
  const name = h("input", { type: "text", value: style.name || "", placeholder: "Ej: Lujo minimalista" });
  const color = h("input", { type: "color", value: style.color || "#c6f432" });
  const prompt = h("textarea", { placeholder: "Descriptores visuales que se añaden al prompt (en inglés rinde mejor)" }, style.prompt || "");
  const camera = h("input", { type: "text", value: style.camera || "", placeholder: "slow dolly in, orbit, handheld…" });
  openModal({
    title: style.id ? "Editar estilo" : "Nuevo estilo",
    body: [h("div", { class: "field-row" }, field("Nombre", name), field("Color", color)), field("Dirección visual", prompt), field("Movimiento de cámara", camera)],
    actions: [
      { label: "Cancelar" },
      {
        label: "Guardar",
        class: "btn-primary",
        onClick: async () => {
          if (!name.value.trim()) {
            toast("El estilo necesita un nombre.", "error");
            return false;
          }
          const record = { ...style, id: style.id || uid(), name: name.value.trim(), color: color.value, prompt: prompt.value.trim(), camera: camera.value.trim(), createdAt: style.createdAt || Date.now() };
          await dbPut("styles", record);
          state.styles = state.styles.filter((s) => s.id !== record.id).concat(record);
          renderComposerOptions();
          renderStyles();
        },
      },
    ],
  });
}

function formatForm(format = {}) {
  const name = h("input", { type: "text", value: format.name || "", placeholder: "Ej: Stories cliente X" });
  const aspect = selectEl(ASPECTS.map((a) => [a, a]), format.aspect || "9:16");
  const duration = selectEl(DURATIONS.map((d) => [String(d), `${d} s`]), String(format.duration || 5));
  const resolution = selectEl([["480p", "480p"], ["720p", "720p"]], format.resolution || "720p");
  openModal({
    title: format.id ? "Editar formato" : "Nuevo formato",
    body: [field("Nombre", name), h("div", { class: "field-row" }, field("Aspecto", aspect), field("Duración", duration)), field("Calidad", resolution, "Seedance 2.5 admite 480p y 720p.")],
    actions: [
      { label: "Cancelar" },
      {
        label: "Guardar",
        class: "btn-primary",
        onClick: async () => {
          if (!name.value.trim()) {
            toast("El formato necesita un nombre.", "error");
            return false;
          }
          const record = { ...format, id: format.id || uid(), name: name.value.trim(), aspect: aspect.value, duration: Number(duration.value), resolution: resolution.value, createdAt: format.createdAt || Date.now() };
          await dbPut("formats", record);
          state.formats = state.formats.filter((f) => f.id !== record.id).concat(record);
          renderComposerOptions();
          renderStyles();
        },
      },
    ],
  });
}

function renderStyles() {
  $("#styles-grid").replaceChildren(
    ...state.styles.map((s) =>
      h("div", { class: "card" },
        h("div", { class: "card-top" }, h("span", { class: "swatch", style: { background: s.color } }), h("span", { class: "card-title" }, s.name)),
        h("p", { class: "card-text" }, s.prompt || "Sin descriptores"),
        s.camera && h("div", { class: "gen-meta" }, h("span", { class: "tag" }, `🎥 ${s.camera}`)),
        h("div", { class: "card-actions" },
          h("button", { class: "btn-primary", onclick: () => { $("#opt-style").value = s.id; showView("create"); } }, "Usar"),
          h("button", { class: "btn-secondary", onclick: () => styleForm(s) }, "Editar"),
          h("button", {
            class: "btn-danger",
            onclick: () =>
              confirmModal("Eliminar estilo", `Se eliminará "${s.name}".`, async () => {
                await dbDel("styles", s.id);
                state.styles = state.styles.filter((x) => x.id !== s.id);
                renderComposerOptions();
                renderStyles();
              }),
          }, "Eliminar"),
        ),
      ),
    ),
  );
  $("#formats-grid").replaceChildren(
    ...state.formats.map((f) =>
      h("div", { class: "card" },
        h("div", { class: "card-top" }, h("span", { class: "swatch", style: { background: "var(--surface-2)" } }, ratioBox(f.aspect)), h("span", { class: "card-title" }, f.name)),
        h("div", { class: "gen-meta" }, h("span", { class: "tag" }, f.aspect), h("span", { class: "tag" }, `${f.duration}s`), h("span", { class: "tag" }, f.resolution)),
        h("div", { class: "card-actions" },
          h("button", { class: "btn-primary", onclick: () => { applyFormat(f.id); showView("create"); } }, "Usar"),
          h("button", { class: "btn-secondary", onclick: () => formatForm(f) }, "Editar"),
          h("button", {
            class: "btn-danger",
            onclick: () =>
              confirmModal("Eliminar formato", `Se eliminará "${f.name}".`, async () => {
                await dbDel("formats", f.id);
                state.formats = state.formats.filter((x) => x.id !== f.id);
                renderComposerOptions();
                renderStyles();
              }),
          }, "Eliminar"),
        ),
      ),
    ),
  );
}

// ---------- Settings ----------
function renderSettings() {
  const s = ui.status;
  const item = (ok, title, text) => h("li", {}, h("span", { class: `pill ${ok ? "on" : "off"}`, style: { alignSelf: "flex-start" } }, title), h("span", { class: "muted" }, text));
  $("#conn-list").replaceChildren(
    item(s.server, "Servidor local", s.server ? "Conectado." : "Sin conexión. Ejecuta npm start en video-generator/."),
    item(s.higgsfield, "Higgsfield API", s.higgsfield ? "Credenciales cargadas desde .env.local (nunca llegan al navegador)." : "Agrega HF_CREDENTIALS=key-id:key-secret en .env.local y reinicia."),
    item(s.claude, "Claude (tu suscripción)", s.claude ? "Usando el CLI `claude` con tu sesión Pro para mejorar prompts. Sin API key." : "Instala Claude Code y ejecuta `claude` una vez para iniciar sesión con tu cuenta Pro."),
  );
}

$("#btn-export").addEventListener("click", async () => {
  const data = { app: "videoflow", version: 1, exportedAt: new Date().toISOString() };
  for (const store of STORES) data[store] = state[store];
  data.references = await Promise.all(state.references.map(async (r) => ({ ...r, blob: await blobToDataUrl(r.blob) })));
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: "application/json" }));
  h("a", { href: url, download: `videoflow-${new Date().toISOString().slice(0, 10)}.json` }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$("#import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== "videoflow") throw new Error("El archivo no es un respaldo de VideoFlow.");
    for (const store of STORES) {
      for (const item of data[store] || []) {
        if (store === "references") item.blob = await dataUrlToBlob(item.blob);
        await dbPut(store, item);
      }
    }
    await loadState();
    renderAll();
    toast("Respaldo importado");
  } catch (err) {
    toast(`No se pudo importar: ${err.message}`, "error");
  }
});

// ---------- Boot ----------
async function loadState() {
  for (const store of STORES) state[store] = await dbAll(store);
}

async function seedDefaults() {
  if (storeGet("seeded", false) || state.styles.length || state.formats.length) return;
  for (const s of DEFAULT_STYLES) {
    const record = { ...s, id: uid(), createdAt: Date.now() };
    await dbPut("styles", record);
    state.styles.push(record);
  }
  for (const f of DEFAULT_FORMATS) {
    const record = { ...f, id: uid(), createdAt: Date.now() };
    await dbPut("formats", record);
    state.formats.push(record);
  }
  storeSet("seeded", true);
}

function renderAll() {
  renderContext();
  renderComposerOptions();
  renderSlot("start");
  renderSlot("end");
  showView(ui.view);
}

(async () => {
  await loadState();
  await seedDefaults();
  const ctx = storeGet("ctx", {});
  ui.clientId = byId("clients", ctx.clientId) ? ctx.clientId : "";
  ui.projectId = byId("projects", ctx.projectId) ? ctx.projectId : "";
  ui.aspect = ASPECTS.includes(storeGet("aspect")) ? storeGet("aspect") : "16:9";
  setResolution(storeGet("resolution", "720p"));
  renderAll();
  loadStatus();
  schedulePoll();
})();

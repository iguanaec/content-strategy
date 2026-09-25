// Regenera public/catalog.json desde la documentación oficial de Higgsfield.
// Uso: node scripts/build-catalog.mjs
import { writeFile } from "node:fs/promises";

const DOCS = "https://docs.higgsfield.ai/docs";
const OUT = new URL("../public/catalog.json", import.meta.url);

const WORKFLOW_LABELS = [
  [/text to video/i, "Texto a video"],
  [/image to video/i, "Imagen a video"],
  [/reference to video/i, "Referencias a video"],
  [/first last frame/i, "Frame inicial y final"],
  [/image reference/i, "Referencias de imagen"],
  [/video reference/i, "Referencia de video"],
  [/video edit/i, "Editar video"],
  [/video extend/i, "Extender video"],
  [/motion transfer/i, "Transferir movimiento"],
  [/object swap/i, "Cambiar objeto"],
  [/^generate$/i, "Generar"],
  [/^pro$/i, "Pro"],
  [/^standard$/i, "Standard"],
];

function kindOf(id, props) {
  if (/motion-control|motion-transfer/.test(id)) return "motion";
  if (/object-swap/.test(id)) return "swap";
  if (/video-edit/.test(id)) return "edit";
  if (/video-extend/.test(id)) return "extend";
  if (props.image_urls || props.video_urls || props.audio_urls) return "reference";
  if (props.image_url || props.first_frame_url) return "image";
  return "text";
}

function labelOf(workflowTitle) {
  let label = workflowTitle;
  for (const [re, es] of WORKFLOW_LABELS) label = label.replace(new RegExp(re.source.replace(/^\^|\$$/g, ""), "i"), es);
  label = label.replace(/^(Pro|Standard) (?=Texto|Imagen)/, "$1 · ");
  return label.replace(/ (fast|pro)$/i, (_, v) => ` · ${v[0].toUpperCase()}${v.slice(1)}`);
}

// Precios de respaldo cuando /estimate devuelve solo una descripción (tarifas USD antes de descuento).
const PRICING = [
  [/^bytedance\/seedance-2\.5\/(video-edit|video-extend)$/, { type: "tokens", rates: { default: 0.01284 }, inputVideo: true }],
  [/^bytedance\/seedance-2\.5\//, { type: "tokens", rates: { default: 0.0214 } }],
  [/^higgsfield\/cinema-studio\//, { type: "tokens", rates: { default: 0.0214 }, withVideoRate: 0.01284 }],
  [/^bytedance\/seedance-2\.0\//, { type: "tokens", rates: { default: 0.014, "4k": 0.008 } }],
  [/^alibaba\/wan-3\.0\//, { type: "per_second", rates: { "480p": 0.05, "720p": 0.1, "1080p": 0.2 } }],
  [/^higgsfield\/genjutsu\//, { type: "per_input_second", rates: { "480p": 0.318, "720p": 0.681 } }],
];

async function text(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

function parseRequired(schema) {
  const required = [...(schema.required || [])];
  const oneOf = [];
  let node = schema;
  // if/else encadenado de "required": al menos uno de los grupos.
  while (node?.if?.required && !node.if.properties?.multi_shots) {
    oneOf.push(node.if.required);
    if (node.else?.if) node = node.else;
    else {
      if (node.else?.required) oneOf.push(node.else.required);
      break;
    }
  }
  // Kling O3/Omni: sin multi_shots aplica la rama else.
  if (schema.if?.properties?.multi_shots && schema.else?.required) required.push(...schema.else.required);
  return { required: [...new Set(required)], oneOf };
}

function trimParam(p) {
  const out = {};
  for (const k of ["type", "enum", "default", "minimum", "maximum", "multipleOf", "maxItems", "minItems", "title", "description", "maxLength"]) {
    if (p[k] !== undefined) out[k] = p[k];
  }
  if (p.items?.type === "object") out.itemsObject = true;
  return out;
}

const main = async () => {
  const overview = await text(`${DOCS}/models/video-generation.md`);
  const families = [];
  const cardRe = /href="\/docs\/models\/([\w-]+)">\s*<span className="featured-model-meta"><span>([^<]+)<\/span>.*?featured-model-title">([^<]+)<\/span>\s*<span className="featured-model-description">([^<]+)</gs;
  for (const [, slug, vendor, name, description] of overview.matchAll(cardRe)) {
    const page = await text(`${DOCS}/models/${slug}.md`);
    const workflowSlugs = [...page.matchAll(new RegExp(`\\(/docs/models/${slug}/([\\w-]+)\\)`, "g"))].map((m) => m[1]);
    const workflows = [];
    for (const w of [...new Set(workflowSlugs)]) {
      const md = await text(`${DOCS}/models/${slug}/${w}.md`);
      const id = /\*\*Endpoint ID:\*\* `([^`]+)`/.exec(md)?.[1];
      const title = /^# .+? — (.+?) API$/m.exec(md)?.[1] || w;
      const schemaJson = /Complete JSON schema">\s*```json[^\n]*\n([\s\S]*?)```/.exec(md)?.[1];
      if (!id || !schemaJson) continue;
      const schema = JSON.parse(schemaJson);
      const notes = (/## Usage notes\n([\s\S]*?)\n## /.exec(md)?.[1] || "")
        .split("\n")
        .filter((l) => l.startsWith("* "))
        .map((l) => l.slice(2).replace(/\\/g, "").trim());
      const params = Object.fromEntries(Object.entries(schema.properties || {}).map(([k, v]) => [k, trimParam(v)]));
      const { required, oneOf } = parseRequired(schema);
      workflows.push({
        id,
        label: labelOf(title),
        kind: kindOf(id, params),
        notes,
        params,
        required,
        oneOf,
        pricing: PRICING.find(([re]) => re.test(id))?.[1] || null,
        docs: `${DOCS}/models/${slug}/${w}`,
      });
      console.log("  ", id);
    }
    if (workflows.length) families.push({ slug, name, vendor, description, workflows });
  }
  await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), families }, null, 1));
  console.log(`${families.length} familias, ${families.reduce((n, f) => n + f.workflows.length, 0)} flujos → public/catalog.json`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

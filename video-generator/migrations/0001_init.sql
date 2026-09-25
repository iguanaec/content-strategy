-- Documentos de la app (clientes, proyectos, elementos, estilos, formatos, generaciones).
CREATE TABLE IF NOT EXISTS docs (
  store TEXT NOT NULL,
  id TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (store, id)
);

-- Archivos subidos (imágenes, videos, audios de referencia y videos generados).
CREATE TABLE IF NOT EXISTS media (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage TEXT NOT NULL,          -- 'r2' | 'd1'
  created_at INTEGER NOT NULL,
  hf_url TEXT,                    -- URL pública en el CDN de Higgsfield (cache de subida)
  hf_url_at INTEGER
);

-- Respaldo cuando R2 no está activado: el archivo se guarda en trozos dentro de D1.
CREATE TABLE IF NOT EXISTS media_chunks (
  key TEXT NOT NULL,
  idx INTEGER NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (key, idx)
);

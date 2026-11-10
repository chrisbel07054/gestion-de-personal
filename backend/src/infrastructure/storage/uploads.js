const path = require('path');
const multer = require('multer');
const fs = require('fs');

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'), false);
  cb(null, true);
}

const upload = multer({ storage, fileFilter, limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '2', 10) * 1024 * 1024) } });

function nombreArchivo(file) {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${base}_${Date.now()}${ext}`;
}

async function guardarFoto(file) {
  const nombre = nombreArchivo(file);
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET } = process.env;

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY && SUPABASE_BUCKET) {
    const base = SUPABASE_URL.replace(/\/+$/, '');
    const resp = await fetch(`${base}/storage/v1/object/${SUPABASE_BUCKET}/${nombre}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_SERVICE_KEY,
        'Content-Type': file.mimetype,
        'x-upsert': 'true',
      },
      body: file.buffer,
    });
    if (!resp.ok) {
      const detalle = await resp.text().catch(() => '');
      throw new Error(`No se pudo guardar la foto (${resp.status}) ${detalle}`);
    }
    return `${base}/storage/v1/object/public/${SUPABASE_BUCKET}/${nombre}`;
  }

  const destino = path.join(UPLOADS_DIR, nombre);
  fs.writeFileSync(destino, file.buffer);
  return path.relative(process.cwd(), destino).replace(/\\/g, '/');
}

module.exports = { upload, UPLOADS_DIR, guardarFoto };

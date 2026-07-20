// backend/src/routes/imagenes.routes.js
// ── CORRECCIONES respecto a la versión anterior ──
//   1. fileFilter: acepta image/* en lugar de lista fija (evitaba JPEG válidos)
//   2. Manejo explícito de errores de multer (devuelve JSON, no HTML)
//   3. Agregados endpoints GET y DELETE

const router      = require('express').Router();
const multer      = require('multer');
const path        = require('path');
const fs          = require('fs');
const authMiddleware = require('../middlewares/auth.middleware');
const { subirImagenes, obtenerImagenes, eliminarImagen } = require('../controllers/imagenes.controller');

// ── CARPETA DE UPLOADS ──
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── CONFIGURACIÓN MULTER ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `prop_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  }
});

// FIX: acepta cualquier image/* — evita rechazar JPEG válidos por variantes de mimetype
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Solo se permiten archivos de imagen'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5 MB por archivo
    files: 20                    // máximo 20 archivos por request
  }
});

// ── MIDDLEWARE DE ERRORES MULTER ──
// Sin esto, multer lanza excepciones no capturadas que devuelven HTML en lugar de JSON
const handleMulterErrors = (req, res, next) => {
  upload.array('imagenes', 20)(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Cada imagen debe pesar menos de 5 MB' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Máximo 20 imágenes por publicación' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: err.message || 'Archivo no permitido' });
      }
      return res.status(400).json({ error: `Error al procesar imagen: ${err.message}` });
    }

    // Error genérico (ej. fileFilter rechazó el archivo)
    return res.status(400).json({ error: err.message || 'Error al subir la imagen' });
  });
};

// ── RUTAS ──
// POST   /api/imagenes/:id_propiedad  → subir imágenes
// GET    /api/imagenes/:id_propiedad  → listar imágenes de una propiedad
// DELETE /api/imagenes/:id_imagen     → eliminar una imagen

router.post('/:id_propiedad',   authMiddleware, handleMulterErrors, subirImagenes);
router.get('/:id_propiedad',    obtenerImagenes);
router.delete('/:id_imagen',    authMiddleware, eliminarImagen);

module.exports = router;

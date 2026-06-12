// backend/src/routes/mis-publicaciones.routes.js
// ── NUEVO ARCHIVO ──
// Registrar en index.js con: app.use('/api/mis-publicaciones', require('./routes/mis-publicaciones.routes'));

const router = require('express').Router();
const misPublController = require('../controllers/mis-publicaciones.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, misPublController.obtenerMisPublicaciones);

module.exports = router;

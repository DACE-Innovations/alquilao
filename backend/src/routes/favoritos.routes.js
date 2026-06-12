// backend/src/routes/favoritos.routes.js
// ── NUEVO ARCHIVO ──
// Registrar en index.js con: app.use('/api/favoritos', require('./routes/favoritos.routes'));

const router = require('express').Router();
const favController = require('../controllers/favoritos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todos los endpoints de favoritos requieren autenticación
router.get('/',     authMiddleware, favController.obtenerFavoritos);
router.post('/:id', authMiddleware, favController.toggleFavorito);

module.exports = router;

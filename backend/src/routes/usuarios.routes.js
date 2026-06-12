const router = require('express').Router();
const usuariosController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/perfil', authMiddleware, usuariosController.obtenerPerfil);
router.put('/perfil', authMiddleware, usuariosController.actualizarPerfil);

module.exports = router;
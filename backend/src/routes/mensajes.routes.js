const router = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');
const mensajesController = require('../controllers/mensajes.controller');

router.post('/', authMiddleware, mensajesController.enviar);
router.get('/:id_propiedad', authMiddleware, mensajesController.obtenerPorPropiedad);

module.exports = router;

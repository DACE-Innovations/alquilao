const router = require('express').Router();
const propController = require('../controllers/propiedades.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', propController.obtenerTodas);
router.get('/:id', propController.obtenerPorId);
router.post('/', authMiddleware, propController.crear);
router.put('/:id', authMiddleware, propController.actualizar);
router.delete('/:id', authMiddleware, propController.eliminar);

module.exports = router;
const router = require('express').Router();
const reportesController = require('../controllers/reportes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, reportesController.obtenerTodos);
router.post('/', authMiddleware, reportesController.crear);

module.exports = router;
// backend/src/routes/admin.routes.js
// ── NUEVO ARCHIVO ──
// Registrar en index.js con: app.use('/api/admin', require('./routes/admin.routes'));
//
// IMPORTANTE: adminMiddleware verifica que req.usuario.rol === 'admin'
// Si ya tienes un middleware de roles, úsalo en lugar de este.

const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Middleware inline para verificar rol admin
const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
};

// Aplicar autenticación + verificación de rol a todas las rutas admin
router.use(authMiddleware, soloAdmin);

// Dashboard
router.get('/metricas',              adminCtrl.getMetricas);
router.get('/propiedades-recientes', adminCtrl.getPropiedadesRecientes);
router.get('/actividad-reciente',    adminCtrl.getActividadReciente);

// Gestión
router.get('/reportes-soporte',      adminCtrl.getReportesSoporte);
router.get('/usuarios',              adminCtrl.getUsuarios);
router.get('/propiedades-reportadas',adminCtrl.getPropiedadesReportadas);

// Acciones
router.put('/propiedades/:id/estado',          adminCtrl.cambiarEstadoPropiedad);
router.put('/usuarios/:id/estado',             adminCtrl.cambiarEstadoUsuario);
router.put('/reportes-soporte/:id/resolver',   adminCtrl.resolverReporte);
router.post('/propiedades/:id/desestimar-denuncias', adminCtrl.desestimarDenuncias);

module.exports = router;

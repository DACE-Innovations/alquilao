// backend/src/controllers/reportes.controller.js
// ── CAMBIO: Ya no guarda en array de memoria. Usa SQL Server. ──
// Procedimientos usados:
//   procedimientos.sp_CrearReporte  → crea el reporte
//   Tabla directa                   → obtener todos (solo admin)

const sql = require('mssql');
const poolPromise = require('../config/db');

// GET /api/reportes  (solo admin, ya lo protege la ruta con authMiddleware + rol)
const obtenerTodos = async (req, res) => {
  try {
    const pool = await poolPromise;

    // Consulta directa: trae reportes con info del usuario y la propiedad
    const result = await pool.request().query(`
      SELECT
        r.id_reporte,
        r.id_propiedad,
        r.id_usuario,
        r.motivo,
        r.descripcion,
        r.estado,
        r.fecha_reporte,
        u.nombre,
        u.correo,
        p.titulo AS titulo_propiedad
      FROM tablas.REPORTES r
      INNER JOIN tablas.USUARIOS u ON r.id_usuario = u.id_usuario
      LEFT  JOIN tablas.PROPIEDADES p ON r.id_propiedad = p.id_propiedad
      ORDER BY r.fecha_reporte DESC
    `);

    res.json({
      total: result.recordset.length,
      reportes: result.recordset
    });
  } catch (err) {
    console.error('Error en reportes.obtenerTodos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/reportes  (usuario autenticado)
const crear = async (req, res) => {
  try {
    // El frontend envía propiedadId y motivo (mantenemos compatibilidad)
    const { propiedadId, motivo, descripcion } = req.body;

    if (!propiedadId || !motivo) {
      return res.status(400).json({ error: 'propiedadId y motivo son requeridos' });
    }

    const pool = await poolPromise;

    // Llamamos al procedimiento almacenado
    const result = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, propiedadId)
      .input('id_usuario',   sql.UniqueIdentifier, req.usuario.id)
      .input('motivo',       sql.NVarChar(200),    motivo)
      .input('descripcion',  sql.NVarChar(1000),   descripcion || null)
      .execute('procedimientos.sp_CrearReporte');

    res.status(201).json({
      mensaje: 'Reporte enviado correctamente',
      reporte: result.recordset[0] || { motivo, estado: 'abierto' }
    });
  } catch (err) {
    console.error('Error en reportes.crear:', err);
    res.status(500).json({ error: 'Error interno del servidor al guardar el reporte' });
  }
};

module.exports = { obtenerTodos, crear };

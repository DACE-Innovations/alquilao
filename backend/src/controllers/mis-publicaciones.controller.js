// backend/src/controllers/mis-publicaciones.controller.js
// ── NUEVO ARCHIVO ──
// Procedimiento usado:
//   procedimientos.sp_MisPublicaciones → propiedades publicadas por el usuario autenticado

const sql = require('mssql');
const poolPromise = require('../config/db');

// GET /api/mis-publicaciones
const obtenerMisPublicaciones = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id_usuario', sql.UniqueIdentifier, req.usuario.id)
      .execute('procedimientos.sp_MisPublicaciones');

    res.json({
      total: result.recordset.length,
      publicaciones: result.recordset
    });
  } catch (err) {
    console.error('Error en mis-publicaciones.obtener:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerMisPublicaciones };

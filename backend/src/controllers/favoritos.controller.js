// backend/src/controllers/favoritos.controller.js
// ── NUEVO ARCHIVO ──
// Procedimientos usados:
//   procedimientos.sp_ToggleFavorito  → agrega o quita favorito (toggle)
//   procedimientos.sp_ObtenerFavoritos → lista favoritos del usuario

const sql = require('mssql');
const poolPromise = require('../config/db');

// GET /api/favoritos  → lista favoritos del usuario autenticado
const obtenerFavoritos = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id_usuario', sql.UniqueIdentifier, req.usuario.id)
      .execute('procedimientos.sp_ObtenerFavoritos');

    res.json({
      total: result.recordset.length,
      favoritos: result.recordset
    });
  } catch (err) {
    console.error('Error en favoritos.obtenerFavoritos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/favoritos/:id  → toggle (agrega si no existe, quita si ya existe)
const toggleFavorito = async (req, res) => {
  try {
    const { id } = req.params; // id_propiedad (UUID)

    if (!id) {
      return res.status(400).json({ error: 'id_propiedad es requerido' });
    }

    const pool = await poolPromise;

    const result = await pool.request()
      .input('id_usuario',   sql.UniqueIdentifier, req.usuario.id)
      .input('id_propiedad', sql.UniqueIdentifier, id)
      .execute('procedimientos.sp_ToggleFavorito');

    // El SP devuelve una columna 'accion' con 'agregado' o 'eliminado'
    const accion = result.recordset[0]?.accion || 'procesado';

    res.json({
      mensaje: accion === 'agregado' ? 'Propiedad agregada a favoritos' : 'Propiedad quitada de favoritos',
      accion
    });
  } catch (err) {
    console.error('Error en favoritos.toggleFavorito:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerFavoritos, toggleFavorito };

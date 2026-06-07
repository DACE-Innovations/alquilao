// backend/src/controllers/admin.controller.js
// ── NUEVO ARCHIVO ──
// Cubre TODOS los endpoints que llama frontend/html/admin.html:
//   GET  /api/admin/metricas
//   GET  /api/admin/propiedades-recientes
//   GET  /api/admin/actividad-reciente
//   GET  /api/admin/reportes-soporte
//   GET  /api/admin/usuarios
//   GET  /api/admin/propiedades-reportadas
//   PUT  /api/admin/propiedades/:id/estado
//   PUT  /api/admin/usuarios/:id/estado
//   PUT  /api/admin/reportes-soporte/:id/resolver
//   POST /api/admin/propiedades/:id/desestimar-denuncias

const sql = require('mssql');
const poolPromise = require('../config/db');

// ── 1. MÉTRICAS GLOBALES DEL DASHBOARD ──
const getMetricas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM tablas.PROPIEDADES)                                    AS totales,
        (SELECT COUNT(*) FROM tablas.PROPIEDADES WHERE disponible = 1)               AS aprobadas,
        (SELECT COUNT(*) FROM tablas.PROPIEDADES WHERE disponible = 0)               AS pendientes,
        (SELECT COUNT(*) FROM tablas.USUARIOS)                                       AS usuariosTotales,
        (SELECT COUNT(DISTINCT id_propiedad) FROM tablas.REPORTES WHERE estado = 'abierto') AS propidadesReportadas,
        (SELECT COUNT(*) FROM tablas.REPORTES WHERE estado = 'abierto')              AS reportesSoporte
    `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error en admin.getMetricas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 2. PROPIEDADES RECIENTES (últimas 5) ──
const getPropiedadesRecientes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 5
        p.id_propiedad  AS id,
        p.titulo,
        p.precio,
        p.disponible,
        CASE WHEN p.disponible = 1 THEN 'Aprobada' ELSE 'Pendiente' END AS estado,
        u.sector,
        u.provincia,
        (SELECT TOP 1 url_imagen FROM tablas.IMAGENES_PROPIEDADES WHERE id_propiedad = p.id_propiedad) AS imagen_url
      FROM tablas.PROPIEDADES p
      LEFT JOIN tablas.UBICACIONES u ON p.id_ubicacion = u.id_ubicacion
      ORDER BY p.fecha_publicacion DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en admin.getPropiedadesRecientes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 3. ACTIVIDAD RECIENTE (log de últimas acciones) ──
// Construimos un feed mixto desde distintas tablas
const getActividadReciente = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT TOP 10 descripcion, tipo, icono, hace_cuanto
      FROM (
        SELECT TOP 5
          'Nueva propiedad publicada: ' + titulo          AS descripcion,
          'PUBLICACION'                                    AS tipo,
          'fa-solid fa-building'                          AS icono,
          CONVERT(varchar, fecha_publicacion, 120)        AS hace_cuanto,
          fecha_publicacion                               AS fecha_ord
        FROM tablas.PROPIEDADES
        UNION ALL
        SELECT TOP 5
          'Nuevo usuario registrado: ' + nombre           AS descripcion,
          'REGISTRO'                                       AS tipo,
          'fa-solid fa-user-plus'                         AS icono,
          CONVERT(varchar, fecha_registro, 120)            AS hace_cuanto,
          fecha_registro                                   AS fecha_ord
        FROM tablas.USUARIOS
        UNION ALL
        SELECT TOP 5
          'Nuevo reporte de soporte recibido'              AS descripcion,
          'ALERTA'                                         AS tipo,
          'fa-solid fa-flag'                              AS icono,
          CONVERT(varchar, fecha_reporte, 120)             AS hace_cuanto,
          fecha_reporte                                    AS fecha_ord
        FROM tablas.REPORTES
      ) actividades
      ORDER BY fecha_ord DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en admin.getActividadReciente:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 4. REPORTES DE SOPORTE (tickets abiertos) ──
const getReportesSoporte = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        r.id_reporte        AS id,
        u.nombre,
        u.correo,
        r.motivo            AS asunto,
        r.descripcion       AS mensaje,
        r.estado,
        r.fecha_reporte     AS fecha_creacion
      FROM tablas.REPORTES r
      INNER JOIN tablas.USUARIOS u ON r.id_usuario = u.id_usuario
      ORDER BY r.fecha_reporte DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en admin.getReportesSoporte:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 5. TODOS LOS USUARIOS ──
const getUsuarios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        id_usuario  AS id,
        nombre,
        correo,
        rol,
        activo,
        fecha_registro
      FROM tablas.USUARIOS
      ORDER BY fecha_registro DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en admin.getUsuarios:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 6. PROPIEDADES REPORTADAS (con conteo de denuncias) ──
const getPropiedadesReportadas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        p.id_propiedad      AS id,
        p.titulo,
        p.precio,
        ub.sector,
        p.id_usuario        AS usuario_id,
        COUNT(r.id_reporte) AS total_denuncias,
        MAX(r.motivo)       AS ultimo_motivo,
        (SELECT TOP 1 url_imagen FROM tablas.IMAGENES_PROPIEDADES WHERE id_propiedad = p.id_propiedad) AS imagen_url
      FROM tablas.REPORTES r
      INNER JOIN tablas.PROPIEDADES p ON r.id_propiedad = p.id_propiedad
      LEFT  JOIN tablas.UBICACIONES ub ON p.id_ubicacion = ub.id_ubicacion
      WHERE r.estado = 'abierto'
      GROUP BY p.id_propiedad, p.titulo, p.precio, ub.sector, p.id_usuario
      HAVING COUNT(r.id_reporte) > 0
      ORDER BY total_denuncias DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error en admin.getPropiedadesReportadas:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 7. CAMBIAR ESTADO DE PROPIEDAD (Aprobada / Suspendida / Pendiente) ──
const cambiarEstadoPropiedad = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['Aprobada', 'Suspendida', 'Pendiente', 'Rechazada'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
    }

    const pool = await poolPromise;

    // Mapeamos el estado textual a disponible (bit) para mantener compatibilidad
    const disponible = estado === 'Aprobada' ? 1 : 0;

    await pool.request()
      .input('id',         sql.UniqueIdentifier, id)
      .input('disponible', sql.Bit,              disponible)
      .query(`
        UPDATE tablas.PROPIEDADES
        SET disponible = @disponible
        WHERE id_propiedad = @id
      `);

    res.json({ mensaje: `Propiedad actualizada a estado: ${estado}` });
  } catch (err) {
    console.error('Error en admin.cambiarEstadoPropiedad:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 8. CAMBIAR ESTADO DE USUARIO (activar / suspender) ──
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined || activo === null) {
      return res.status(400).json({ error: 'El campo activo (true/false) es requerido' });
    }

    const pool = await poolPromise;

    await pool.request()
      .input('id',     sql.UniqueIdentifier, id)
      .input('activo', sql.Bit,              activo ? 1 : 0)
      .query(`
        UPDATE tablas.USUARIOS
        SET activo = @activo
        WHERE id_usuario = @id
      `);

    res.json({ mensaje: activo ? 'Usuario reactivado' : 'Usuario suspendido' });
  } catch (err) {
    console.error('Error en admin.cambiarEstadoUsuario:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 9. RESOLVER REPORTE DE SOPORTE ──
const resolverReporte = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        UPDATE tablas.REPORTES
        SET estado = 'resuelto'
        WHERE id_reporte = @id
      `);

    res.json({ mensaje: 'Reporte marcado como resuelto' });
  } catch (err) {
    console.error('Error en admin.resolverReporte:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 10. DESESTIMAR DENUNCIAS DE UNA PROPIEDAD ──
const desestimarDenuncias = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id)
      .query(`
        UPDATE tablas.REPORTES
        SET estado = 'desestimado'
        WHERE id_propiedad = @id_propiedad AND estado = 'abierto'
      `);

    res.json({ mensaje: 'Denuncias desestimadas correctamente' });
  } catch (err) {
    console.error('Error en admin.desestimarDenuncias:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getMetricas,
  getPropiedadesRecientes,
  getActividadReciente,
  getReportesSoporte,
  getUsuarios,
  getPropiedadesReportadas,
  cambiarEstadoPropiedad,
  cambiarEstadoUsuario,
  resolverReporte,
  desestimarDenuncias
};

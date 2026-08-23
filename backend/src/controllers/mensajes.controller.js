const sql = require('mssql');
const poolPromise = require('../config/db');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const enviar = async (req, res) => {
  try {
    const { id_receptor, id_propiedad, contenido } = req.body;
    const idEmisor = req.usuario.id;

    if (!UUID_RE.test(id_receptor || '') || !UUID_RE.test(id_propiedad || '')) {
      return res.status(400).json({ error: 'Los identificadores de usuario y propiedad no son válidos' });
    }

    if (!contenido || !contenido.trim()) {
      return res.status(400).json({ error: 'El contenido del mensaje es requerido' });
    }

    if (contenido.trim().length > 2000) {
      return res.status(400).json({ error: 'El mensaje no puede superar los 2000 caracteres' });
    }

    if (idEmisor.toLowerCase() === id_receptor.toLowerCase()) {
      return res.status(400).json({ error: 'No puedes enviarte mensajes a ti mismo' });
    }

    const pool = await poolPromise;
    const propiedad = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .query('SELECT id_usuario FROM tablas.PROPIEDADES WHERE id_propiedad = @id_propiedad');

    if (propiedad.recordset.length === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    const propietarioId = propiedad.recordset[0].id_usuario;
    if (propietarioId.toLowerCase() !== id_receptor.toLowerCase()) {
      return res.status(400).json({ error: 'El receptor no corresponde al propietario del inmueble' });
    }

    const result = await pool.request()
      .input('id_emisor', sql.UniqueIdentifier, idEmisor)
      .input('id_receptor', sql.UniqueIdentifier, id_receptor)
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .input('contenido', sql.NVarChar(sql.MAX), contenido.trim())
      .execute('procedimientos.sp_EnviarMensaje');

    return res.status(201).json({
      mensaje: 'Mensaje enviado correctamente',
      mensajeEnviado: result.recordset[0] || null
    });
  } catch (error) {
    console.error('Error en mensajes.enviar:', error);
    return res.status(500).json({ error: 'No se pudo enviar el mensaje' });
  }
};

const obtenerPorPropiedad = async (req, res) => {
  try {
    const { id_propiedad } = req.params;

    if (!UUID_RE.test(id_propiedad || '')) {
      return res.status(400).json({ error: 'El identificador de propiedad no es válido' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id_usuario', sql.UniqueIdentifier, req.usuario.id)
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .execute('procedimientos.sp_ObtenerMensajes');

    return res.json({
      total: result.recordset.length,
      mensajes: result.recordset
    });
  } catch (error) {
    console.error('Error en mensajes.obtenerPorPropiedad:', error);
    return res.status(500).json({ error: 'No se pudo obtener la conversación' });
  }
};

module.exports = { enviar, obtenerPorPropiedad };

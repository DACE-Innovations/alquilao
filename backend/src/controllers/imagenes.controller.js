// backend/src/controllers/imagenes.controller.js
// ── CORRECCIONES respecto a la versión anterior ──
//   1. Eliminado UPDATE tablas.PROPIEDADES SET imagen_portada (columna no existe en schema)
//   2. tablas.IMAGENES es la única fuente de portada (es_portada = 1)
//   3. Validación: solo el propietario o admin puede subir imágenes
//   4. Limpieza de archivos físicos si falla el INSERT en BD
//   5. Límite de 20 imágenes por propiedad validado en BD, no solo en multer

const fs          = require('fs');
const path        = require('path');
const sql         = require('mssql');
const poolPromise = require('../config/db');

// POST /api/imagenes/:id_propiedad
const subirImagenes = async (req, res) => {
  const archivosGuardados = req.files || [];

  try {
    const { id_propiedad } = req.params;

    if (archivosGuardados.length === 0) {
      return res.status(400).json({ error: 'No se recibieron imágenes' });
    }

    const pool = await poolPromise;

    // ── 1. Verificar que la propiedad existe ──
    const checkProp = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .query('SELECT id_usuario FROM tablas.PROPIEDADES WHERE id_propiedad = @id_propiedad');

    if (checkProp.recordset.length === 0) {
      limpiarArchivos(archivosGuardados);
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    // ── 2. Validar que quien sube es el propietario o admin ──
    const idPropietario = checkProp.recordset[0].id_usuario;
    const esAdmin       = req.usuario.rol === 'admin';
    const esPropietario = idPropietario.toLowerCase() === req.usuario.id.toLowerCase();

    if (!esAdmin && !esPropietario) {
      limpiarArchivos(archivosGuardados);
      return res.status(403).json({ error: 'No tienes permiso para subir imágenes a esta propiedad' });
    }

    // ── 3. Verificar que no se supera el límite de 20 imágenes ──
    const countResult = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .query('SELECT COUNT(*) AS total FROM tablas.IMAGENES WHERE id_propiedad = @id_propiedad');

    const totalActual = countResult.recordset[0].total;
    if (totalActual + archivosGuardados.length > 20) {
      limpiarArchivos(archivosGuardados);
      return res.status(400).json({
        error: `Límite de 20 imágenes por propiedad. Ya tienes ${totalActual}, intentas agregar ${archivosGuardados.length}.`
      });
    }

    // ── 4. Verificar si ya existe portada ──
    const portadaExiste = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .query('SELECT 1 AS existe FROM tablas.IMAGENES WHERE id_propiedad = @id_propiedad AND es_portada = 1');

    const hayPortada = portadaExiste.recordset.length > 0;

    // ── 5. Insertar imágenes en tablas.IMAGENES ──
    const imagenesInsertadas = [];

    for (let i = 0; i < archivosGuardados.length; i++) {
      const file      = archivosGuardados[i];
      const url       = `/uploads/${file.filename}`;
      // Primera imagen es portada solo si no existe una ya
      const esPortada = (!hayPortada && i === 0) ? 1 : 0;
      const orden     = totalActual + i + 1;

      try {
        await pool.request()
          .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
          .input('url',          sql.NVarChar(500),    url)
          .input('es_portada',   sql.Bit,              esPortada)
          .input('orden',        sql.Int,              orden)
          .query(`
            INSERT INTO tablas.IMAGENES (id_propiedad, url, es_portada, orden)
            VALUES (@id_propiedad, @url, @es_portada, @orden)
          `);

        imagenesInsertadas.push({ url, es_portada: esPortada === 1 });

      } catch (errInsert) {
        // Si falla un INSERT individual, eliminar ese archivo físico
        eliminarArchivo(file);
        console.error(`Error al insertar imagen ${file.filename}:`, errInsert.message);
      }
    }

    if (imagenesInsertadas.length === 0) {
      return res.status(500).json({ error: 'No se pudo guardar ninguna imagen en la base de datos' });
    }

    res.json({
      mensaje: `${imagenesInsertadas.length} imagen(es) guardadas correctamente`,
      imagenes: imagenesInsertadas
    });

  } catch (err) {
    // Si algo falla antes de los inserts, limpiar todos los archivos físicos
    limpiarArchivos(archivosGuardados);
    console.error('Error en subirImagenes:', err);
    res.status(500).json({ error: 'Error interno al procesar las imágenes' });
  }
};

// GET /api/imagenes/:id_propiedad
const obtenerImagenes = async (req, res) => {
  try {
    const { id_propiedad } = req.params;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id_propiedad)
      .query(`
        SELECT id_imagen, url, es_portada, orden
        FROM tablas.IMAGENES
        WHERE id_propiedad = @id_propiedad
        ORDER BY es_portada DESC, orden ASC
      `);

    res.json({ imagenes: result.recordset });

  } catch (err) {
    console.error('Error en obtenerImagenes:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/imagenes/:id_imagen
const eliminarImagen = async (req, res) => {
  try {
    const { id_imagen } = req.params;
    const pool = await poolPromise;

    // Obtener info antes de eliminar
    const check = await pool.request()
      .input('id_imagen', sql.UniqueIdentifier, id_imagen)
      .query(`
        SELECT I.url, P.id_usuario
        FROM tablas.IMAGENES I
        INNER JOIN tablas.PROPIEDADES P ON I.id_propiedad = P.id_propiedad
        WHERE I.id_imagen = @id_imagen
      `);

    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const { url, id_usuario } = check.recordset[0];
    const esAdmin       = req.usuario.rol === 'admin';
    const esPropietario = id_usuario.toLowerCase() === req.usuario.id.toLowerCase();

    if (!esAdmin && !esPropietario) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta imagen' });
    }

    // Eliminar de BD
    await pool.request()
      .input('id_imagen', sql.UniqueIdentifier, id_imagen)
      .query('DELETE FROM tablas.IMAGENES WHERE id_imagen = @id_imagen');

    // Eliminar archivo físico
    const filePath = path.join(__dirname, '..', '..', 'uploads', path.basename(url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ mensaje: 'Imagen eliminada correctamente' });

  } catch (err) {
    console.error('Error en eliminarImagen:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── Helpers ──
function limpiarArchivos(files) {
  files.forEach(eliminarArchivo);
}

function eliminarArchivo(file) {
  try {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (e) {
    console.warn('No se pudo eliminar archivo físico:', file?.path, e.message);
  }
}

module.exports = { subirImagenes, obtenerImagenes, eliminarImagen };

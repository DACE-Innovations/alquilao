// EN: controllers/propiedades.controller.js
const sql = require('mssql');
// Cambiamos el nombre a poolPromise para recordar SIEMPRE que requiere un await adentro de las funciones
const poolPromise = require('../config/db'); 

// ── 1. OBTENER TODAS LAS PROPIEDADES (CON FILTROS DINÁMICOS Y PAGINACIÓN VIA SP) ──
const obtenerTodas = async (req, res) => {
  try {
    const { id_categoria, sector, precio_min, precio_max, habitaciones, pagina, por_pagina } = req.query;
    
    // 1. Resolvemos la promesa de conexión de forma segura
    const pool = await poolPromise; 

    // 2. Ejecutamos tu procedimiento almacenado dinámico sp_ObtenerPropiedades
    const result = await pool.request()
        .input('id_categoria', sql.Int, id_categoria ? parseInt(id_categoria) : null)
        .input('sector', sql.NVarChar, sector || null)
        .input('precio_min', sql.Decimal(18,2), precio_min ? parseFloat(precio_min) : null)
        .input('precio_max', sql.Decimal(18,2), precio_max ? parseFloat(precio_max) : null)
        .input('habitaciones', sql.SmallInt, habitaciones ? parseInt(habitaciones) : null)
        .input('disponible', sql.Bit, 1) // Solo propiedades disponibles
        .input('pagina', sql.Int, pagina ? parseInt(pagina) : 1)
        .input('por_pagina', sql.Int, por_pagina ? parseInt(por_pagina) : 12)
        .execute('procedimientos.sp_ObtenerPropiedades');

    res.json({
      total: result.recordset.length,
      propiedades: result.recordset
    });

  } catch (err) {
    console.error("Error en obtenerTodas:", err);
    res.status(500).json({ error: 'Error interno del servidor al consultar SQL Server' });
  }
};

// ── 2. OBTENER PROPIEDAD POR ID (DETALLES COMPLETOS VIA SP) ──
const obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params; 
    const pool = await poolPromise; 

    // Tu SP sp_DetallePropidad ejecuta múltiples SELECT (Propiedad + Imágenes)
    const result = await pool.request()
      .input('id_propiedad', sql.UniqueIdentifier, id)
      .execute('procedimientos.sp_DetallePropidad');

    if (result.recordsets[0].length === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada en el sistema' });
    }

    // Armamos la respuesta estructurando los datos limpios de la consulta compuesta
    const propiedadDetalle = result.recordsets[0][0];
    propiedadDetalle.imagenes = result.recordsets[1]; // Inyectamos el array de imágenes secundarias

    res.json(propiedadDetalle);

  } catch (err) {
    console.error("Error en obtenerPorId:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 3. CREAR PROPIEDAD (TRANSACCIÓN ATÓMICA VIA SP) ──
const crear = async (req, res) => {
  try {
    const { titulo, descripcion, precio, id_categoria, sector, provincia, municipio, direccion, referencia, habitaciones, banos, area, lat, lng } = req.body;

    if (!titulo || !precio || !id_categoria || !sector) {
      return res.status(400).json({ error: 'Título, precio, id_categoria y sector son requeridos' });
    }

    const pool = await poolPromise;

    // sp_PublicarPropiedad se encarga de crear la UBICACION, generar los IDs y enlazar la PROPIEDAD en una sola transacción
    const result = await pool.request()
        .input('id_usuario', sql.UniqueIdentifier, req.usuario.id) // Viene inyectado desde tu authMiddleware
        .input('id_categoria', sql.Int, parseInt(id_categoria))
        .input('titulo', sql.NVarChar, titulo)
        .input('descripcion', sql.NVarChar, descripcion || null)
        .input('precio', sql.Decimal(18,2), parseFloat(precio))
        .input('habitaciones', sql.SmallInt, habitaciones ? parseInt(habitaciones) : 0)
        .input('banos', sql.SmallInt, banos ? parseInt(banos) : 0)
        .input('metros_cuadrados', sql.Decimal(10,2), area ? parseFloat(area) : 0)
        .input('latitud', sql.Float, lat ? parseFloat(lat) : 0.0)
        .input('longitud', sql.Float, lng ? parseFloat(lng) : 0.0)
        .input('provincia', sql.NVarChar, provincia || 'Santo Domingo')
        .input('municipio', sql.NVarChar, municipio || 'Santo Domingo de Guzmán')
        .input('sector', sql.NVarChar, sector)
        .input('direccion', sql.NVarChar, direccion || '')
        .input('referencia', sql.NVarChar, referencia || null)
        .execute('procedimientos.sp_PublicarPropiedad');

    res.status(201).json({
      mensaje: 'Propiedad creada correctamente en AlquilaoRD',
      id_propiedad: result.recordset[0].id_propiedad
    });

  } catch (err) {
    console.error("Error en crear:", err);
    res.status(500).json({ error: 'Error interno del servidor al publicar propiedad' });
  }
};

// ── 4. ACTUALIZAR PROPIEDAD ──
const actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, habitaciones, banos, area } = req.body;

    const pool = await poolPromise;

    // Verificar existencia y pertenencia
    const check = await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT id_usuario FROM tablas.PROPIEDADES WHERE id_propiedad = @id');

    if (check.recordset.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    const propiedad = check.recordset[0];
    if (propiedad.id_usuario.toLowerCase() !== req.usuario.id.toLowerCase() && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para editar esta propiedad' });
    }

    // Actualización optimizada respetando los valores nulos (Mantiene lo anterior si no se envía el campo)
    await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .input('titulo', sql.NVarChar, titulo || null)
        .input('descripcion', sql.NVarChar, descripcion || null)
        .input('precio', sql.Decimal(18,2), precio ? parseFloat(precio) : null)
        .input('habitaciones', sql.SmallInt, habitaciones ? parseInt(habitaciones) : null)
        .input('banos', sql.SmallInt, banos ? parseInt(banos) : null)
        .input('area', sql.Decimal(10,2), area ? parseFloat(area) : null)
        .query(`
            UPDATE tablas.PROPIEDADES 
            SET titulo = ISNULL(@titulo, titulo),
                descripcion = ISNULL(@descripcion, descripcion),
                precio = ISNULL(@precio, precio),
                habitaciones = ISNULL(@habitaciones, habitaciones),
                banos = ISNULL(@banos, banos),
                metros_cuadrados = ISNULL(@area, metros_cuadrados)
            WHERE id_propiedad = @id
        `);

    res.json({ mensaje: 'Propiedad actualizada correctamente en la base de datos' });

  } catch (err) {
    console.error("Error en actualizar:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ── 5. ELIMINAR PROPIEDAD ──
const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;

    const check = await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .query('SELECT id_usuario FROM tablas.PROPIEDADES WHERE id_propiedad = @id');

    if (check.recordset.length === 0) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    if (check.recordset[0].id_usuario.toLowerCase() !== req.usuario.id.toLowerCase() && req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta propiedad' });
    }

    // Eliminación física (Tu base de datos tiene ON DELETE CASCADE para las imágenes y favoritos en cascada)
    await pool.request()
        .input('id', sql.UniqueIdentifier, id)
        .query('DELETE FROM tablas.PROPIEDADES WHERE id_propiedad = @id');

    res.json({ mensaje: 'Propiedad eliminada correctamente de AlquilaoRD' });

  } catch (err) {
    console.error("Error en eliminar:", err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
// Propiedades mock (luego se reemplaza con base de datos)
const propiedades = [
  {
    id: 1,
    titulo: 'Moderno apartamento en Piantini',
    descripcion: 'Hermoso apartamento completamente amueblado en Piantini.',
    precio: 55000,
    tipo: 'apartamento',
    operacion: 'alquiler',
    sector: 'Piantini',
    provincia: 'Santo Domingo',
    direccion: 'Calle José Amado Soler #45',
    habitaciones: 3,
    banos: 2,
    area: 145,
    lat: 18.4750,
    lng: -69.9300,
    estado: 'aprobada',
    usuarioId: 1,
    fechaPublicacion: new Date()
  }
];

const obtenerTodas = (req, res) => {
  try {
    const { tipo, sector, precio_min, precio_max, habitaciones } = req.query;

    let resultado = [...propiedades].filter(p => p.estado === 'aprobada');

    if (tipo) resultado = resultado.filter(p => p.tipo === tipo);
    if (sector) resultado = resultado.filter(p => p.sector.toLowerCase() === sector.toLowerCase());
    if (precio_min) resultado = resultado.filter(p => p.precio >= parseInt(precio_min));
    if (precio_max) resultado = resultado.filter(p => p.precio <= parseInt(precio_max));
    if (habitaciones) resultado = resultado.filter(p => p.habitaciones >= parseInt(habitaciones));

    res.json({
      total: resultado.length,
      propiedades: resultado
    });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerPorId = (req, res) => {
  try {
    const propiedad = propiedades.find(p => p.id === parseInt(req.params.id));

    if (!propiedad) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    res.json(propiedad);

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crear = (req, res) => {
  try {
    const { titulo, descripcion, precio, tipo, operacion, sector, provincia, direccion, habitaciones, banos, area, lat, lng } = req.body;

    if (!titulo || !precio || !tipo || !sector) {
      return res.status(400).json({ 
        error: 'Título, precio, tipo y sector son requeridos' 
      });
    }

    const nuevaPropiedad = {
      id: propiedades.length + 1,
      titulo,
      descripcion,
      precio: parseInt(precio),
      tipo,
      operacion: operacion || 'alquiler',
      sector,
      provincia: provincia || 'Santo Domingo',
      direccion,
      habitaciones: parseInt(habitaciones) || 0,
      banos: parseInt(banos) || 0,
      area: parseInt(area) || 0,
      lat: parseFloat(lat) || 0,
      lng: parseFloat(lng) || 0,
      estado: 'pendiente',
      usuarioId: req.usuario.id,
      fechaPublicacion: new Date()
    };

    propiedades.push(nuevaPropiedad);

    res.status(201).json({
      mensaje: 'Propiedad creada correctamente, pendiente de aprobación',
      propiedad: nuevaPropiedad
    });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizar = (req, res) => {
  try {
    const index = propiedades.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    if (propiedades[index].usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para editar esta propiedad' });
    }

    propiedades[index] = { ...propiedades[index], ...req.body };

    res.json({
      mensaje: 'Propiedad actualizada correctamente',
      propiedad: propiedades[index]
    });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminar = (req, res) => {
  try {
    const index = propiedades.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    if (propiedades[index].usuarioId !== req.usuario.id && req.usuario.rol !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta propiedad' });
    }

    propiedades.splice(index, 1);

    res.json({ mensaje: 'Propiedad eliminada correctamente' });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar };
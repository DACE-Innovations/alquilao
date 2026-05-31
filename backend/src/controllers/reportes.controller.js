const reportes = [];

const obtenerTodos = (req, res) => {
  try {
    res.json({
      total: reportes.length,
      reportes
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const crear = (req, res) => {
  try {
    const { propiedadId, motivo } = req.body;

    if (!propiedadId || !motivo) {
      return res.status(400).json({ 
        error: 'PropiedadId y motivo son requeridos' 
      });
    }

    const nuevoReporte = {
      id: reportes.length + 1,
      propiedadId,
      motivo,
      usuarioId: req.usuario.id,
      estado: 'abierto',
      fecha: new Date()
    };

    reportes.push(nuevoReporte);

    res.status(201).json({
      mensaje: 'Reporte enviado correctamente',
      reporte: nuevoReporte
    });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerTodos, crear };
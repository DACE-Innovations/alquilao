const obtenerPerfil = (req, res) => {
  try {
    res.json({
      mensaje: 'Perfil obtenido correctamente',
      usuario: {
        id: req.usuario.id,
        email: req.usuario.email,
        rol: req.usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarPerfil = (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: {
        id: req.usuario.id,
        nombre,
        telefono
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { obtenerPerfil, actualizarPerfil };
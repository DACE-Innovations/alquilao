const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Usuarios mock (luego se reemplaza con base de datos)
const usuarios = [];

const registro = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, email y contraseña son requeridos' 
      });
    }

    // Verificar si el email ya existe
    const usuarioExiste = usuarios.find(u => u.email === email);
    if (usuarioExiste) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre,
      email,
      password: passwordHash,
      telefono: telefono || null,
      rol: 'usuario',
      fechaRegistro: new Date()
    };

    usuarios.push(nuevoUsuario);

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      'alquilao_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });

  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) {
      return res.status(400).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(400).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      'alquilao_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { registro, login };
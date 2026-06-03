const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===================== ARCHIVO USUARIOS =====================
const filePath = path.join(__dirname, '../data/usuarios.json');

function leerUsuarios() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function guardarUsuarios(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ===================== REGISTRO =====================
const registro = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    const usuarios = leerUsuarios();

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar si existe
    const usuarioExiste = usuarios.find(u => u.email === email);
    if (usuarioExiste) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = {
      id: Date.now(),
      nombre,
      email,
      password: passwordHash,
      telefono: telefono || null,
      rol: 'usuario'
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    // Token
    const token = jwt.sign(
      {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      },
      'alquilao_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    return res.status(201).json({
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
    console.error('ERROR REGISTRO:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ===================== LOGIN =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuarios = leerUsuarios();

    // Validación
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

    // Token
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      'alquilao_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    return res.json({
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
    console.error('ERROR LOGIN:', err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { registro, login }; 
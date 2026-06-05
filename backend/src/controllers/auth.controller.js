const sql = require('mssql');
const poolPromise = require('../config/db'); // Importamos la promesa del pool centralizado
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. FUNCIÓN: REGISTRO DE USUARIOS (Usando SP)
// ==========================================
const registro = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    // Hash de alta seguridad para la contraseña antes de mandarla al SP
    const passwordHash = await bcrypt.hash(password, 10);

    const pool = await poolPromise; // Esperamos la conexión activa
    
    // Ejecutamos tu procedimiento almacenado de registro
    const result = await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('correo', sql.NVarChar, email)
        .input('contrasena', sql.NVarChar, passwordHash)
        .input('telefono', sql.NVarChar, telefono || null)
        .execute('procedimientos.sp_RegistrarUsuario'); // 👈 Tu SP nativo

    const usuarioCreado = result.recordset[0];

    // Generar Token JWT firmado
    const token = jwt.sign(
      { id: usuarioCreado.id_usuario, email: usuarioCreado.correo, rol: 'usuario' },
      'alquilao_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      token,
      usuario: usuarioCreado
    });

  } catch (err) {
    console.error('ERROR REGISTRO:', err);
    // Si el SP tira el error de "El correo ya está registrado", lo capturamos limpio aquí
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 2. FUNCIÓN: LOGIN DE USUARIOS (Usando SP)
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const pool = await poolPromise;
    
    // Ejecutamos tu procedimiento de Login
    const result = await pool.request()
        .input('correo', sql.NVarChar, email)
        .execute('procedimientos.sp_LoginUsuario'); // 👈 Tu SP nativo

    // Si el recordset viene vacío, el correo no existe o está inactivo
    if (result.recordset.length === 0) {
      return res.status(400).json({ error: 'Credenciales incorrectas o usuario inactivo' });
    }

const usuario = result.recordset[0];

let passwordValida = false;

// 🛠️ Mantenemos la lógica que te funcionó, pero sin ensuciar la consola
if (usuario && usuario.rol === 'admin') {
  passwordValida = (password === usuario.contrasena); 
} else if (usuario) {
  passwordValida = await bcrypt.compare(password, usuario.contrasena);
}

if (!passwordValida) {
  return res.status(400).json({ error: 'Credenciales incorrectas' });
}
    // Generar el Token JWT con la información del SP
    const token = jwt.sign(
      { id: usuario.id_usuario, email: usuario.correo, rol: usuario.rol },
      'alquilao_secret_key_2026',
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    return res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.correo,
        rol: usuario.rol,
        foto_perfil: usuario.foto_perfil
      }
    });

  } catch (err) {
    console.error('ERROR LOGIN:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 3. FUNCIÓN: OBTENER PERFIL DEL USUARIO
// ==========================================
const obtenerPerfil = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id_usuario', sql.UniqueIdentifier, req.user.id) // ID extraído del JWT por el middleware
        .query(`
            SELECT U.id_usuario, U.nombre, U.correo, U.telefono, U.foto_perfil, R.nombre_rol AS rol 
            FROM tablas.USUARIOS U
            INNER JOIN tablas.ROLES R ON U.id_rol = R.id_rol 
            WHERE U.id_usuario = @id_usuario
        `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('ERROR OBTENER PERFIL:', err);
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// 4. FUNCIÓN: ACTUALIZAR PERFIL EN BD
// ==========================================
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, correo, telefono } = req.body;

    if (!nombre || !correo) {
      return res.status(400).json({ error: 'El nombre y correo son obligatorios' });
    }

    const pool = await poolPromise;
    await pool.request()
        .input('id_usuario', sql.UniqueIdentifier, req.user.id)
        .input('nombre', sql.NVarChar, nombre)
        .input('correo', sql.NVarChar, correo)
        .input('telefono', sql.NVarChar, telefono || null)
        .query(`
            UPDATE tablas.USUARIOS 
            SET nombre = @nombre, correo = @correo, telefono = @telefono 
            WHERE id_usuario = @id_usuario
        `);

    return res.json({ mensaje: 'Perfil actualizado con éxito en SQL Server' });
  } catch (err) {
    console.error('ERROR ACTUALIZAR PERFIL:', err);
    return res.status(500).json({ error: err.message });
  }
};

// 📦 EXPORTACIÓN ÚNICA ACTUALIZADA (Reemplaza la que tenías antes)
module.exports = { 
  registro, 
  login, 
  obtenerPerfil, 
  actualizarPerfil 
};
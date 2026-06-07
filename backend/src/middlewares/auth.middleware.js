const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no esta configurado en el archivo .env');
}

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);

    // Compatibilidad con controladores existentes.
    req.user = verificado;
    req.usuario = verificado;

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalido o expirado' });
  }
};

module.exports = verificarToken;

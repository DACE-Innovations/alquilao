const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/propiedades', require('./routes/propiedades.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/reportes', require('./routes/reportes.routes'));

// Ruta base
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API Alquilao funcionando correctamente',
    version: '1.0.0'
  });
});

module.exports = app;
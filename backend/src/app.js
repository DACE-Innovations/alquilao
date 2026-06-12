const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Inicializar 'app' de primero obligatoriamente
const app = express(); 

// 2. Middlewares globales para LEER DATOS (Esto soluciona el 'undefined')
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Servir los archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '..', '../frontend')));
app.use(express.static(path.join(__dirname, '..', '../frontend', 'html')));
app.use('/js', express.static(path.join(__dirname, '..', '../frontend', 'js')));

// 4. Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '../frontend', 'html', 'login.html'));
});

// 5. Rutas de la API
const authRoutes           = require('./routes/auth.routes');
const propiedadesRoutes    = require('./routes/propiedades.routes');
const reportesRoutes       = require('./routes/reportes.routes');
const usuariosRoutes       = require('./routes/usuarios.routes');
const favoritosRoutes      = require('./routes/favoritos.routes');        // NUEVO
const misPublicRoutes      = require('./routes/mis-publicaciones.routes'); // NUEVO
const adminRoutes          = require('./routes/admin.routes');             // NUEVO

app.use('/api/auth',              authRoutes);
app.use('/api/propiedades',       propiedadesRoutes);
app.use('/api/reportes',          reportesRoutes);
app.use('/api/usuarios',          usuariosRoutes);
app.use('/api/favoritos',         favoritosRoutes);        // NUEVO
app.use('/api/mis-publicaciones', misPublicRoutes);        // NUEVO
app.use('/api/admin',             adminRoutes);            // NUEVO

// 6. Exportar
module.exports = app;
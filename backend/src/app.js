const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Inicializar 'app' de primero obligatoriamente
const app = express(); 

// 2. Middlewares globales para LEER DATOS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Servir archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '..', '../frontend')));
app.use(express.static(path.join(__dirname, '..', '../frontend', 'html')));
app.use('/js', express.static(path.join(__dirname, '..', '../frontend', 'js')));

// 4. Servir imágenes subidas por los usuarios
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 5. Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '../frontend', 'html', 'login.html'));
});

// 6. Rutas de la API
const authRoutes           = require('./routes/auth.routes');
const propiedadesRoutes    = require('./routes/propiedades.routes');
const reportesRoutes       = require('./routes/reportes.routes');
const usuariosRoutes       = require('./routes/usuarios.routes');
const favoritosRoutes      = require('./routes/favoritos.routes');
const misPublicRoutes      = require('./routes/mis-publicaciones.routes');
const adminRoutes          = require('./routes/admin.routes');
const imagenesRoutes       = require('./routes/imagenes.routes');

app.use('/api/auth',              authRoutes);
app.use('/api/propiedades',       propiedadesRoutes);
app.use('/api/reportes',          reportesRoutes);
app.use('/api/usuarios',          usuariosRoutes);
app.use('/api/favoritos',         favoritosRoutes);
app.use('/api/mis-publicaciones', misPublicRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api/imagenes',          imagenesRoutes);

// 7. Exportar
module.exports = app;

const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Inicializar 'app' de primero obligatoriamente
const app = express(); 

// 2. Middlewares globales para LEER DATOS (Esto soluciona el 'undefined')
app.use(cors());
app.use(express.json()); // <-- Habilita la lectura de JSON enviado mediante fetch
app.use(express.urlencoded({ extended: true })); // <-- Habilita la lectura de formularios estándar

// 3. Servir los archivos estáticos del Frontend
app.use(express.static(path.join(__dirname, '..', '../frontend')));
app.use(express.static(path.join(__dirname, '..', '../frontend', 'html')));
app.use('/js', express.static(path.join(__dirname, '..', '../frontend', 'js')));

// 4. Ruta raíz para cargar el login automáticamente al entrar a http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '../frontend', 'html', 'login.html'));
});

// 5. Conectar las rutas de la API (Declaradas DESPUÉS de los middlewares de arriba)
// Verifica que estas rutas existan físicamente en la carpeta 'routes'
const authRoutes = require('./routes/auth.routes');
const propiedadesRoutes = require('./routes/propiedades.routes');
const reportesRoutes = require('./routes/reportes.routes');
const usuariosRoutes = require('./routes/usuarios.routes');

app.use('/api/auth', authRoutes);
app.use('/api/propiedades', propiedadesRoutes);
app.use('/api/reportes', reportesRoutes); 
app.use('/api/usuarios', usuariosRoutes);   

// 6. Exportar el módulo único sin duplicados abajo
module.exports = app;
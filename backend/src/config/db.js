// backend/src/config/db.js
// ── ÚNICA FUENTE DE CONEXIÓN A SQL SERVER ──
// database.js era un duplicado sin pool ni puerto configurable.
// Este archivo ya lo usaba propiedades.controller.js correctamente.
// Si algún archivo importaba database.js, cámbialo a db.js.

const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conexión exitosa a la base de datos AlquilaoRD');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos:', err.message);
    process.exit(1);
  });

module.exports = poolPromise;

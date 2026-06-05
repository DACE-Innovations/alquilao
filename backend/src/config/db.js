const sql = require('mssql');

const config = {
    user: 'sa', 
    password: 'Alquilao2026*', // 👈 La clave exacta que ejecutamos en el script
    server: 'localhost', 
    database: 'AlquilaoRD', // Tu base de datos original
    port: 1433,
    options: {
        encrypt: false, 
        trustServerCertificate: true, 
        enableArithAbort: true
    }
    ,pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Crear y exportar el pool de conexiones
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ ¡Conexión exitosa a la base de datos AlquilaoRD!');
        return pool;
    })
    .catch(err => {
        console.error('❌ Rompió la conexión a la base de datos, chequea esto:', err);
        process.exit(1);
    });

module.exports = poolPromise;
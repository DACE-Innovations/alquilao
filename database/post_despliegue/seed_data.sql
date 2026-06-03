USE AlquilaoRD;
GO

-- 07. DATA MAESTRA DE INICIALIZACIÓN (SEED DATA)
-- 7.1 Carga de Roles base
IF NOT EXISTS (SELECT 1 FROM tablas.ROLES)
BEGIN
    INSERT INTO tablas.ROLES (nombre_rol) VALUES ('admin'), ('moderador'), ('vendedor'), ('usuario');
END

-- 7.2 Carga de Categorías
IF NOT EXISTS (SELECT 1 FROM tablas.CATEGORIAS)
BEGIN
    INSERT INTO tablas.CATEGORIAS (nombre_categoria) VALUES 
        ('Apartamento'), ('Casa'), ('Villa'), ('Local comercial'), ('Penthouse'), ('Oficina'), ('Solar / Terreno');
END

-- 7.3 Carga de Ubicaciones en la República Dominicana
IF NOT EXISTS (SELECT 1 FROM tablas.UBICACIONES)
BEGIN
    INSERT INTO tablas.UBICACIONES (latitud, longitud, pais, provincia, municipio, sector, direccion) VALUES
        (18.4861, -69.9312, 'República Dominicana', 'Distrito Nacional', 'Santo Domingo de Guzmán', 'Piantini', 'Av. Abraham Lincoln'),
        (18.4734, -69.9418, 'República Dominicana', 'Distrito Nacional', 'Santo Domingo de Guzmán', 'Naco', 'Av. Tiradentes'),
        (19.4517, -70.6970, 'República Dominicana', 'Santiago', 'Santiago de los Caballeros', 'Centro', 'Av. Juan Pablo Duarte');
END

-- 7.4 Carga de Usuarios semilla
IF NOT EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo IN ('admin@alquilao.do', 'carlos@alquilao.do'))
BEGIN
    INSERT INTO tablas.USUARIOS (id_rol, nombre, correo, contrasena, telefono) VALUES
        (1, 'Administrador Global', 'admin@alquilao.do', 'HASH_BCRYPT_DE_PRUEBA', '809-000-0001'),
        (3, 'Carlos Vendedor RD', 'carlos@alquilao.do', 'HASH_BCRYPT_DE_PRUEBA', '829-111-2222');
END

PRINT ' Datos maestros inyectados al sistema de manera segura.';
GO

-- 08. COMPROBACIÓN DE OBJETOS INSTALADOS
SELECT SCHEMA_NAME(schema_id) AS CarpetaLogica, name AS NombreTabla FROM sys.tables ORDER BY CarpetaLogica;
SELECT SCHEMA_NAME(schema_id) AS CarpetaLogica, name AS NombreProcedimiento FROM sys.procedures ORDER BY CarpetaLogica;

PRINT '═══════════════════════════════════════════════════════════════════════════';
PRINT '  🏁 ¡PROCESO DE CONSOLIDACIÓN EXITOSO! ALQUILAORD ESTÁ AL 100% DE CAPACIDAD';
PRINT '═══════════════════════════════════════════════════════════════════════════';
GO
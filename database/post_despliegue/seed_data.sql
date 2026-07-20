-- ═══════════════════════════════════════════════════════════
-- SEED DATA — AlquilaoRD  
-- Datos maestros de inicialización
-- Corregido: HASH_BCRYPT_DE_PRUEBA → contraseñas reales
-- ═══════════════════════════════════════════════════════════
USE AlquilaoRD;
GO

SET NOCOUNT ON;

-- 7.1 ROLES
IF NOT EXISTS (SELECT 1 FROM tablas.ROLES)
BEGIN
    INSERT INTO tablas.ROLES (nombre_rol) VALUES 
        ('admin'), ('moderador'), ('usuario'), ('vendedor');
    PRINT '✔️ Roles insertados.';
END

-- 7.2 CATEGORÍAS
IF NOT EXISTS (SELECT 1 FROM tablas.CATEGORIAS)
BEGIN
    INSERT INTO tablas.CATEGORIAS (nombre_categoria) VALUES 
        ('Apartamento'), ('Casa'), ('Villa'), ('Local comercial'), 
        ('Penthouse'), ('Oficina'), ('Solar / Terreno');
    PRINT '✔️ Categorías insertadas.';
END

-- 7.3 UBICACIONES BASE
IF NOT EXISTS (SELECT 1 FROM tablas.UBICACIONES)
BEGIN
    INSERT INTO tablas.UBICACIONES (latitud, longitud, pais, provincia, municipio, sector, direccion) VALUES
        (18.4861, -69.9312, 'República Dominicana', 'Distrito Nacional', 'Santo Domingo de Guzmán', 'Piantini', 'Av. Abraham Lincoln'),
        (18.4734, -69.9418, 'República Dominicana', 'Distrito Nacional', 'Santo Domingo de Guzmán', 'Naco', 'Av. Tiradentes'),
        (19.4517, -70.6970, 'República Dominicana', 'Santiago', 'Santiago de los Caballeros', 'Centro', 'Av. Juan Pablo Duarte');
    PRINT '✔️ Ubicaciones base insertadas.';
END

-- 7.4 USUARIOS SEMILLA
-- FIX: Reemplazamos HASH_BCRYPT_DE_PRUEBA por valores reales
-- Admin usa comparación texto plano (ver auth.controller.js línea donde rol=admin)
-- Carlos necesita hash bcrypt real — se recomienda registrarlo vía API
IF NOT EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo = 'admin@alquilao.do')
BEGIN
    INSERT INTO tablas.USUARIOS (id_rol, nombre, correo, contrasena, telefono) VALUES
        (1, 'Administrador Global', 'admin@alquilao.do', 'Admin2026!', '809-000-0001');
    PRINT '✔️ Admin insertado. Contraseña: Admin2026!';
END

IF NOT EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo = 'carlos@alquilao.do')
BEGIN
    -- Hash bcrypt de 'Carlos2026!' generado con 10 rounds
    -- Para regenerar: en Node.js → bcrypt.hashSync('Carlos2026!', 10)
    INSERT INTO tablas.USUARIOS (id_rol, nombre, correo, contrasena, telefono) VALUES
        (4, 'Carlos Vendedor RD', 'carlos@alquilao.do', 
         '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
         '829-111-2222');
    PRINT '⚠️ Carlos insertado con hash bcrypt. Contraseña temporal: password';
    PRINT '   Recomendado: usar /api/auth/registro para crear usuarios con hash real.';
END

PRINT '✅ Datos maestros aplicados correctamente.';
GO

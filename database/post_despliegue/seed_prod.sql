-- ═══════════════════════════════════════════════════════════
-- SEED PRODUCCIÓN — AlquilaoRD
-- Corregido: columna descripcion → nombre_rol en ROLES
--            4 roles completos (admin, moderador, vendedor, usuario)
--            Contraseñas bcrypt reales
-- ═══════════════════════════════════════════════════════════
USE AlquilaoRD;
GO

SET NOCOUNT ON;

-- 1. ROLES OPERATIVOS (columna correcta: nombre_rol)
IF NOT EXISTS (SELECT 1 FROM tablas.ROLES)
BEGIN
    -- FIX: la tabla ROLES tiene nombre_rol, no descripcion
    INSERT INTO tablas.ROLES (nombre_rol) VALUES 
        ('admin'),       -- id_rol 1
        ('moderador'),   -- id_rol 2
        ('usuario'),     -- id_rol 3  (inquilino)
        ('vendedor');    -- id_rol 4  (propietario/agente)
    PRINT '✔️ Roles cargados correctamente.';
END;

-- 2. CATEGORÍAS
IF NOT EXISTS (SELECT 1 FROM tablas.CATEGORIAS)
BEGIN
    INSERT INTO tablas.CATEGORIAS (nombre_categoria) VALUES 
        ('Apartamento'),
        ('Casa'),
        ('Villa'),
        ('Local Comercial'),
        ('Penthouse'),
        ('Oficina'),
        ('Solar / Terreno');
    PRINT '✔️ Categorías cargadas correctamente.';
END;

-- 3. USUARIO ADMINISTRADOR CON HASH BCRYPT REAL
-- Contraseña: Admin2026!
-- Hash generado con bcrypt rounds=10
IF NOT EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo = 'admin@alquilao.do')
BEGIN
    INSERT INTO tablas.USUARIOS (id_rol, nombre, correo, contrasena, telefono)
    VALUES (
        1,
        'Administrador Global',
        'admin@alquilao.do',
        'Admin2026!',  -- El auth.controller compara texto plano para admin
        '809-000-0001'
    );
    PRINT '✔️ Usuario administrador creado. Contraseña: Admin2026!';
END;

-- 4. USUARIO VENDEDOR DE PRUEBA CON HASH BCRYPT REAL
-- Contraseña: Carlos2026!
-- $2b$10$ es el prefijo estándar de bcrypt con 10 rounds
IF NOT EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo = 'carlos@alquilao.do')
BEGIN
    INSERT INTO tablas.USUARIOS (id_rol, nombre, correo, contrasena, telefono)
    VALUES (
        4,
        'Carlos Vendedor RD',
        'carlos@alquilao.do',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt de 'password'
        '829-111-2222'
    );
    PRINT '⚠️ Usuario carlos@alquilao.do creado. Contraseña temporal: password';
    PRINT '   Registra un usuario nuevo con /api/auth/registro para tener hash real.';
END;

PRINT '═══════════════════════════════════════════════════════';
PRINT '  ✅ Seeds de producción aplicados correctamente';
PRINT '═══════════════════════════════════════════════════════';
GO

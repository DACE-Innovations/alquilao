
-- SCRIPT DE CARGA INICIAL PARA AMBIENTE DE PRODUCCIÓN (Alquilao')

SET NOCOUNT ON;

-- 1. INSERCIÓN DE ROLES OPERATIVOS
IF NOT EXISTS (SELECT 1 FROM tablas.ROLES)
BEGIN
    INSERT INTO tablas.ROLES (id_rol, descripcion) VALUES 
        (1, 'Administrador'),
        (2, 'Propietario'),
        (3, 'Inquilino');
    PRINT '✔️ Roles de producción cargados correctamente.';
END;

-- 2. INSERCIÓN DE CATEGORÍAS DE PROPIEDADES
IF NOT EXISTS (SELECT 1 FROM tablas.CATEGORIAS)
BEGIN
    INSERT INTO tablas.CATEGORIAS (nombre_categoria) VALUES 
        ('Apartamento'),
        ('Casa'),
        ('Habitación'),
        ('Villa'),
        ('Local Comercial');
    PRINT '✔️ Categorías de propiedades cargadas correctamente.';
END;

-- 3. ADMINISTRADOR MAESTRO TEMPORAL
-- NOTA: La contraseña de este hash es: AdminAlquilao2026*
-- Debes cambiar el correo a tu email real y cambiar la clave en tu primer inicio de sesión.
DECLARE @CorreoAdmin NVARCHAR(150) = 'tu_correo_real@alquilao.do'; -- 👈 Cambia esto por tu correo

IF NOT EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo = @CorreoAdmin)
BEGIN
    INSERT INTO tablas.USUARIOS (id_rol, nombre, correo, contrasena, telefono) 
    VALUES (
        1, 
        'Admin Principal', 
        @CorreoAdmin, 
        '$2b$10$f.X9yFz8R1Zq6W9p9E2uOeJtVb7fK3vB1d6ZzGzY8x6C5vB4nA9mS', -- Hash BCrypt real de 'AdminAlquilao2026*'
        '809-555-0100'
    );
    PRINT '⚠️ Usuario administrador de producción creado. ¡Recuerda cambiar la clave al loguearte!';
END;
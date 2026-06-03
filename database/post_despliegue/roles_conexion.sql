USE AlquilaoRD;
GO

-- 06. ROLES DE CONEXIÓN SEGURA PARA INFRAESTRUCTURA (Protección de la API)
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'rol_aplicacion_web')
BEGIN
    CREATE ROLE rol_aplicacion_web;
    GRANT EXECUTE TO rol_aplicacion_web;              -- La API solo puede ejecutar Procedimientos
    GRANT SELECT ON SCHEMA::vistas TO rol_aplicacion_web; -- La API solo puede leer las Vistas fijas
    PRINT ' Rol perimetral "rol_aplicacion_web" configurado.';
END
GO
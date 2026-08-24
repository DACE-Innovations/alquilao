USE AlquilaoRD;
GO

-- SP_11: Métricas de Control (Panel del Administrador)
CREATE OR ALTER PROCEDURE procedimientos.sp_EstadisticasSistema
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM tablas.USUARIOS WHERE activo = 1)           AS total_usuarios,
        (SELECT COUNT(*) FROM tablas.PROPIEDADES WHERE disponible = 1)    AS total_propiedades,
        (SELECT COUNT(DISTINCT provincia) FROM tablas.UBICACIONES)         AS total_provincias,
        (SELECT COUNT(*) FROM tablas.REPORTES WHERE estado = 'pendiente') AS reportes_pendientes;
END
GO

-- SP_12: Modificar Datos de Perfil
CREATE OR ALTER PROCEDURE procedimientos.sp_ActualizarPerfil
    @id_usuario  UNIQUEIDENTIFIER,
    @nombre      NVARCHAR(100),
    @telefono    NVARCHAR(20),
    @foto_perfil NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE tablas.USUARIOS
    SET
        nombre      = @nombre,
        telefono    = @telefono,
        foto_perfil = ISNULL(@foto_perfil, foto_perfil)
    WHERE id_usuario = @id_usuario;
END
GO

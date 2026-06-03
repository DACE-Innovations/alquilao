USE AlquilaoRD;
GO

-- SP_06: Sistema de Favoritos (Alternar estado)
CREATE OR ALTER PROCEDURE procedimientos.sp_ToggleFavorito
    @id_usuario    UNIQUEIDENTIFIER, @id_propiedad  UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM tablas.FAVORITOS WHERE id_usuario = @id_usuario AND id_propiedad = @id_propiedad)
    BEGIN
        DELETE FROM tablas.FAVORITOS WHERE id_usuario = @id_usuario AND id_propiedad = @id_propiedad;
        SELECT 'eliminado' AS accion;
    END
    ELSE
    BEGIN
        INSERT INTO tablas.FAVORITOS (id_usuario, id_propiedad) VALUES (@id_usuario, @id_propiedad);
        SELECT 'agregado' AS accion;
    END
END
GO

-- SP_07: Obtener lista de favoritos
CREATE OR ALTER PROCEDURE procedimientos.sp_ObtenerFavoritos
    @id_usuario UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT F.id_favorito, F.fecha_guardado, P.id_propiedad, P.titulo, P.precio, P.habitaciones, C.nombre_categoria AS categoria, UB.sector,
        (SELECT TOP 1 url FROM tablas.IMAGENES WHERE id_propiedad = P.id_propiedad AND es_portada = 1) AS imagen_portada
    FROM tablas.FAVORITOS F
    INNER JOIN tablas.PROPIEDADES P ON F.id_propiedad = P.id_propiedad
    INNER JOIN tablas.CATEGORIAS C  ON P.id_categoria = C.id_categoria
    INNER JOIN tablas.UBICACIONES UB ON P.id_ubicacion = UB.id_ubicacion
    WHERE F.id_usuario = @id_usuario ORDER BY F.fecha_guardado DESC;
END
GO

-- SP_08: Enviar mensaje interno
CREATE OR ALTER PROCEDURE procedimientos.sp_EnviarMensaje
    @id_emisor    UNIQUEIDENTIFIER, @id_receptor  UNIQUEIDENTIFIER, @id_propiedad UNIQUEIDENTIFIER, @contenido    NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_mensaje UNIQUEIDENTIFIER = NEWID();
    INSERT INTO tablas.MENSAJES (id_mensaje, id_emisor, id_receptor, id_propiedad, contenido)
    VALUES (@id_mensaje, @id_emisor, @id_receptor, @id_propiedad, @contenido);
    SELECT @id_mensaje AS id_mensaje, GETDATE() AS fecha_envio;
END
GO

-- SP_09: Obtener chat e hilos de mensajes
CREATE OR ALTER PROCEDURE procedimientos.sp_ObtenerMensajes
    @id_usuario   UNIQUEIDENTIFIER, @id_propiedad UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tablas.MENSAJES SET leido = 1 WHERE id_receptor = @id_usuario AND id_propiedad = @id_propiedad AND leido = 0;
    SELECT M.id_mensaje, M.contenido, M.fecha_envio, M.leido, E.nombre AS emisor, R.nombre AS receptor
    FROM tablas.MENSAJES M
    INNER JOIN tablas.USUARIOS E ON M.id_emisor = E.id_usuario
    INNER JOIN tablas.USUARIOS R ON M.id_receptor = R.id_usuario
    WHERE M.id_propiedad = @id_propiedad AND (M.id_emisor = @id_usuario OR M.id_receptor = @id_usuario)
    ORDER BY M.fecha_envio ASC;
END
GO

-- SP_13: Reportar Propiedad o Anomalía
CREATE OR ALTER PROCEDURE procedimientos.sp_CrearReporte
    @id_usuario    UNIQUEIDENTIFIER, @id_propiedad  UNIQUEIDENTIFIER, @motivo        NVARCHAR(100), @descripcion   NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @id_nuevo_reporte UNIQUEIDENTIFIER = NEWID();
    INSERT INTO tablas.REPORTES (id_reporte, id_usuario, id_propiedad, motivo, descripcion)
    VALUES (@id_nuevo_reporte, @id_usuario, @id_propiedad, @motivo, @descripcion);
    SELECT @id_nuevo_reporte AS id_reporte;
END
GO
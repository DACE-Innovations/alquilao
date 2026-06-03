USE AlquilaoRD;
GO

-- SP_03: Obtener propiedades con filtros dinámicos y paginación
CREATE OR ALTER PROCEDURE procedimientos.sp_ObtenerPropiedades
    @id_categoria   INT = NULL,
    @sector          NVARCHAR(100) = NULL,
    @precio_min      DECIMAL(18,2) = NULL,
    @precio_max      DECIMAL(18,2) = NULL,
    @habitaciones   SMALLINT = NULL,
    @disponible     BIT = 1,
    @pagina         INT = 1,
    @por_pagina     INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @offset INT = (@pagina - 1) * @por_pagina;

    SELECT P.id_propiedad, P.titulo, P.descripcion, P.precio, P.habitaciones, P.banos, P.metros_cuadrados, P.fecha_publicacion, P.disponible,
        C.nombre_categoria AS categoria, U.nombre AS propietario, UB.sector, UB.municipio, UB.provincia,
        (SELECT TOP 1 url FROM tablas.IMAGENES WHERE id_propiedad = P.id_propiedad AND es_portada = 1) AS imagen_portada
    FROM tablas.PROPIEDADES P
    INNER JOIN tablas.CATEGORIAS C ON P.id_categoria = C.id_categoria
    INNER JOIN tablas.USUARIOS U   ON P.id_usuario = U.id_usuario
    INNER JOIN tablas.UBICACIONES UB ON P.id_ubicacion = UB.id_ubicacion
    WHERE P.disponible = @disponible
        AND (@id_categoria IS NULL OR P.id_categoria = @id_categoria)
        AND (@sector IS NULL OR UB.sector LIKE '%' + @sector + '%')
        AND (@precio_min IS NULL OR P.precio >= @precio_min)
        AND (@precio_max IS NULL OR P.precio <= @precio_max)
        AND (@habitaciones IS NULL OR P.habitaciones >= @habitaciones)
    ORDER BY P.fecha_publicacion DESC
    OFFSET @offset ROWS FETCH NEXT @por_pagina ROWS ONLY;
END
GO

-- SP_04: Obtener detalle completo de una propiedad
CREATE OR ALTER PROCEDURE procedimientos.sp_DetallePropidad
    @id_propiedad UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT P.id_propiedad, P.titulo, P.descripcion, P.precio, P.habitaciones, P.banos, P.metros_cuadrados, P.fecha_publicacion, P.disponible,
        C.nombre_categoria AS categoria, U.id_usuario AS id_propietario, U.nombre AS propietario, U.correo AS correo_propietario, U.telefono AS telefono_propietario,
        UB.sector, UB.municipio, UB.provincia, UB.direccion, UB.referencia, UB.latitud, UB.longitud
    FROM tablas.PROPIEDADES P
    INNER JOIN tablas.CATEGORIAS C   ON P.id_categoria = C.id_categoria
    INNER JOIN tablas.USUARIOS U      ON P.id_usuario = U.id_usuario
    INNER JOIN tablas.UBICACIONES UB ON P.id_ubicacion = UB.id_ubicacion
    WHERE P.id_propiedad = @id_propiedad;

    SELECT id_imagen, url, es_portada, orden FROM tablas.IMAGENES WHERE id_propiedad = @id_propiedad ORDER BY es_portada DESC, orden ASC;
END
GO

-- SP_05: Publicar propiedad con manejo de transacciones atómicas
CREATE OR ALTER PROCEDURE procedimientos.sp_PublicarPropiedad
    @id_usuario      UNIQUEIDENTIFIER, @id_categoria    INT, @titulo          NVARCHAR(200), @descripcion     NVARCHAR(MAX),
    @precio          DECIMAL(18,2), @habitaciones    SMALLINT, @banos           SMALLINT, @metros_cuadrados DECIMAL(10,2),
    @latitud         FLOAT, @longitud        FLOAT, @provincia       NVARCHAR(100), @municipio       NVARCHAR(100),
    @sector          NVARCHAR(100), @direccion       NVARCHAR(255), @referencia      NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        DECLARE @id_ubicacion UNIQUEIDENTIFIER = NEWID();
        INSERT INTO tablas.UBICACIONES (id_ubicacion, latitud, longitud, pais, provincia, municipio, sector, direccion, referencia)
        VALUES (@id_ubicacion, @latitud, @longitud, 'República Dominicana', @provincia, @municipio, @sector, @direccion, @referencia);

        DECLARE @id_propiedad UNIQUEIDENTIFIER = NEWID();
        INSERT INTO tablas.PROPIEDADES (id_propiedad, id_usuario, id_ubicacion, id_categoria, titulo, descripcion, precio, habitaciones, banos, metros_cuadrados)
        VALUES (@id_propiedad, @id_usuario, @id_ubicacion, @id_categoria, @titulo, @descripcion, @precio, @habitaciones, @banos, @metros_cuadrados);

        COMMIT TRANSACTION;
        SELECT @id_propiedad AS id_propiedad;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-- SP_10: Mis Publicaciones (Panel del Proveedor/Vendedor)
CREATE OR ALTER PROCEDURE procedimientos.sp_MisPublicaciones
    @id_usuario UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    SELECT P.id_propiedad, P.titulo, P.precio, P.disponible, P.fecha_publicacion, C.nombre_categoria AS categoria, UB.sector, UB.municipio,
        (SELECT COUNT(*) FROM tablas.FAVORITOS WHERE id_propiedad = P.id_propiedad) AS total_favoritos
    FROM tablas.PROPIEDADES P
    INNER JOIN tablas.CATEGORIAS C   ON P.id_categoria = C.id_categoria
    INNER JOIN tablas.UBICACIONES UB ON P.id_ubicacion = UB.id_ubicacion
    WHERE P.id_usuario = @id_usuario
    ORDER BY P.fecha_publicacion DESC;
END
GO
USE AlquilaoRD;
GO

CREATE OR ALTER VIEW vistas.vw_propiedadescompletas AS
SELECT
    P.id_propiedad,
    P.titulo,
    P.descripcion,
    P.precio,
    P.habitaciones,
    P.banos,
    P.metros_cuadrados,
    P.disponible,
    P.fecha_publicacion,
    C.nombre_categoria AS categoria,
    U.nombre AS propietario,
    U.correo AS correo_propietario,
    U.telefono AS telefono_propietario,
    UB.sector,
    UB.municipio,
    UB.provincia,
    UB.latitud,
    UB.longitud
FROM tablas.PROPIEDADES P
INNER JOIN tablas.CATEGORIAS C   ON P.id_categoria = C.id_categoria
INNER JOIN tablas.USUARIOS U      ON P.id_usuario = U.id_usuario
INNER JOIN tablas.UBICACIONES UB ON P.id_ubicacion = UB.id_ubicacion
WHERE P.disponible = 1;
GO
PRINT ' Vista vistas.vw_PropiedadesCompletas instalada.';
GO
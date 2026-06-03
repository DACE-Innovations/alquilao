USE AlquilaoRD;
GO

-- 2.1 ROLES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.ROLES') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.ROLES (
        id_rol       INT IDENTITY(1,1) PRIMARY KEY,
        nombre_rol   NVARCHAR(50) NOT NULL UNIQUE
    );
    PRINT ' Tabla tablas.ROLES creada.';
END
GO

-- 2.2 CATEGORIAS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.CATEGORIAS') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.CATEGORIAS (
        id_categoria    INT IDENTITY(1,1) PRIMARY KEY,
        nombre_categoria NVARCHAR(50) NOT NULL UNIQUE
    );
    PRINT ' Tabla tablas.CATEGORIAS creada.';
END
GO

-- 2.3 UBICACIONES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.UBICACIONES') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.UBICACIONES (
        id_ubicacion UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        latitud      FLOAT,
        longitud     FLOAT,
        pais         NVARCHAR(100),
        provincia    NVARCHAR(100),
        municipio    NVARCHAR(100),
        sector       NVARCHAR(100),
        direccion    NVARCHAR(255),
        referencia   NVARCHAR(MAX)
    );
    PRINT ' Tabla tablas.UBICACIONES creada.';
END
GO

-- 2.4 USUARIOS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.USUARIOS') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.USUARIOS (
        id_usuario      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        id_rol          INT NOT NULL,
        fecha_registro  DATETIME2 DEFAULT GETDATE(),
        activo          BIT DEFAULT 1,
        nombre          NVARCHAR(100) NOT NULL,
        correo          NVARCHAR(150) NOT NULL UNIQUE,
        contrasena      NVARCHAR(MAX) NOT NULL, 
        telefono        NVARCHAR(20),
        telefono_cifrado VARBINARY(MAX),         
        foto_perfil     NVARCHAR(MAX),

        CONSTRAINT FK_USUARIOS_ROL FOREIGN KEY (id_rol) REFERENCES tablas.ROLES(id_rol)
    );
    PRINT ' Tabla tablas.USUARIOS creada.';
END
GO

-- 2.5 PROPIEDADES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.PROPIEDADES') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.PROPIEDADES (
        id_propiedad    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        id_usuario      UNIQUEIDENTIFIER NOT NULL,
        id_ubicacion    UNIQUEIDENTIFIER NOT NULL,
        id_categoria    INT NOT NULL,
        habitaciones    SMALLINT DEFAULT 0,
        banos           SMALLINT DEFAULT 0,
        disponible      BIT DEFAULT 1,
        fecha_publicacion DATETIME2 DEFAULT GETDATE(),
        titulo          NVARCHAR(200) NOT NULL,
        descripcion     NVARCHAR(MAX),
        precio          DECIMAL(18,2) NOT NULL,
        metros_cuadrados DECIMAL(10,2),

        CONSTRAINT FK_PROP_USUARIO   FOREIGN KEY (id_usuario) REFERENCES tablas.USUARIOS(id_usuario),
        CONSTRAINT FK_PROP_UBICACION FOREIGN KEY (id_ubicacion) REFERENCES tablas.UBICACIONES(id_ubicacion),
        CONSTRAINT FK_PROP_CATEGORIA FOREIGN KEY (id_categoria) REFERENCES tablas.CATEGORIAS(id_categoria)
    );
    PRINT ' Tabla tablas.PROPIEDADES creada.';
END
GO

-- 2.6 IMAGENES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.IMAGENES') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.IMAGENES (
        id_imagen    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        id_propiedad UNIQUEIDENTIFIER NOT NULL,
        url          NVARCHAR(MAX) NOT NULL,
        es_portada   BIT DEFAULT 0,
        orden        INT DEFAULT 0,

        CONSTRAINT FK_IMG_PROPIEDAD FOREIGN KEY (id_propiedad) REFERENCES tablas.PROPIEDADES(id_propiedad) ON DELETE CASCADE
    );
    PRINT ' Tabla tablas.IMAGENES creada.';
END
GO

-- 2.7 FAVORITOS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.FAVORITOS') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.FAVORITOS (
        id_favorito    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        id_usuario     UNIQUEIDENTIFIER NOT NULL,
        id_propiedad   UNIQUEIDENTIFIER NOT NULL,
        fecha_guardado DATETIME2 DEFAULT GETDATE(),

        CONSTRAINT FK_FAV_USUARIO   FOREIGN KEY (id_usuario) REFERENCES tablas.USUARIOS(id_usuario) ON DELETE CASCADE,
        CONSTRAINT FK_FAV_PROPIEDAD FOREIGN KEY (id_propiedad) REFERENCES tablas.PROPIEDADES(id_propiedad) ON DELETE CASCADE,
        CONSTRAINT UQ_FAVORITO UNIQUE (id_usuario, id_propiedad)
    );
    PRINT ' Tabla tablas.FAVORITOS creada.';
END
GO

-- 2.8 MENSAJES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.MENSAJES') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.MENSAJES (
        id_mensaje   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        id_emisor    UNIQUEIDENTIFIER NOT NULL,
        id_receptor  UNIQUEIDENTIFIER NOT NULL,
        id_propiedad UNIQUEIDENTIFIER NOT NULL,
        fecha_envio  DATETIME2 DEFAULT GETDATE(),
        leido        BIT DEFAULT 0,
        contenido    NVARCHAR(MAX) NOT NULL,

        CONSTRAINT FK_MSG_EMISOR    FOREIGN KEY (id_emisor) REFERENCES tablas.USUARIOS(id_usuario),
        CONSTRAINT FK_MSG_RECEPTOR  FOREIGN KEY (id_receptor) REFERENCES tablas.USUARIOS(id_usuario),
        CONSTRAINT FK_MSG_PROPIEDAD FOREIGN KEY (id_propiedad) REFERENCES tablas.PROPIEDADES(id_propiedad)
    );
    PRINT ' Tabla tablas.MENSAJES creada.';
END
GO

-- 2.9 REPORTES
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.REPORTES') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.REPORTES (
        id_reporte   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
        id_usuario   UNIQUEIDENTIFIER NOT NULL,
        id_propiedad UNIQUEIDENTIFIER NOT NULL,
        fecha_reporte DATETIME2 DEFAULT GETDATE(),
        motivo       NVARCHAR(100),
        descripcion  NVARCHAR(MAX),
        estado       NVARCHAR(50) DEFAULT 'pendiente',

        CONSTRAINT FK_REP_USUARIO   FOREIGN KEY (id_usuario) REFERENCES tablas.USUARIOS(id_usuario),
        CONSTRAINT FK_REP_PROPIEDAD FOREIGN KEY (id_propiedad) REFERENCES tablas.PROPIEDADES(id_propiedad)
    );
    PRINT ' Tabla tablas.REPORTES creada.';
END
GO

-- 2.10 TABLA DE AUDITORÍA AVANZADA
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'tablas.AUDITORIA') AND type in (N'U'))
BEGIN
    CREATE TABLE tablas.AUDITORIA (
        id_auditoria      INT IDENTITY(1,1) PRIMARY KEY,
        id_propiedad      UNIQUEIDENTIFIER NOT NULL,
        accion            NVARCHAR(20) NOT NULL, 
        precio_anterior   DECIMAL(18,2) NULL,
        precio_nuevo      DECIMAL(18,2) NULL,
        estado_anterior   NVARCHAR(50) NULL,
        estado_nuevo      NVARCHAR(50) NULL,
        usuario_bd        NVARCHAR(100) DEFAULT SUSER_SNAME(),
        fecha_cambio      DATETIME DEFAULT GETDATE()
    );
    PRINT ' Tabla de tablas.AUDITORIA creada.';
END
GO
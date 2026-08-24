USE AlquilaoRD;
GO

-- SP_01: Registrar usuario con blindaje criptográfico TRY/CATCH
CREATE OR ALTER PROCEDURE procedimientos.sp_RegistrarUsuario
    @nombre     NVARCHAR(100),
    @correo     NVARCHAR(150),
    @contrasena NVARCHAR(MAX),
    @telefono   NVARCHAR(20),
    @id_rol     INT = 4
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM tablas.USUARIOS WHERE correo = @correo)
    BEGIN
        RAISERROR('El correo ya está registrado.', 16, 1);
        RETURN;
    END

    DECLARE @id_nuevo UNIQUEIDENTIFIER = NEWID();

    BEGIN TRY
        OPEN SYMMETRIC KEY ClaveSimetricaDatos DECRYPTION BY CERTIFICATE CertificadoAlquilao;

        INSERT INTO tablas.USUARIOS (id_usuario, id_rol, nombre, correo, contrasena, telefono, telefono_cifrado)
        VALUES (
            @id_nuevo,
            @id_rol,
            @nombre,
            @correo,
            @contrasena,
            @telefono,
            ENCRYPTBYKEY(KEY_GUID('ClaveSimetricaDatos'), @telefono)
        );

        CLOSE SYMMETRIC KEY ClaveSimetricaDatos;
    END TRY
    BEGIN CATCH
        IF EXISTS (SELECT 1 FROM sys.openkeys WHERE key_guid = KEY_GUID('ClaveSimetricaDatos'))
        BEGIN
            CLOSE SYMMETRIC KEY ClaveSimetricaDatos;
        END
        ;THROW
    END CATCH

    SELECT id_usuario, nombre, correo, telefono, fecha_registro
    FROM tablas.USUARIOS
    WHERE id_usuario = @id_nuevo;
END
GO

-- SP_02: Login usuario
CREATE OR ALTER PROCEDURE procedimientos.sp_LoginUsuario
    @correo NVARCHAR(150)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        U.id_usuario, U.nombre, U.correo, U.contrasena, U.telefono, U.foto_perfil, U.activo, R.nombre_rol AS rol
    FROM tablas.USUARIOS U
    INNER JOIN tablas.ROLES R ON U.id_rol = R.id_rol
    WHERE U.correo = @correo AND U.activo = 1;
END
GO

CREATE OR ALTER PROCEDURE procedimientos.sp_RegistrarUsuario
    @nombre    NVARCHAR(100),
    @correo    NVARCHAR(150),
    @contrasena NVARCHAR(MAX),
    @telefono  NVARCHAR(20),
    @id_rol    INT = 4
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
        -- Abrir infraestructura criptográfica
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

        -- Cierre en flujo óptimo
        CLOSE SYMMETRIC KEY ClaveSimetricaDatos;
    END TRY
    BEGIN CATCH
        -- Si algo sale mal, verificamos si la llave quedó abierta en memoria y la cerramos
        IF EXISTS (SELECT 1 FROM sys.openkeys WHERE key_guid = KEY_GUID('ClaveSimetricaDatos'))
        BEGIN
            CLOSE SYMMETRIC KEY ClaveSimetricaDatos;
        END

        -- Relanzamos el error original para que la API de Node/Backend lo capture
        ;THROW
    END CATCH

    SELECT id_usuario, nombre, correo, telefono, fecha_registro 
    FROM tablas.USUARIOS 
    WHERE id_usuario = @id_nuevo;
END
GO
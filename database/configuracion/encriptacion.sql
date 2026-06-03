USE AlquilaoRD;
GO

-- 01. INFRAESTRUCTURA DE ENCRIPTACIÓN NATIVA (GRADO BANCARIO AES-256)
IF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE name LIKE '%DatabaseMasterKey%')
BEGIN
    CREATE MASTER KEY ENCRYPTION BY PASSWORD = 'ClaveMaestraSeguraAlquilao2026$#';
    PRINT ' Clave Maestra de la Base de Datos inicializada.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.certificates WHERE name = 'CertificadoAlquilao')
BEGIN
    CREATE CERTIFICATE CertificadoAlquilao WITH SUBJECT = 'Proteccion de Datos Personales AlquilaoRD';
    PRINT ' Certificado de Seguridad criptográfico emitido.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.symmetric_keys WHERE name = 'ClaveSimetricaDatos')
BEGIN
    CREATE SYMMETRIC KEY ClaveSimetricaDatos
    WITH ALGORITHM = AES_256
    ENCRYPTION BY CERTIFICATE CertificadoAlquilao;
    PRINT ' Clave Simétrica AES_256 configurada.';
END
GO
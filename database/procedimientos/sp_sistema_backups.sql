CREATE OR ALTER PROCEDURE procedimientos.sp_GenerarRespaldoBaseDatos
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RutaArchivo NVARCHAR(500);
    DECLARE @FechaString NVARCHAR(20);
    DECLARE @BackupDir NVARCHAR(400);
    
    -- Detectar dinámicamente la ruta de backups configurada en la instancia activa
    SET @BackupDir = CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS NVARCHAR(400));
    
    -- Si por alguna anomalía del servidor es nula, recurrimos a una ruta estándar como salvavidas
    IF @BackupDir IS NULL
        SET @BackupDir = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\Backup\';
    
    -- Asegurar que contenga la barra diagonal inversa al final
    IF RIGHT(@BackupDir, 1) <> '\' SET @BackupDir = @BackupDir + '\';

    SET @FechaString = REPLACE(REPLACE(REPLACE(CONVERT(NVARCHAR, GETDATE(), 120), '-', '_'), ' ', '_'), ':', '');
    SET @RutaArchivo = @BackupDir + 'AlquilaoRD_' + @FechaString + '.bak';
    
    BEGIN TRY
        BACKUP DATABASE AlquilaoRD
        TO DISK = @RutaArchivo
        WITH FORMAT, NAME = 'Respaldo Completo Automatico de AlquilaoRD';
        PRINT 'Backup generado dinámicamente en: ' + @RutaArchivo;
    END TRY
    BEGIN CATCH
        PRINT 'Error de respaldo: ' + ERROR_MESSAGE();
    END CATCH
END;
GO
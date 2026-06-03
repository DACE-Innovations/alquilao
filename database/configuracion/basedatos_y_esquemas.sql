-- 00. CREACIÓN DE BASE DE DATOS Y CONTENEDORES LÓGICOS (ESQUEMAS)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AlquilaoRD')
BEGIN
    CREATE DATABASE AlquilaoRD
    COLLATE SQL_Latin1_General_CP1_CI_AI;
    PRINT ' Base de datos AlquilaoRD creada.';
END
GO

USE AlquilaoRD;
GO

-- Creación de Schemas 
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'tablas')
    EXEC('CREATE SCHEMA tablas;');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'vistas')
    EXEC('CREATE SCHEMA vistas;');
GO
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'procedimientos')
    EXEC('CREATE SCHEMA procedimientos;');
GO
PRINT ' Esquemas estructurados correctamente.';
GO
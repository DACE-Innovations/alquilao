USE AlquilaoRD;
GO

CREATE OR ALTER TRIGGER tablas.trg_auditarpropiedades
ON tablas.PROPIEDADES
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO tablas.AUDITORIA (id_propiedad, accion, precio_anterior, precio_nuevo, estado_anterior, estado_nuevo)
    SELECT 
        d.id_propiedad,
        'UPDATE',
        d.precio,
        i.precio,
        CASE WHEN d.disponible = 1 THEN 'Disponible' ELSE 'Inactivo/Rentado' END,
        CASE WHEN i.disponible = 1 THEN 'Disponible' ELSE 'Inactivo/Rentado' END
    FROM deleted d
    JOIN inserted i ON d.id_propiedad = i.id_propiedad
    WHERE d.precio <> i.precio OR d.disponible <> i.disponible;
END;
GO
PRINT ' Trigger de auditoría en tablas.PROPIEDADES activado.';
GO
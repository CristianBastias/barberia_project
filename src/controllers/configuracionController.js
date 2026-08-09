const db = require('../config/db');

// Obtener parámetros de configuración global
exports.obtenerConfiguracion = async (req, res) => {
    try {
        // Asumiendo una tabla de configuración o valores por defecto
        res.json({
            nombreNegocio: 'Barbería Búho',
            horarioApertura: '09:00',
            horarioCierre: '20:00'
        });
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({ error: 'Error al obtener la configuración' });
    }
};

// Actualizar configuración
exports.actualizarConfiguracion = async (req, res) => {
    const { nombreNegocio, horarioApertura, horarioCierre } = req.body;
    try {
        // Lógica para actualizar en base de datos si dispones de una tabla de ajustes
        res.json({ mensaje: 'Configuración actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
};
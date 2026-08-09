// src/controllers/citaController.js
const citaService = require('../services/citaService');

exports.obtenerCitas = async (req, res) => {
    try {
        const citas = await citaService.listarCitas();
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ error: 'Error al obtener la agenda' });
    }
};

exports.actualizarEstadoCita = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'confirmada', 'completado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no válido' });
    }

    try {
        await citaService.cambiarEstadoCita(id, estado);
        res.json({ mensaje: 'Estado de cita actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error al actualizar el estado de la cita' });
    }
};

exports.crearCita = async (req, res) => {
    try {
        await citaService.reservarTurno(req.body);
        res.status(201).json({ mensaje: 'Cita creada exitosamente' });
    } catch (error) {
        console.error('Error detallado al crear cita:', error);
        res.status(400).json({ error: error.message || 'Error al registrar la cita' });
    }
};

exports.filtrarCitas = async (req, res) => {
    const { estado, barbero_id } = req.query;
    try {
        const citas = await citaService.filtrarCitas(estado, barbero_id);
        res.json(citas);
    } catch (error) {
        console.error('Error al filtrar citas:', error);
        res.status(500).json({ error: 'Error al filtrar' });
    }
};

exports.eliminarCita = async (req, res) => {
    const { id } = req.params;
    try {
        await citaService.eliminarCita(id);
        res.json({ mensaje: 'Cita eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar cita:', error);
        res.status(500).json({ error: 'Error al eliminar la cita' });
    }
};
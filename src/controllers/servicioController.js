const servicioService = require('../services/servicioService');

exports.listar = async (req, res) => {
    try {
        const servicios = await servicioService.listar(); 
        res.json(servicios);
    } catch (error) {
        console.error('Error al listar servicios:', error);
        res.status(500).json({ error: 'Error al obtener los servicios' });
    }
};

exports.crear = async (req, res) => {
    try {
        const { nombre, precio, duracion } = req.body;
        const imagen_url = req.file ? req.file.filename : null;

        if (!nombre || !precio || !duracion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        await servicioService.crear({ nombre, precio, duracion, imagen_url });
        res.status(201).json({ message: 'Servicio registrado con éxito.' });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ error: 'Error al registrar el servicio.' });
    }
};

exports.actualizar = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, duracion } = req.body;
        const imagen_url = req.file ? req.file.filename : null;

        if (!nombre || !precio || !duracion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        await servicioService.actualizar(id, { nombre, precio, duracion, imagen_url });
        res.status(200).json({ message: 'Servicio actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ error: 'Error al actualizar el servicio.' });
    }
};

exports.eliminar = async (req, res) => {
    try {
        const { id } = req.params;
        await servicioService.eliminar(id);
        res.status(200).json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ error: error.message });
    }
};
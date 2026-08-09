const servicioService = require('../services/servicioService');

class ServicioController {
    async obtenerServicios(req, res) {
        try {
            const servicios = await servicioService.listar();
            res.json(servicios);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener servicios' });
        }
    }

    async crearServicio(req, res) {
        try {
            const data = { ...req.body };
            
            // Si multer procesó una imagen, asignamos su ruta para que el repositorio la guarde
            if (req.file) {
                data.imagen_url = '/uploads/' + req.file.filename;
            }

            await servicioService.crear(data);
            res.json({ message: 'Servicio creado correctamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async actualizarServicio(req, res) {
        try {
            const data = { ...req.body };
            
            if (req.file) {
                data.imagen_url = '/uploads/' + req.file.filename;
            }

            await servicioService.actualizar(req.params.id, data);
            res.json({ message: 'Servicio actualizado correctamente' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async eliminarServicio(req, res) {
        try {
            const { id } = req.params;
            await servicioService.eliminarServicio(id);
            res.json({ message: 'Servicio desactivado con éxito' });
        } catch (err) {
            console.error('Error al desactivar servicio:', err.message);
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new ServicioController();
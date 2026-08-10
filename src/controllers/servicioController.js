const servicioRepository = require('../repositories/servicioRepository');

class ServicioController {
    async listar(req, res) {
        try {
            const servicios = await servicioRepository.obtenerTodos();
            res.json(servicios);
        } catch (error) {
            console.error('Error al listar servicios:', error);
            res.status(500).json({ error: 'Error al obtener los servicios' });
        }
    }

    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const resultado = await servicioRepository.eliminar(id);
            
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ error: 'El servicio no fue encontrado.' });
            }

            res.json({ success: true, message: 'Servicio dado de baja correctamente.' });
        } catch (error) {
            console.error('Error al eliminar el servicio:', error);
            res.status(500).json({ error: 'Error interno en el servidor.' });
        }
    }

    // (Tus métodos de crear y actualizar van aquí según tu implementación actual)
}

module.exports = new ServicioController();
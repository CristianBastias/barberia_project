const barberoService = require('../services/barberoService');
const barberoRepository = require('../repositories/barberoRepository'); // Asegúrate de importar el repositorio si cambias estado directo

class BarberoController {
    async obtenerBarberos(req, res) {
        try {
            const barberos = await barberoService.listarBarberos();
            res.json(barberos);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async crearBarbero(req, res) {
        try {
            await barberoService.crearBarbero(req.body);
            res.json({ message: 'Barbero registrado con éxito' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async actualizarBarbero(req, res) {
        try {
            const { id } = req.params;
            await barberoService.actualizarBarbero(id, req.body);
            res.json({ message: 'Barbero actualizado con éxito' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async eliminarBarbero(req, res) {
        try {
            const { id } = req.params;
            console.log(`--- INTENTANDO ELIMINAR BARBERO ID: ${id} ---`);
            await barberoService.eliminarBarbero(id);
            res.json({ message: 'Barbero eliminado con éxito' });
        } catch (err) {
            // AQUÍ IMPRIMIMOS EL ERROR REAL DE SQL O DEL SERVIDOR
            console.error('ERROR DETALLADO AL ELIMINAR:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            await barberoRepository.cambiarEstado(id);
            res.json({ message: 'Estado cambiado con éxito' });
        } catch (err) {
            // Esto enviará el mensaje exacto de que tiene citas pendientes al frontend
            res.status(400).json({ error: err.message });
        }
    }

    async eliminarBarbero(req, res) {
        try {
            const { id } = req.params;
            await barberoService.eliminarBarbero(id);
            res.json({ message: 'Barbero eliminado con éxito' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
}

module.exports = new BarberoController();
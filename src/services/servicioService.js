const servicioRepository = require('../repositories/servicioRepository');

class ServicioService {
    async listar() {
        return await servicioRepository.obtenerTodos();
    }

    async crear(data) {
        return await servicioRepository.crear(data);
    }

    async actualizar(id, data) {
        return await servicioRepository.actualizar(id, data);
    }

    async eliminar(id) {
        return await servicioRepository.eliminar(id);
    }
}

module.exports = new ServicioService();
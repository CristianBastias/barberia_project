const barberoRepository = require('../repositories/barberoRepository');

class BarberoService {
    async listarBarberos() {
        return await barberoRepository.obtenerTodos();
    }

    async crearBarbero(data) {
        return await barberoRepository.crear(data);
    }

    async actualizarBarbero(id, data) {
        return await barberoRepository.actualizar(id, data);
    }

    async eliminarBarbero(id) {
        return await barberoRepository.eliminar(id);
    }
}

module.exports = new BarberoService();
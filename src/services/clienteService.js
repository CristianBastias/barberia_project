const clienteRepository = require('../repositories/clienteRepository');

class ClienteService {
    async listarClientes() {
        return await clienteRepository.obtenerTodos();
    }

    async registrarCliente(data) {
        return await clienteRepository.crear(data);
    }
}

module.exports = new ClienteService();
const configuracionRepository = require('../repositories/configuracionRepository');

class ConfiguracionService {
    async obtenerAjustes() {
        return await configuracionRepository.obtenerConfiguracion();
    }

    async guardarAjustes(data) {
        return await configuracionRepository.actualizarConfiguracion(data);
    }
}

module.exports = new ConfiguracionService();
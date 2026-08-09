const estadisticaRepository = require('../repositories/estadisticaRepository');

class EstadisticaService {
    async generarEstadisticas() {
        return await estadisticaRepository.obtenerIngresosMensuales();
    }
}

module.exports = new EstadisticaService();
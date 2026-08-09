const db = require('../config/db');

class EstadisticaRepository {
    async obtenerIngresosMensuales() {
        const query = `
            SELECT MONTH(fecha) as mes, SUM(precio) as total_ingresos, COUNT(citas.id) as cantidad_citas
            FROM citas JOIN servicios ON citas.servicio_id = servicios.id
            WHERE estado = 'completado' GROUP BY MONTH(fecha)`;
        const [stats] = await db.query(query);
        return stats;
    }
}

module.exports = new EstadisticaRepository();
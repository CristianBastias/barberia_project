const db = require('../config/db');

class ConfiguracionRepository {
    async obtenerConfiguracion() {
        // Asumiendo una tabla de ajustes generales, o devolviendo un objeto base
        const [rows] = await db.promise().query('SELECT * FROM configuracion LIMIT 1');
        return rows[0] || { nombre_negocio: 'Barbería Búho', horario_apertura: '09:00', horario_cierre: '20:00' };
    }

    async actualizarConfiguracion(data) {
        const { nombre_negocio, horario_apertura, horario_cierre } = data;
        // Si tienes una tabla de configuración creada, realizas el update aquí:
        const [result] = await db.promise().query(
            'UPDATE configuracion SET nombre_negocio = ?, horario_apertura = ?, horario_cierre = ? WHERE id = 1',
            [nombre_negocio, horario_apertura, horario_cierre]
        );
        return result.affectedRows;
    }
}

module.exports = new ConfiguracionRepository();
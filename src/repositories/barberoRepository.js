const db = require('../config/db');

class BarberoRepository {
    async obtenerTodos() {
        // Traemos el barbero y contamos cuántas citas activas o pendientes tiene asociadas
        const query = `
            SELECT b.*, 
            (SELECT COUNT(*) FROM citas c WHERE c.barbero_id = b.id AND c.estado = 'pendiente') AS citas_pendientes 
            FROM barberos b
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    async crear(data) {
        const { nombre, especialidad } = data;
        const [result] = await db.query('INSERT INTO barberos (nombre, especialidad, activo) VALUES (?, ?, 1)', [nombre, especialidad]);
        return result;
    }

    async actualizar(id, data) {
        const { nombre, especialidad } = data;
        const [result] = await db.query('UPDATE barberos SET nombre = ?, especialidad = ? WHERE id = ?', [nombre, especialidad, id]);
        return result;
    }

    // Validación antes de cambiar el estado o eliminar
    async obtenerCitasPendientes(id) {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM citas WHERE barbero_id = ? AND estado = "pendiente"', [id]);
        return rows[0].total;
    }

    async cambiarEstado(id) {
        // Validamos primero si tiene citas pendientes antes de pasar a inactivo
        const pendientes = await this.obtenerCitasPendientes(id);
        if (pendientes > 0) {
            throw new Error(`No se puede desactivar al barbero porque tiene ${pendientes} cita(s) pendiente(s) por atender.`);
        }

        const [result] = await db.query('UPDATE barberos SET activo = IF(activo = 1, 0, 1) WHERE id = ?', [id]);
        return result;
    }

    async eliminar(id) {
        const pendientes = await this.obtenerCitasPendientes(id);
        if (pendientes > 0) {
            throw new Error(`No se puede eliminar al barbero porque tiene ${pendientes} cita(s) pendiente(s) asignadas.`);
        }

        const [result] = await db.query('DELETE FROM barberos WHERE id = ?', [id]);
        return result;
    }
}

module.exports = new BarberoRepository();
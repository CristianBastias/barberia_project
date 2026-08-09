const db = require('../config/db');

class IndumentariaRepository {
    async obtenerTodas() {
        const [rows] = await db.query('SELECT * FROM indumentaria ORDER BY id DESC');
        return rows;
    }

    async crear(data) {
        const { nombre, precio, stock, imagen_url, descripcion } = data;
        const [result] = await db.query(
            'INSERT INTO indumentaria (nombre, precio, stock, imagen_url, descripcion, activo) VALUES (?, ?, ?, ?, ?, 1)',
            [nombre, precio, stock, imagen_url || null, descripcion || null]
        );
        return result;
    }

    async actualizar(id, data) {
        const { nombre, precio, stock, imagen_url, descripcion } = data;
        const [result] = await db.query(
            'UPDATE indumentaria SET nombre = ?, precio = ?, stock = ?, imagen_url = ?, descripcion = ? WHERE id = ?',
            [nombre, precio, stock, imagen_url || null, descripcion || null, id]
        );
        return result;
    }

    async cambiarEstado(id) {
        const [result] = await db.query('UPDATE indumentaria SET activo = IF(activo = 1, 0, 1) WHERE id = ?', [id]);
        return result;
    }

    async eliminar(id) {
        const [result] = await db.query('DELETE FROM indumentaria WHERE id = ?', [id]);
        return result;
    }
}

module.exports = new IndumentariaRepository();
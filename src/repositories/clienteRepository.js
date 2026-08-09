const db = require('../config/db');

class ClienteRepository {
    async obtenerTodos() {
        const [rows] = await db.query('SELECT id, nombre, telefono, email, creado_en FROM clientes ORDER BY creado_en DESC');
        return rows;
    }

    async crear(clienteData) {
        const { nombre, telefono, email } = clienteData;
        const [result] = await db.promise().query(
            'INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?)',
            [nombre, telefono, email]
        );
        return result.insertId;
    }
}

module.exports = new ClienteRepository();
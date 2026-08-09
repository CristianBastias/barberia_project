const db = require('../config/db');

// Obtener todos los clientes
exports.obtenerClientes = async (req, res) => {
    try {
        const [clientes] = await db.promise().query(`
            SELECT id, nombre, telefono, email, creado_en 
            FROM clientes 
            ORDER BY creado_en DESC
        `);
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener el listado de clientes' });
    }
};

// Registrar un nuevo cliente (si es necesario desde el admin)
exports.crearCliente = async (req, res) => {
    const { nombre, telefono, email } = req.body;
    try {
        await db.promise().query(`
            INSERT INTO clientes (nombre, telefono, email) 
            VALUES (?, ?, ?)
        `, [nombre, telefono, email]);
        res.status(201).json({ mensaje: 'Cliente registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar cliente:', error);
        res.status(500).json({ error: 'Error al registrar el cliente' });
    }
};
const db = require('../config/db');

class ServicioRepository {
    async obtenerTodos() {
        const [servicios] = await db.query('SELECT * FROM servicios WHERE activo = 1');
        return servicios;
    }
    
    async crear(data) {
        const { nombre, precio, duracion, imagen_url } = data;
        await db.query('INSERT INTO servicios (nombre, precio, duracion, imagen_url, activo) VALUES (?, ?, ?, ?, 1)', 
        [nombre, precio, duracion, imagen_url]);
    }
    
    async actualizar(id, data) {
        const { nombre, precio, duracion, imagen_url } = data;
        await db.query('UPDATE servicios SET nombre = ?, precio = ?, duracion = ?, imagen_url = ? WHERE id = ?', 
        [nombre, precio, duracion, imagen_url, id]);
    }
    
    async eliminar(id) {
        const [result] = await db.query('UPDATE servicios SET activo = 0 WHERE id = ?', [id]);
        return result;
    }
}

module.exports = new ServicioRepository();
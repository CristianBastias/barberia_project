const db = require('../config/db');

class UsuarioRepository {
    async buscarPorEmailOUsuario(identifier) {
        // Busca al usuario por email o por nombre (según lo que ingresen en el login)
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE email = ? OR nombre = ?', 
            [identifier, identifier]
        );
        return rows[0]; // Retorna el usuario si existe, o undefined
    }
}

module.exports = new UsuarioRepository();
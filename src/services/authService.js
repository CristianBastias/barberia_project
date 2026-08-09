const usuarioRepository = require('../repositories/usuarioRepository');

class AuthService {
    async autenticar(identifier, password) {
        const usuario = await usuarioRepository.buscarPorEmailOUsuario(identifier);
        
        if (!usuario) {
            throw new Error('Usuario no encontrado.');
        }

        // Validación simple para la contraseña (puedes usar bcrypt más adelante si prefieres)
        if (usuario.password !== password) {
            throw new Error('Contraseña incorrecta.');
        }

        // Retornamos los datos esenciales del usuario (sin exponer la contraseña)
        return {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };
    }
}

module.exports = new AuthService();
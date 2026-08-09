const authService = require('../services/authService');

class AuthController {
    async login(req, res) {
        try {
            const { usuario, password } = req.body;

            if (!usuario || !password) {
                return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
            }

            const datosUsuario = await authService.autenticar(usuario, password);

            // Si el login es exitoso, devolvemos los datos y el rol
            res.json({
                message: '¡Bienvenido al sistema!',
                usuario: datosUsuario
            });
        } catch (err) {
            const status = err.message === 'Usuario no encontrado.' || err.message === 'Contraseña incorrecta.' ? 401 : 500;
            res.status(status).json({ error: err.message });
        }
    }
}

module.exports = new AuthController();
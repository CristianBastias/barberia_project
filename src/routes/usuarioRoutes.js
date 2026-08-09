const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { esAdmin } = require('../middlewares/auth');

// Solo el Admin puede ver y gestionar usuarios
router.get('/api/usuarios', esAdmin, usuarioController.obtenerUsuarios);
router.put('/api/usuarios/:id', esAdmin, usuarioController.actualizarUsuario);

module.exports = router;
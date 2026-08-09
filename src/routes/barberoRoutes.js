const express = require('express');
const router = express.Router();
const barberoController = require('../controllers/barberoController');

router.get('/admin/barberos', (req, res) => {
    res.render('admin/barberos', { 
        layout: 'layouts/admin',
        title: 'Panel de Barberos | Búho'
    });
});

router.get('/api/barberos', barberoController.obtenerBarberos);
router.post('/api/barberos', barberoController.crearBarbero);
router.put('/api/barberos/:id', barberoController.actualizarBarbero);
router.delete('/api/barberos/:id', barberoController.eliminarBarbero);
router.patch('/api/barberos/:id/estado', barberoController.cambiarEstado);

module.exports = router;
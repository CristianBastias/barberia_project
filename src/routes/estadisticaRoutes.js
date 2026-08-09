// routes/estadisticas.js
const express = require('express');
const router = express.Router();
const estadisticasController = require('../controllers/estadisticasController');

// Middleware opcional para verificar si el usuario es administrador
// const { asegurarAutenticacion, asegurarAdmin } = require('../middlewares/auth');

// Ruta para renderizar la vista del Dashboard de Estadísticas y Finanzas
router.get('/dashboard', /* asegurarAdmin, */ (req, res) => {
    res.render('dashboard'); // Renderiza tu archivo dashboard.ejs
});

// Ruta API para proveer los datos (ingresos, barbero estrella, gráficos, habitualidad) en JSON
router.get('/api/estadisticas/resumen', /* asegurarAdmin, */ estadisticasController.getResumenEstadisticas);

module.exports = router;
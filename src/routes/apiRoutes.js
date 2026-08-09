const citasController = require('../controllers/citasController');

router.get('/api/citas', citasController.obtenerCitas);
router.put('/api/citas/:id/estado', citasController.actualizarEstadoCita);
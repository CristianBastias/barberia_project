// src/routes/auditoriaRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Registrar la salida (Logout) del personal
router.post('/api/logout-registro', async (req, res) => {
    try {
        const { id, nombre, rol } = req.body;
        if (id) {
            await db.execute(
                'INSERT INTO registro_actividad_admin (usuario_id, tipo_evento, descripcion) VALUES (?, ?, ?)',
                [id, 'SALIDA', `El usuario ${nombre} (${rol}) cerró sesión y salió del panel.`]
            );
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error al registrar salida:', error);
        res.status(500).json({ error: 'Error al registrar salida' });
    }
});

// Consultar reporte de actividad e ingresos/salidas para el Admin Gral
router.get('/api/admin/reporte-actividad', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                r.id, 
                u.nombre AS empleado, 
                u.email, 
                u.rol, 
                r.tipo_evento, 
                r.descripcion, 
                r.fecha_hora 
            FROM registro_actividad_admin r
            JOIN usuarios u ON r.usuario_id = u.id
            ORDER BY r.fecha_hora DESC
            LIMIT 50
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener el reporte de actividad:', error);
        res.status(500).json({ error: 'Error al obtener el reporte' });
    }
});

module.exports = router;
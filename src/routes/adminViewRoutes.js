// src/routes/adminViewRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const estadisticasController = require('../controllers/estadisticasController'); // Asegúrate de que la ruta sea correcta

// Objeto de administrador fijo para asegurar estabilidad
const adminFijo = {
    nombre: 'Administrador',
    email: 'admin@buho.com',
    rol: 'SuperAdmin'
};

// Función auxiliar con layout de admin forzado y usuario fijo garantizado
const renderizarVistaAdmin = (vista, res, datosAdicionales = {}) => {
    res.render(`admin/${vista}`, { 
        layout: 'layouts/admin', 
        user: adminFijo,          
        ...datosAdicionales 
    });
};

// 1. Dashboard con estadísticas y KPIs reales (SSR tradicional)
router.get('/admin', async (req, res) => {
    try {
        const [rowsIngresos] = await db.query(`
            SELECT COALESCE(SUM(total_pagado), 0) AS ingresos_dia 
            FROM citas 
            WHERE DATE(fecha) = CURDATE() AND estado != 'cancelado'
        `);

        const [rowsCitasPendientes] = await db.query(`
            SELECT COUNT(*) AS citas_pendientes 
            FROM citas 
            WHERE estado = 'pendiente'
        `);

        const [rowsNuevosClientes] = await db.query(`
            SELECT COUNT(*) AS nuevos_clientes 
            FROM clientes 
            WHERE MONTH(creado_en) = MONTH(CURRENT_DATE()) 
              AND YEAR(creado_en) = YEAR(CURRENT_DATE())
        `);

        const [rowsBarberoEstrella] = await db.query(`
            SELECT b.nombre, COUNT(c.id) AS total_citas
            FROM citas c
            JOIN barberos b ON c.barbero_id = b.id
            WHERE c.estado != 'cancelado' 
              AND MONTH(c.fecha) = MONTH(CURRENT_DATE())
              AND YEAR(c.fecha) = YEAR(CURRENT_DATE())
            GROUP BY b.id, b.nombre
            ORDER BY total_citas DESC
            LIMIT 1
        `);

        const barberoEstrella = rowsBarberoEstrella.length > 0 ? rowsBarberoEstrella[0].nombre : 'Sin actividad';

        renderizarVistaAdmin('dashboard', res, {
            ingresosDia: rowsIngresos[0].ingresos_dia,
            citasPendientes: rowsCitasPendientes[0].citas_pendientes,
            nuevosClientes: rowsNuevosClientes[0].nuevos_clientes,
            barberoEstrella: barberoEstrella
        });

    } catch (error) {
        console.error('Error al calcular estadísticas para el Dashboard:', error);
        renderizarVistaAdmin('dashboard', res, { 
            ingresosDia: 0, 
            citasPendientes: 0, 
            nuevosClientes: 0, 
            barberoEstrella: 'Error de carga' 
        });
    }
});

// 2. ENDPOINT DE API para alimentar las gráficas y finanzas dinámicas del JS
router.get('/api/estadisticas/resumen', estadisticasController.getResumenEstadisticas);

// Módulos del panel de administración
router.get('/admin/citas', (req, res) => renderizarVistaAdmin('citas', res));
router.get('/admin/clientes', (req, res) => renderizarVistaAdmin('clientes', res));
router.get('/admin/barberos', (req, res) => renderizarVistaAdmin('barberos', res));
router.get('/admin/servicios', (req, res) => renderizarVistaAdmin('servicios', res));
router.get('/admin/usuarios', (req, res) => renderizarVistaAdmin('usuarios', res));
router.get('/admin/mail', (req, res) => renderizarVistaAdmin('mail', res));
router.get('/admin/indumentaria', (req, res) => renderizarVistaAdmin('gestion-indumentaria', res));
router.get('/admin/configuracion', (req, res) => renderizarVistaAdmin('configuracion', res));

module.exports = router;
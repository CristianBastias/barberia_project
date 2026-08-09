const citaService = require('../services/citaService');
const barberoService = require('../services/barberoService');
const servicioService = require('../services/servicioService');
const db = require('../config/db');

class AdminViewController {
    // Renderizar el Dashboard principal con KPIs
    async verDashboard(req, res) {
        try {
            // Puedes reutilizar la lógica de estadísticas que ya tienes en estadisticasController
            const [rowsIngresos] = await db.promise().query(`
                SELECT COALESCE(SUM(total_pagado), 0) AS ingresos_dia 
                FROM citas WHERE DATE(fecha_hora) = CURDATE() AND estado = 'completada'
            `);
            const [rowsCitasPendientes] = await db.promise().query(`
                SELECT COUNT(*) AS citas_pendientes FROM citas WHERE estado = 'pendiente'
            `);
            const [rowsNuevosClientes] = await db.promise().query(`
                SELECT COUNT(*) AS nuevos_clientes FROM clientes 
                WHERE MONTH(creado_en) = MONTH(CURRENT_DATE()) AND YEAR(creado_en) = YEAR(CURRENT_DATE())
            `);

            res.render('admin/dashboard', {
                title: 'Dashboard | Panel de Administración',
                usuario: req.session.usuario || { nombre: 'Administrador' },
                stats: {
                    ingresosDia: rowsIngresos[0].ingresos_dia,
                    citasPendientes: rowsCitasPendientes[0].citas_pendientes,
                    nuevosClientes: rowsNuevosClientes[0].nuevos_clientes
                }
            });
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
            res.render('admin/dashboard', { 
                title: 'Dashboard', 
                usuario: req.session.usuario,
                stats: { ingresosDia: 0, citasPendientes: 0, nuevosClientes: 0 }
            });
        }
    }

    // Renderizar la vista de gestión de Citas
    async verCitas(req, res) {
        try {
            const citas = await citaService.listarCitas();
            res.render('admin/citas', {
                title: 'Gestión de Citas | Búho',
                usuario: req.session.usuario,
                citas
            });
        } catch (error) {
            console.error('Error al renderizar citas:', error);
            res.status(500).send('Error al cargar la sección de citas');
        }
    }

    // Renderizar la vista de Servicios
    async verServicios(req, res) {
        try {
            const servicios = await servicioService.listar();
            res.render('admin/servicios', {
                title: 'Gestión de Servicios | Búho',
                usuario: req.session.usuario,
                servicios
            });
        } catch (error) {
            console.error('Error al renderizar servicios:', error);
            res.status(500).send('Error al cargar la sección de servicios');
        }
    }
}

module.exports = new AdminViewController();
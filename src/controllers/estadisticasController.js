// src/controllers/estadisticasController.js
const db = require('../config/db');

const estadisticasController = {
    getResumenEstadisticas: async (req, res) => {
        try {
            const [ingresosDiario] = await db.query(`
                SELECT SUM(total_pagado) as total FROM citas 
                WHERE DATE(fecha) = CURDATE() AND estado != 'cancelado'
            `);

            const [ingresosQuincenal] = await db.query(`
                SELECT SUM(total_pagado) as total FROM citas 
                WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 15 DAY) AND estado != 'cancelado'
            `);

            const [ingresosMensual] = await db.query(`
                SELECT SUM(total_pagado) as total FROM citas 
                WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND estado != 'cancelado'
            `);

            const [ingresosAnual] = await db.query(`
                SELECT SUM(total_pagado) as total FROM citas 
                WHERE YEAR(fecha) = YEAR(CURDATE()) AND estado != 'cancelado'
            `);

            const [barberoEstrellaQuery] = await db.query(`
                SELECT b.nombre, b.especialidad, COUNT(c.id) as serviciosCompletados, SUM(c.total_pagado) as recaudacionComision
                FROM citas c
                JOIN barberos b ON c.barbero_id = b.id
                WHERE MONTH(c.fecha) = MONTH(CURDATE()) AND YEAR(c.fecha) = YEAR(CURDATE()) AND c.estado != 'cancelado'
                GROUP BY b.id
                ORDER BY serviciosCompletados DESC
                LIMIT 1
            `);

            const barberoEstrella = barberoEstrellaQuery.length > 0 ? barberoEstrellaQuery[0] : {
                nombre: "Sin datos este mes",
                especialidad: "N/A",
                serviciosCompletados: 0,
                recaudacionComision: 0
            };

            const [horariosQuery] = await db.query(`
                SELECT TIME_FORMAT(fecha, '%H:00') as hora, COUNT(*) as total 
                FROM citas 
                WHERE estado != 'cancelado'
                GROUP BY hora 
                ORDER BY hora ASC
            `);

            const horariosPico = {
                labels: horariosQuery.map(h => h.hora),
                data: horariosQuery.map(h => h.total)
            };

            const [serviciosQuery] = await db.query(`
                SELECT s.nombre, COUNT(c.id) as total 
                FROM citas c
                JOIN servicios s ON c.servicio_id = s.id
                WHERE c.estado != 'cancelado'
                GROUP BY s.id, s.nombre
                ORDER BY total DESC
                LIMIT 5
            `);

            const serviciosTop = {
                labels: serviciosQuery.map(s => s.nombre),
                data: serviciosQuery.map(s => s.total)
            };

            const [clientesQuery] = await db.query(`
                SELECT nombre, telefono, COUNT(id) as totalVisitas, MAX(fecha) as ultimaVisita
                FROM citas
                WHERE estado != 'cancelado'
                GROUP BY telefono, nombre
                ORDER BY totalVisitas DESC
                LIMIT 10
            `);

            const clientesHabitualidad = clientesQuery.map(c => ({
                nombre: c.nombre,
                telefono: c.telefono,
                totalVisitas: c.totalVisitas,
                ultimaVisita: new Date(c.ultimaVisita).toLocaleDateString()
            }));

            return res.json({
                ingresos: {
                    diario: ingresosDiario[0].total || 0,
                    quincenal: ingresosQuincenal[0].total || 0,
                    mensual: ingresosMensual[0].total || 0,
                    anual: ingresosAnual[0].total || 0
                },
                barberoEstrella,
                horariosPico,
                serviciosTop,
                clientesHabitualidad
            });

        } catch (error) {
            console.error("Error al calcular estadísticas financieras:", error);
            return res.status(500).json({ error: "Error interno al procesar las estadísticas." });
        }
    }
};

module.exports = estadisticasController;
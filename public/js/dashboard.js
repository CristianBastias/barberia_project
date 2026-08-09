document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticasDashboard();
});

async function cargarEstadisticasDashboard() {
    try {
        const response = await fetch('/api/estadisticas');
        if (!response.ok) throw new Error('Error al cargar las estadísticas del dashboard');
        
        const stats = await response.json();
        
        // Asignación a los IDs de las tarjetas de la Fase 1
        const elIngresos = document.getElementById('statIngresosDia');
        const elPendientes = document.getElementById('statCitasPendientes');
        const elNuevos = document.getElementById('statNuevosClientes');
        const elBarbero = document.getElementById('statBarberoEstrella');

        if (elIngresos) elIngresos.textContent = `$${Number(stats.ingresosDia || 0).toLocaleString()}`;
        if (elPendientes) elPendientes.textContent = stats.citasPendientes || 0;
        if (elNuevos) elNuevos.textContent = stats.nuevosClientes || 0;
        if (elBarbero) elBarbero.textContent = stats.barberoEstrella || 'Sin actividad';

    } catch (error) {
        console.error('Error al actualizar el Dashboard:', error);
    }
}
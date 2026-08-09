// public/js/estadisticas-finanzas.js

document.addEventListener('DOMContentLoaded', async () => {
    await refrescarDatosFinancieros();
});

async function refrescarDatosFinancieros() {
    try {
        const response = await fetch('/api/estadisticas/resumen');
        if (!response.ok) throw new Error('Error al obtener los datos de estadísticas');
        
        const data = await response.json();
        
        // 1. Actualizar Tarjetas de Ingresos (IDs exactos del HTML)
        const elDiario = document.getElementById('ingreso-diario');
        const elQuincenal = document.getElementById('ingreso-quincenal');
        const elMensual = document.getElementById('ingreso-mensual');
        const elAnual = document.getElementById('ingreso-anual');

        if (elDiario) elDiario.innerText = `$${Number(data.ingresos.diario).toLocaleString()}`;
        if (elQuincenal) elQuincenal.innerText = `$${Number(data.ingresos.quincenal).toLocaleString()}`;
        if (elMensual) elMensual.innerText = `$${Number(data.ingresos.mensual).toLocaleString()}`;
        if (elAnual) elAnual.innerText = `$${Number(data.ingresos.anual).toLocaleString()}`;

        // 2. Actualizar Tarjeta de Barbero Estrella
        const nombreBarbero = document.getElementById('barbero-estrella-nombre');
        const statsBarbero = document.getElementById('barbero-estrella-stats');
        const recaudacionBarbero = document.getElementById('barbero-estrella-recaudacion');

        if (nombreBarbero) nombreBarbero.innerText = data.barberoEstrella.nombre;
        if (statsBarbero) statsBarbero.innerText = `${data.barberoEstrella.serviciosCompletados} servicios completados · Especialidad: ${data.barberoEstrella.especialidad || 'N/A'}`;
        if (recaudacionBarbero) recaudacionBarbero.innerText = `$${Number(data.barberoEstrella.recaudacionComision || 0).toLocaleString()}`;

        // 3. Renderizar Gráficos (IDs exactos del HTML: 'grafico-horarios' y 'grafico-servicios')
        renderizarGraficoHorarios(data.horariosPico);
        renderizarGraficoServicios(data.serviciosTop);

        // 4. Poblar Tabla de Habitualidad de Clientes
        poblarTablaHabitualidad(data.clientesHabitualidad);

    } catch (error) {
        console.error('Error al actualizar las métricas financieras:', error);
    }
}

function renderizarGraficoHorarios(horariosPico) {
    const canvas = document.getElementById('grafico-horarios');
    if (!canvas) return;

    // Destruir instancia previa si existe para evitar duplicados al refrescar
    if (window.chartHorariosInstance) window.chartHorariosInstance.destroy();

    window.chartHorariosInstance = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: horariosPico.labels,
            datasets: [{
                label: 'Turnos Solicitados',
                data: horariosPico.data,
                backgroundColor: 'rgba(52, 211, 153, 0.4)',
                borderColor: 'rgba(52, 211, 153, 1)',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

function renderizarGraficoServicios(serviciosTop) {
    const canvas = document.getElementById('grafico-servicios');
    if (!canvas) return;

    if (window.chartServiciosInstance) window.chartServiciosInstance.destroy();

    window.chartServiciosInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: serviciosTop.labels,
            datasets: [{
                data: serviciosTop.data,
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

function poblarTablaHabitualidad(clientes) {
    const tbody = document.getElementById('tabla-clientes-habitualidad');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-500 text-xs">No hay registros de clientes frecuentes aún.</td></tr>`;
        return;
    }

    clientes.forEach(c => {
        tbody.innerHTML += `
            <tr class="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors">
                <td class="py-3 px-4 text-white font-medium">${c.nombre}</td>
                <td class="py-3 px-4 text-slate-400">${c.telefono}</td>
                <td class="py-3 px-4 text-emerald-400 font-bold">${c.totalVisitas} visitas</td>
                <td class="py-3 px-4 text-slate-400 text-xs">${c.ultimaVisita}</td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Frecuente</span>
                </td>
                <td class="py-3 px-4 text-right">
                    <button class="px-3 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs transition-colors cursor-pointer">
                        Ver Promo
                    </button>
                </td>
            </tr>
        `;
    });
}
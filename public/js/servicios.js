document.addEventListener('DOMContentLoaded', () => {
    cargarServicios();

    const formServicio = document.getElementById('formServicio');
    if (formServicio) {
        formServicio.addEventListener('submit', registrarServicio);
    }
});

async function cargarServicios() {
    try {
        const response = await fetch('/api/servicios');
        if (!response.ok) throw new Error('Error al cargar servicios');

        const servicios = await response.json();
        const tbody = document.getElementById('tablaServiciosCuerpo');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (servicios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500">No hay servicios registrados.</td></tr>`;
            return;
        }

        servicios.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="py-4 px-4 font-mono text-xs text-slate-300">#${s.id}</td>
                <td class="py-4 px-4 text-white font-medium">${s.nombre}</td>
                <td class="py-4 px-4 font-mono text-emerald-400">$${Number(s.precio).toLocaleString()}</td>
                <td class="py-4 px-4 text-slate-400 text-xs">${s.duracion_minutos ? s.duracion_minutos + ' mins' : 'N/D'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

async function registrarServicio(e) {
    e.preventDefault();
    const nuevoServicio = {
        nombre: document.getElementById('nombreServicio').value,
        precio: document.getElementById('precioServicio').value,
        duracion_minutos: document.getElementById('duracionServicio').value
    };

    try {
        const response = await fetch('/api/servicios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoServicio)
        });

        if (!response.ok) throw new Error('No se pudo registrar el servicio');

        this.reset();
        cargarServicios();
        alert('¡Servicio registrado con éxito!');
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al registrar el servicio.');
    }
}
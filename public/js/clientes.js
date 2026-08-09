// src/public/js/clientes.js
document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();

    const inputBuscar = document.getElementById('buscarCliente');
    if (inputBuscar) {
        inputBuscar.addEventListener('input', function() {
            filtrarClientesLocales(this.value.toLowerCase());
        });
    }
});

let clientesGlobal = [];

async function cargarClientes() {
    try {
        // Puedes usar '/api/clientes' o '/api/usuarios' según tu backend
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Error al cargar clientes');

        const data = await response.json();
        
        // Filtramos para asegurar que solo se muestren los clientes
        clientesGlobal = data.filter(user => !user.rol || user.rol === 'cliente');
        
        renderizarTablaClientes(clientesGlobal);
    } catch (error) {
        console.error('Error:', error);
        const tbody = document.getElementById('tablaClientes') || document.getElementById('tablaClientesCuerpo');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-red-400 italic">Error al cargar los clientes.</td></tr>`;
        }
    }
}

function renderizarTablaClientes(clientes) {
    // Buscamos cualquiera de los dos IDs de tabla posibles para evitar que falle
    const tbody = document.getElementById('tablaClientes') || document.getElementById('tablaClientesCuerpo');
    const contador = document.getElementById('contadorClientes');
    
    if (!tbody) return;

    tbody.innerHTML = '';
    if (contador) {
        contador.textContent = `${clientes.length} cliente${clientes.length !== 1 ? 's' : ''}`;
    }

    if (clientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-500 italic">No hay clientes registrados.</td></tr>`;
        return;
    }

    clientes.forEach(c => {
        const fechaRegistro = c.creado_en ? new Date(c.creado_en).toLocaleDateString() : 'Reciente';
        const tr = document.createElement('tr');
        tr.className = 'border-b border-slate-800/60 hover:bg-slate-800/30 transition-all';
        tr.innerHTML = `
            <td class="py-4 px-4 font-mono text-xs text-slate-400">#${c.id}</td>
            <td class="py-4 px-4 text-white font-medium">${c.nombre || '-'}</td>
            <td class="py-4 px-4 text-slate-300">${c.usuario || c.email || 'Sin correo'}</td>
            <td class="py-4 px-4 text-slate-300">${c.telefono || 'Sin teléfono'}</td>
            <td class="py-4 px-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ${c.rol || 'cliente'}
                </span>
            </td>
            <td class="py-4 px-4 text-center text-slate-400 text-xs">${fechaRegistro}</td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrarClientesLocales(texto) {
    const filtrados = clientesGlobal.filter(c => 
        (c.nombre && c.nombre.toLowerCase().includes(texto)) ||
        (c.usuario && c.usuario.toLowerCase().includes(texto)) ||
        (c.email && c.email.toLowerCase().includes(texto))
    );
    renderizarTablaClientes(filtrados);
}
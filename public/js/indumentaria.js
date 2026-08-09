document.addEventListener("DOMContentLoaded", function () {
    cargarIndumentaria();

    const formIndumentaria = document.getElementById('formIndumentaria');
    if (formIndumentaria) {
        formIndumentaria.addEventListener('submit', async function (e) {
            e.preventDefault(); // Evita que la página se recargue por completo

            const id = document.getElementById('productoIdEdit').value;
            const inputArchivo = document.getElementById('imagenProducto');

            const formData = new FormData();
            formData.append('nombre', document.getElementById('nombreProducto').value.trim());
            formData.append('precio', parseFloat(document.getElementById('precioProducto').value));
            formData.append('stock', parseInt(document.getElementById('stockProducto').value, 10));
            formData.append('descripcion', document.getElementById('descripcionProducto').value.trim());

            if (inputArchivo.files[0]) {
                formData.append('imagen', inputArchivo.files[0]);
            }

            try {
                let response;
                if (id) {
                    response = await fetch(`/api/indumentaria/${id}`, {
                        method: 'PUT',
                        body: formData
                    });
                } else {
                    response = await fetch('/api/indumentaria', {
                        method: 'POST',
                        body: formData
                    });
                }

                const data = await response.json();

                if (response.ok) {
                    alert(id ? '¡Prenda actualizada con éxito!' : '¡Prenda registrada con éxito!');
                    resetearFormularioProducto();
                    cargarIndumentaria();
                } else {
                    alert(data.error || 'Ocurrió un error al procesar la prenda.');
                }
            } catch (error) {
                console.error("Error al guardar prenda:", error);
                alert('Error de conexión con el servidor.');
            }
        });
    }
});

// Función para cargar y listar las prendas en la tabla del panel de administración
async function cargarIndumentaria() {
    try {
        const response = await fetch('/api/indumentaria');
        if (!response.ok) throw new Error('Error al obtener la indumentaria');
        
        const productos = await response.json();
        renderizarTablaAdmin(productos);
    } catch (error) {
        console.error("Error al cargar la indumentaria en el panel:", error);
    }
}

// Función para renderizar las filas en la tabla HTML del panel
function renderizarTablaAdmin(productos) {
    const tbody = document.getElementById('tablaIndumentaria');
    const contador = document.getElementById('contadorProductos');
    
    if (!tbody) return;

    tbody.innerHTML = '';
    if (contador) contador.textContent = `${productos.length} prendas`;

    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500 italic">No hay prendas registradas.</td></tr>`;
        return;
    }

    productos.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-800/60 hover:bg-slate-950/40 transition-colors";

        const precioFormateado = parseFloat(item.precio).toLocaleString('es-AR', { minimumFractionDigits: 2 });
        const estadoBadge = (item.activo == 1 || item.activo === true)
            ? '<span class="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-lg">Activo</span>'
            : '<span class="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-lg">Inactivo</span>';

        tr.innerHTML = `
        <td class="py-3.5 px-4 flex items-center gap-3">
            <img src="${item.imagen_url || '/img/ropa.jpg'}" alt="" class="w-10 h-10 object-cover rounded-xl border border-slate-800">
            <span class="font-medium text-white text-sm">${item.nombre}</span>
        </td>
        <td class="py-3.5 px-4 text-slate-300 text-sm">$${precioFormateado}</td>
        <td class="py-3.5 px-4 text-slate-300 text-sm">${item.stock} u.</td>
        <td class="py-3.5 px-4">${estadoBadge}</td>
        <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
            <button onclick="editarPrenda(${item.id}, '${item.nombre.replace(/'/g, "\\'")}', ${item.precio}, ${item.stock}, \`${item.descripcion || ''}\`)" class="p-1.5 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg text-xs transition-all border border-amber-500/30 cursor-pointer inline-flex items-center justify-center" title="Editar">
                <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button onclick="cambiarEstadoPrenda(${item.id})" class="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs transition-all border border-blue-500/30 cursor-pointer inline-flex items-center justify-center" title="Cambiar Estado">
                <i class="fa-solid fa-eye-slash text-xs"></i>
            </button>
            <button onclick="eliminarPrenda(${item.id})" class="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs transition-all border border-red-500/30 cursor-pointer inline-flex items-center justify-center" title="Eliminar">
                <i class="fa-solid fa-trash text-xs"></i>
            </button>
        </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funciones auxiliares de control para los botones de la tabla
function resetearFormularioProducto() {
    const form = document.getElementById('formIndumentaria');
    if (form) form.reset();
    document.getElementById('productoIdEdit').value = '';
    document.getElementById('formTituloProducto').innerHTML = '<i class="fa-solid fa-circle-plus"></i> Registrar Nueva Prenda';
    document.getElementById('btnSubmitProducto').textContent = 'Guardar Prenda';
    const btnCancelar = document.getElementById('btnCancelarEdicionProducto');
    if (btnCancelar) btnCancelar.classList.add('hidden');
}

function editarPrenda(id, nombre, precio, stock, descripcion) {
    document.getElementById('productoIdEdit').value = id;
    document.getElementById('nombreProducto').value = nombre;
    document.getElementById('precioProducto').value = precio;
    document.getElementById('stockProducto').value = stock;
    document.getElementById('descripcionProducto').value = descripcion;
    
    document.getElementById('formTituloProducto').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Editar Prenda';
    document.getElementById('btnSubmitProducto').textContent = 'Actualizar Prenda';
    document.getElementById('btnCancelarEdicionProducto').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function cambiarEstadoPrenda(id) {
    try {
        const response = await fetch(`/api/indumentaria/${id}/estado`, { method: 'PATCH' });
        if (response.ok) {
            cargarIndumentaria();
        } else {
            alert('Error al cambiar el estado de la prenda');
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

async function eliminarPrenda(id) {
    if (!confirm('¿Estás seguro de eliminar esta prenda permanentemente?')) return;
    try {
        const response = await fetch(`/api/indumentaria/${id}`, { method: 'DELETE' });
        if (response.ok) {
            cargarIndumentaria();
        } else {
            alert('Error al eliminar la prenda');
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
// ==========================================
// CONSTANTE GLOBAL
// ==========================================
const CORREO_ADMIN = 'admin@buho.com';

// ==========================================
// 1- CONTROL DE ACCESO Y HEADER (Admin General)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    let usuarioLogueado = null;
    try {
        usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));
    } catch (e) {
        console.error("Error al leer la sesión", e);
    }

    const nombreUsuario = usuarioLogueado?.nombre || 'Administrador';

    // Si no hay ninguna sesión activa, redirigir al login
    if (!usuarioLogueado && !localStorage.getItem('usuarioRol')) {
        window.location.replace('/');
        return;
    }

    // Rellenar header dinámicamente
    const elNombre = document.getElementById('userNombre');
    const elEmail = document.getElementById('userEmail');
    const elAvatar = document.getElementById('userAvatar');

    if (elNombre) elNombre.textContent = nombreUsuario;
    
    if (elAvatar) {
        const partes = nombreUsuario.split(' ');
        const iniciales = partes.length > 1 ? (partes[0][0] + partes[1][0]).toUpperCase() : nombreUsuario.substring(0, 2).toUpperCase();
        elAvatar.textContent = iniciales;
    }

    // Reloj dinámico en el header
    function actualizarReloj() {
        if (elEmail) {
            elEmail.textContent = new Date().toLocaleTimeString();
        }
    }
    actualizarReloj();
    setInterval(actualizarReloj, 1000);

    // Inicializar badge de correo al cargar la vista
    actualizarBadgeMailGlobal();
    setInterval(actualizarBadgeMailGlobal, 15000); // Refrescar cada 15 segundos
});

   
// ==========================================
// 2- FUNCION PARA LISTAR LOS SERVICIOS
// ==========================================
async function cargarServicios() {
    try {
        const response = await fetch('/servicios');
        const servicios = await response.json();
        
        const contador = document.getElementById('contadorServicios');
        if (contador) contador.textContent = `${servicios.length} servicios`;

        const tbody = document.getElementById('tablaServicios');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if(servicios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-500">No hay servicios cargados.</td></tr>`;
            return;
        }

        servicios.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-800/30 transition-colors";
            
            const imgFile = s.imagen_url ? s.imagen_url : 'buho.png';

            let botonesAccion = `
                <button onclick="abrirModalEditar(${s.id}, '${s.nombre}', ${s.precio}, '${s.duracion || ''}', '${s.imagen_url || ''}')" class="px-3 py-1 bg-blue-500/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer">
                    Editar
                </button>
                <button onclick="eliminarServicio(${s.id})" class="px-3 py-1 bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer">
                    Eliminar
                </button>
            `;

            tr.innerHTML = `
                <td class="py-4 px-6 font-mono text-xs text-slate-500">#${s.id}</td>
                <td class="py-4 px-6">
                    <img src="/img/${imgFile}" alt="Servicio" class="w-10 h-10 object-cover rounded-xl border border-slate-800" onerror="this.src='/buho.png'">
                </td>
                <td class="py-4 px-6 font-semibold text-white">${s.nombre}</td>
                <td class="py-4 px-6 text-emerald-400 font-mono font-bold">$${s.precio}</td>
                <td class="py-4 px-6 text-center space-x-2">
                    ${botonesAccion}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
    }
}

// ==========================================
// 3- FUNCION PARA CREAR UN SERVICIO NUEVO
// ==========================================
const formCrearServicio = document.getElementById('formCrearServicio');
if (formCrearServicio) {
    formCrearServicio.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombreServicio').value;
        const precio = document.getElementById('precioServicio').value;
        const duracion = document.getElementById('duracionServicio').value;
        const imagen_url = document.getElementById('imagenUrlServicio').value;

        try {
            const res = await fetch('/admin/servicios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio, duracion, imagen_url })
            });

            const data = await res.json();

            if (res.ok) {
                alert('¡Éxito! El servicio se ha creado correctamente.');
                formCrearServicio.reset();
                cargarServicios();
            } else {
                alert('Error al guardar: ' + (data.error || 'Ocurrió un problema'));
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    });
}

// ==========================================
// 4- FUNCIONES PARA MODAL Y ACTUALIZAR SERVICIOS
// ==========================================
function abrirModalEditar(id, nombre, precio, duracion, imagen_url) {
    document.getElementById('editId').value = id;
    document.getElementById('editNombre').value = nombre;
    document.getElementById('editPrecio').value = precio;
    document.getElementById('editDuracion').value = duracion;
    document.getElementById('editImagenUrl').value = imagen_url;
    document.getElementById('modalEditar').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modalEditar').classList.add('hidden');
}

const formEditarServicio = document.getElementById('formEditarServicio');
if (formEditarServicio) {
    formEditarServicio.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const nombre = document.getElementById('editNombre').value;
        const precio = document.getElementById('editPrecio').value;
        const duracion = document.getElementById('editDuracion').value;
        const imagen_url = document.getElementById('editImagenUrl').value;

        try {
            const res = await fetch(`/admin/servicios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, precio, duracion, imagen_url })
            });

            const data = await res.json();

            if (res.ok) {
                alert('¡Servicio actualizado correctamente!');
                cerrarModal();
                cargarServicios();
            } else {
                alert('Error al actualizar: ' + (data.error || 'No se pudo procesar'));
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de conexión con el servidor.');
        }
    });
}

// ==========================================
// 5- FUNCION PARA ELIMINAR UN SERVICIO
// ==========================================
async function eliminarServicio(id) {
    if(!confirm('¿Estás seguro de eliminar este servicio del catálogo?')) return;

    try {
        const res = await fetch(`/admin/servicios/${id}`, {
            method: 'DELETE'
        });

        if(res.ok) {
            alert('¡Servicio eliminado con éxito!');
            cargarServicios();
        } else {
            const data = await res.json();
            alert('No se pudo eliminar: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error en DELETE /admin/servicios:', error);
        alert('Error de conexión con el servidor.');
    }
}

// ==========================================
// 6- FUNCIONES PARA GESTIÓN DE USUARIOS Y AUDITORÍA
// ==========================================
async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        if (!response.ok) throw new Error('Error al cargar usuarios');

        const usuarios = await response.json();
        const tbody = document.getElementById('tablaUsuariosBody') || document.getElementById('tablaUsuariosCuerpo');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (usuarios.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500">No hay usuarios registrados.</td></tr>`;
            return;
        }

        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="py-4 px-6 text-white font-medium">${u.nombre || 'Sin nombre'}</td>
                <td class="py-4 px-6 text-slate-400 text-xs">${u.email}</td>
                <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        ${u.rol || 'admin'}
                    </span>
                </td>
                <td class="py-4 px-6 text-center">
                    <button onclick="cambiarRolUsuario(${u.id}, '${u.rol}')" class="px-3 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer">
                        ✏️ Editar
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

async function cargarReporteActividad() {
    try {
        const response = await fetch('/api/admin/reporte-actividad');
        if (!response.ok) throw new Error('Error al cargar el reporte de actividad');

        const registros = await response.json();
        const tbody = document.getElementById('tablaActividadBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (registros.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-500">No hay registros de actividad recientes.</td></tr>`;
            return;
        }

        registros.forEach(r => {
            const fechaFormateada = new Date(r.fecha_hora).toLocaleString();
            const badgeColor = r.tipo_evento === 'SALIDA' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="py-4 px-6 text-white font-medium">${r.empleado}</td>
                <td class="py-4 px-6 text-slate-400 text-xs uppercase">${r.rol}</td>
                <td class="py-4 px-6">
                    <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeColor}">
                        ${r.tipo_evento}
                    </span>
                </td>
                <td class="py-4 px-6 text-slate-300 text-xs">${r.descripcion}</td>
                <td class="py-4 px-6 text-slate-400 font-mono text-xs">${fechaFormateada}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar auditoría:', error);
    }
}

function cargarDatosAdmin() {
    cargarServicios();
    cargarUsuarios();
    cargarReporteActividad();
}

// ==========================================
// 7- FUNCION PARA CERRAR SESIÓN
// ==========================================
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.clear();
        window.location.replace('/');
    }
}

// ==========================================
// 8- GESTIÓN DE NOTIFICACIONES / CAMPANITA DE MAIL
// ==========================================
async function actualizarBadgeMailGlobal() {
    try {
        const response = await fetch('/api/mail/historial');
        if (!response.ok) return;
        const correos = await response.json();
        
        // Depuración: ver qué trae la API
        console.log("Historial de correos recibido:", correos);

        // Filtro: Solo correos para el admin, enviados por terceros, y donde leido NO sea 1, '1' o true
        const noLeidos = correos.filter(c => {
            const dest = (c.destinatario || '').trim().toLowerCase();
            const rem = (c.remitente || '').trim().toLowerCase();
            
            // Si el campo leido es 1, '1' o true, se considera LEÍDO (lo descartamos del contador)
            const esLeido = c.leido === 1 || c.leido === '1' || c.leido === true || c.leido === 'true';

            return dest === CORREO_ADMIN && rem !== CORREO_ADMIN && !esLeido;
        });

        console.log("Correos realmente no leídos según el filtro:", noLeidos);

        const badgeCount = document.getElementById('badgeMailCount');
        if (badgeCount) {
            if (noLeidos.length > 0) {
                badgeCount.textContent = noLeidos.length;
                badgeCount.classList.remove('hidden');
            } else {
                badgeCount.textContent = '0';
                badgeCount.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error("Error al actualizar badge global de mail:", error);
    }
}

// Ejecutar automáticamente al cargar y cada 10 segundos
document.addEventListener("DOMContentLoaded", () => {
    actualizarBadgeMailGlobal();
    setInterval(actualizarBadgeMailGlobal, 10000); 
});

window.actualizarBadgeMailGlobal = actualizarBadgeMailGlobal;



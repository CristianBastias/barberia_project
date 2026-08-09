// public/js/mail.js
const CORREO_ADMIN = 'admin@buho.com';

document.addEventListener("DOMContentLoaded", function () {
    cargarBandejaMail();
    
    // Formulario de envío desde el panel de administración
    const formMail = document.getElementById('formMail');
    if (formMail) {
        formMail.addEventListener('submit', async function (e) {
            e.preventDefault();
            const destinatarioInput = document.getElementById('mailDestinatario') ? document.getElementById('mailDestinatario').value.trim() : '';
            const asunto = document.getElementById('mailAsunto').value.trim();
            const mensaje = document.getElementById('mailMensaje').value.trim();

            try {
                const response = await fetch('/api/mail/enviar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        remitente: CORREO_ADMIN, // Correo unificado de la barbería[cite: 8]
                        asunto, 
                        mensaje, 
                        destinatario: destinatarioInput || 'cliente@externo.com' 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('¡Correo enviado con éxito!');
                    formMail.reset();
                    cargarBandejaMail();
                } else {
                    alert(data.error || 'Ocurrió un error al enviar el correo.');
                }
            } catch (error) {
                console.error("Error al enviar correo:", error);
                alert('Error de conexión con el servidor.');
            }
        });
    }

    // Formulario de contacto público (index.ejs)
    const formPublico = document.getElementById('formContactoPublico');
    if (formPublico) {
        formPublico.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nombre = document.getElementById('nombreContacto').value.trim();
            const email = document.getElementById('emailContacto').value.trim();
            const mensaje = document.getElementById('mensajeContacto').value.trim();
            const btn = document.getElementById('btnEnviarPublico');

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin"></i> Enviando...`;
            }

            try {
                const response = await fetch('/api/mail/enviar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        remitente: email,
                        asunto: `Nuevo mensaje de contacto de: ${nombre}`,
                        mensaje: mensaje,
                        destinatario: CORREO_ADMIN // Destinado al administrador oficial[cite: 8]
                    })
                });

                if (response.ok) {
                    alert('¡Gracias por tu mensaje! Nos pondremos en contacto pronto.');
                    formPublico.reset();
                } else {
                    alert('Hubo un error al enviar el mensaje.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión con el servidor.');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar Mensaje`;
                }
            }
        });
    }
});

async function cargarBandejaMail() {
    const tbody = document.getElementById('tablaBandejaMail');
    
    try {
        const response = await fetch('/api/mail/historial');
        if (response.ok) {
            const correos = await response.json();

            // 1. Contador de no leídos estricto usando el correo único
            const noLeidos = correos.filter(c => {
                return c.destinatario === CORREO_ADMIN && c.remitente !== CORREO_ADMIN && c.leido === 0;
            });
            
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

            // 2. Control de la alerta flotante
            if (correos.length > 0) {
                const ultimoCorreo = correos[0];
                const esRemitenteAdmin = ultimoCorreo.remitente === CORREO_ADMIN;
                
                const ultimoIdActual = ultimoCorreo.id;
                const ultimoIdGuardado = sessionStorage.getItem('ultimoIdMailVisto');

                if (ultimoIdGuardado === null) {
                    sessionStorage.setItem('ultimoIdMailVisto', ultimoIdActual);
                } else if (ultimoIdActual > parseInt(ultimoIdGuardado)) {
                    if (!esRemitenteAdmin) {
                        if (typeof mostrarAlertaNuevoMail === 'function') {
                            mostrarAlertaNuevoMail(ultimoCorreo.asunto);
                        }
                    }
                    sessionStorage.setItem('ultimoIdMailVisto', ultimoIdActual);
                }
            }

            if (!tbody) return;
            tbody.innerHTML = '';

            if (!Array.isArray(correos) || correos.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-500 italic">No hay correos registrados en el historial.</td></tr>`;
                return;
            }

            correos.forEach(item => {
                const tr = document.createElement('tr');
                tr.className = "border-b border-slate-800/50 text-sm text-slate-300 hover:bg-slate-800/30 transition-all duration-150";
    
                const remitente = item.remitente || '---';
                const destinatario = item.destinatario || CORREO_ADMIN;
                const asunto = item.asunto || '---';
                const mensaje = item.mensaje || '';
                
                const esAdminRemitente = remitente === CORREO_ADMIN;
                const esAdminDestinatario = destinatario === CORREO_ADMIN;

                const estiloRemitente = esAdminRemitente ? 'text-blue-400 font-semibold' : 'text-slate-300';
                const estiloDestinatario = esAdminDestinatario ? 'text-blue-400 font-semibold' : 'text-slate-400';

                const botonesAccion = esAdminRemitente 
    ? `
        <button type="button" onclick="eliminarMensajeMail(${item.id})" class="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all border border-red-500/30 cursor-pointer inline-flex items-center justify-center" title="Eliminar Mensaje">
            <i class="fa-solid fa-trash text-xs"></i>
        </button>
      `
    : `
        <button type="button" onclick="verDetalleMail(${item.id}, '${asunto.replace(/'/g, "\\'")}', \`${mensaje.replace(/`/g, '\\`')}\`)" class="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all border border-blue-500/30 cursor-pointer inline-flex items-center justify-center" title="Ver Detalles">
            <i class="fa-solid fa-eye text-xs"></i>
        </button>
        <button type="button" onclick="eliminarMensajeMail(${item.id})" class="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all border border-red-500/30 cursor-pointer inline-flex items-center justify-center" title="Eliminar Mensaje">
            <i class="fa-solid fa-trash text-xs"></i>
        </button>
      `;

                let fechaFormateada = '---';
                if (item.fecha) {
                    const fechaObj = new Date(item.fecha);
                    if (!isNaN(fechaObj.getTime())) {
                        fechaFormateada = fechaObj.toLocaleString();
                    }
                }

                tr.innerHTML = `
                    <td class="py-4 px-4 font-mono text-slate-500 text-xs">#${item.id}</td> <!-- Nueva celda ID -->
                    <td class="py-4 px-4 ${estiloRemitente}">${remitente}</td>
                    <td class="py-4 px-4 ${estiloDestinatario}">${destinatario}</td>
                    <td class="py-4 px-4 text-slate-300">${asunto}</td>
                    <td class="py-4 px-4 text-xs text-slate-400 font-mono">${fechaFormateada}</td>
                    <td class="py-4 px-4 text-right whitespace-nowrap space-x-2">
            ${botonesAccion}
        </td>
    `;
    tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Error al actualizar la bandeja:", error);
    }
}

async function verDetalleMail(id, asunto, mensaje) {
    alert(`--- DETALLE DEL CORREO ---\n\nAsunto: ${asunto}\n\nMensaje:\n${mensaje}`);
    
    // Forzar limpieza visual inmediata del contador en la interfaz
    const badgeCount = document.getElementById('badgeMailCount');
    if (badgeCount) {
        badgeCount.textContent = '0';
        badgeCount.classList.add('hidden');
    }

    try {
        await fetch(`/api/mail/leer/${id}`, { method: 'PUT' });
        cargarBandejaMail();
        if (typeof window.actualizarBadgeMailGlobal === 'function') {
            window.actualizarBadgeMailGlobal();
        }
    } catch (error) {
        console.error("Error al marcar como leído:", error);
    }
}
async function eliminarMensajeMail(id) {
    if (!confirm('¿Estás seguro de eliminar este correo del buzón?')) return;
    try {
        const response = await fetch(`/api/mail/${id}`, { method: 'DELETE' });
        if (response.ok) {
            cargarBandejaMail();
        } else {
            alert('No se pudo eliminar el correo.');
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

function mostrarAlertaNuevoMail(asunto) {
    console.log("Nueva notificación de mail:", asunto);
    const alertaDiv = document.getElementById('alertaMailFlotante');
    if (alertaDiv) {
        alertaDiv.classList.remove('hidden');
        alertaDiv.querySelector('.mensaje').textContent = `Nuevo mensaje: ${asunto}`;
    }
}

// Función que debes llamar cuando el usuario abre o hace clic en un correo para leerlo
async function marcarCorreoComoLeidoEnFrontend(idCorreo) {
    try {
        // 1. Llamar a la ruta del backend que actualiza el estado en la base de datos
        const response = await fetch(`/api/mail/leer/${idCorreo}`, {
            method: 'PUT', // o PATCH según lo tengas definido en tus rutas
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            // 2. Forzar la actualización inmediata de la campanita globalmente
            if (typeof window.actualizarBadgeMailGlobal === 'function') {
                window.actualizarBadgeMailGlobal();
            }
        }
    } catch (error) {
        console.error("Error al marcar el correo como leído:", error);
    }
}
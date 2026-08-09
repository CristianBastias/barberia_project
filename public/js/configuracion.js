document.addEventListener('DOMContentLoaded', () => {
    // Inicializar lógica de configuración si el formulario existe
    const formConfig = document.getElementById('formConfiguracion');
    if (formConfig) {
        formConfig.addEventListener('submit', guardarConfiguracion);
    }
});

async function guardarConfiguracion(e) {
    e.preventDefault();
    // Lógica para guardar ajustes globales del sistema
    alert('Configuración guardada correctamente.');
}
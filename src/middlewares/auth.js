function verificarAdmin(req, res, next) {
    // Si manejas sesiones de usuario (por ejemplo, con express-session)
    if (req.session && req.session.user && req.session.user.rol === 'admin') {
        return next();
    }

    // O si prefieres mantener compatibilidad temporal con headers/query pero validando que sea admin de verdad:
    const rol = req.headers['x-user-rol'] || req.query.rol || (req.session && req.session.user ? req.session.user.rol : null);

    if (rol === 'admin') {
        return next();
    }
    
    // Si es una petición de API, responde con JSON; si es de vista, redirige al login
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }

    return res.redirect('/login');
}

function verificarEmpleadoOAdmin(req, res, next) {
    const rol = req.headers['x-user-rol'] || req.query.rol || (req.session && req.session.user ? req.session.user.rol : null);

    if (rol === 'admin' || rol === 'empleado') {
        return next();
    }

    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }

    return res.redirect('/login');
}

module.exports = { 
    esAdmin: verificarAdmin, 
    esEmpleadoOAdmin: verificarEmpleadoOAdmin 
};
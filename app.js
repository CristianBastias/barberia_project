// ==========================================
// 0. IMPORTACIÓN DE MÓDULOS
// ==========================================
require('dotenv').config();
const express = require('express');
const session = require('express-session'); // Módulo de sesiones agregado
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const db = require('./src/config/db'); 
const auditoriaRoutes = require('./src/routes/auditoriaRoutes');
const citasRoutes = require('./src/routes/citasRoutes');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE MOTOR DE VISTAS (EJS Y LAYOUTS)
// ==========================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.static('public'));

app.set('layout', 'layouts/public');

// ==========================================
// 2. MIDDLEWARES ESENCIALES Y DE SESIÓN
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Sesiones para manejar el logout y seguridad
app.use(session({
    secret: process.env.SESSION_SECRET || 'buhobarber_secreto_seguro_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambiar a true si configuras HTTPS estricto
}));

// ==========================================
// 3. ARCHIVOS ESTÁTICOS Y VISTAS DEL PORTAL
// ==========================================
app.get('/', async (req, res) => {
    try {
        const [servicios] = await db.query('SELECT * FROM servicios');
        res.render('portal/index', { 
            servicios: servicios,
            title: 'Inicio | Búho Barber Studio' 
        });
    } catch (error) {
        console.error('Error al cargar servicios en el portal:', error);
        res.status(500).send('Error al cargar la página principal');
    }
});

app.get('/reservar', (req, res) => {
    res.render('portal/reservar');
});

app.get('/indumentaria', (req, res) => {
    res.render('portal/indumentaria', { title: 'Catálogo de Indumentaria | Búho' });
});

// RUTA PÚBLICA SEGURA (Evita conflictos con el panel de administración)
app.get('/catalogo', async (req, res) => {
    try {
        const [servicios] = await db.query('SELECT * FROM servicios');
        
        res.render('portal/catalogo', { 
            title: 'Catálogo de Servicios | Búho',
            servicios: servicios 
        });
    } catch (error) {
        res.status(500).send('Error al cargar el catálogo');
    }
});

// ==========================================
// 4. RUTAS DE CITAS Y AUTENTICACIÓN
// ==========================================
app.use('/', citasRoutes);

app.get('/login', (req, res) => {
    res.render('admin/login', { layout: false });
});

app.get('/login.html', (req, res) => {
    res.redirect('/login');
});

// ==========================================
// RUTA DE CIERRE DE SESIÓN (LOGOUT)
// ==========================================
app.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error al destruir la sesión:', err);
            }
            res.clearCookie('connect.sid'); // Limpia la cookie de sesión del navegador
            return res.redirect('/login');
        });
    } else {
        // Si no hay sesión activa, redirige al login igual
        return res.redirect('/login');
    }
});

app.post('/login', async (req, res) => {
    try {
        console.log('--- INTENTO DE LOGIN ---');
        console.log('req.body recibido:', req.body);

        const { usuario, password, email } = req.body;
        const identificador = usuario || email;

        if (!identificador || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios.' });
        }

        const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [identificador.trim()]);
        const user = rows[0];

        if (!user || user.password !== password.trim()) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        return res.status(200).json({ success: true, redirectUrl: '/admin' });

    } catch (err) {
        console.error('Error en el login:', err);
        return res.status(500).json({ error: 'Error interno en el servidor.' });
    }
});

// ==========================================
// 7. IMPORTAR Y REGISTRAR DEMÁS RUTAS
// ==========================================
const servicioRoutes = require('./src/routes/servicioRoutes');
const barberoRoutes = require('./src/routes/barberoRoutes');
const citaRoutes = require('./src/routes/citasRoutes');
const estadisticaRoutes = require('./src/routes/estadisticaRoutes');
const adminViewRoutes = require('./src/routes/adminViewRoutes');
const clienteRoutes = require('./src/routes/clienteRoutes');
const configuracionRoutes = require('./src/routes/configuracionRoutes');
const indumentariaRoutes = require('./src/routes/indumentariaRoutes');
const mailRoutes = require('./src/routes/mailRoutes'); 

app.use('/', servicioRoutes);
app.use('/', barberoRoutes);
app.use('/', citaRoutes);
app.use('/', estadisticaRoutes);
app.use('/', adminViewRoutes);
app.use(clienteRoutes);
app.use(configuracionRoutes);
app.use('/', auditoriaRoutes);
app.use('/', indumentariaRoutes);
app.use('/api/mail', mailRoutes);

// ==========================================
// 8. INICIAR EL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
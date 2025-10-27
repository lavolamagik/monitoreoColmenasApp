require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// 1. Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    credentials: true, 
    allowedHeaders: 'Content-Type,Authorization', // Headers permitidos (CRUCIAL para JWT)
};

// Importar rutas
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/dataRoutes');
const testRoutes = require('./routes/testRoutes');
const colmenaRoutes = require('./routes/colmenaRoutes');
const adminRoutes = require('./routes/adminRoutes'); // <-- Usado por /api/admin

// ===============================================
// 2. MIDDLEWARES (Aplicar ANTES de montar CUALQUIER RUTA)
// ===============================================

// Aplicar CORS a TODO el servidor (debe ser el primero)
app.use(cors(corsOptions)); 

// Habilitar la lectura de JSON en el cuerpo de la petición
app.use(express.json());

// ===============================================
// 3. DEFINICIÓN DE RUTAS (Aplicar DESPUÉS de los Middlewares)
// ===============================================

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/colmenas', colmenaRoutes);
app.use('/api/admin', adminRoutes); // <-- Ahora CORS y JSON están aplicados aquí


// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de monitoreo de colmenas corriendo.');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
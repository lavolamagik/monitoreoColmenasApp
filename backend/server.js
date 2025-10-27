require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Importar rutas
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/dataRoutes');
const testRoutes = require('./routes/testRoutes');
const colmenaRoutes = require('./routes/colmenaRoutes');


// Middlewares
app.use(cors()); 
app.use(express.json());

// --- Definición de Rutas ---
app.use('/api/auth', authRoutes);

app.use('/api/test', testRoutes); // 🎯 Montamos la ruta de prueba

app.use('/api/data', dataRoutes);

app.use('/api/colmenas', colmenaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de monitoreo de colmenas corriendo.');
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
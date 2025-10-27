// backend/routes/testRoutes.js

const express = require('express');
const router = express.Router();
// El repositorio debe tener la función testInfluxConnection
const sensorRepo = require('../repositories/sensorRepository'); 

// @route   GET /api/test/influx
// @desc    Prueba la conexión y la consulta al bucket de InfluxDB
// @access  Público (Solo para fines de prueba temporal)
router.get('/influx', async (req, res) => {
    try {
        // Ejecuta la función de prueba que consulta InfluxDB
        const data = await sensorRepo.testInfluxConnection();
        
        if (data.length > 0) {
            return res.json({
                status: 'OK',
                message: `Conexión exitosa. Se encontraron ${data.length} filas de datos en el bucket ${sensorRepo.bucket}.`,
                data: data
            });
        } else {
            return res.json({
                status: 'CONECTADO',
                message: 'Conexión exitosa, pero el bucket está vacío o no hay datos recientes.',
                data: []
            });
        }
    } catch (error) {
        console.error('Error en ruta de prueba:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Falló la conexión o la consulta a InfluxDB. Revisa tu token, URL y ORG en el .env.',
            error: error.message // Devolvemos el mensaje de error para ayudar en la depuración
        });
    }
});

module.exports = router;
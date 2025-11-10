// backend/routes/dataRoutes.js (VERSIÓN CORREGIDA PARA LEER EL RANGO DE TIEMPO)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const sensorRepo = require('../repositories/sensorRepository'); 
const colmenaRepo = require('../repositories/colmenaRepository');

// 🚨 ID DEL PROTOTIPO SIN FILTRO (USO TEMPORAL)
const PROTOTYPE_HIVE_CODE = 'PROTOTIPO_001'; 


// =======================================================
// @route   GET /api/data/colmena/:hiveCode
// @desc    Obtiene datos de InfluxDB para una colmena específica.
// @access  Private
// =======================================================
router.get('/colmena/:hiveCode', protect, async (req, res) => {
    const { hiveCode } = req.params;
    // 💡 CORRECCIÓN CLAVE: Leemos el parámetro 'range' de la query string
    const { range } = req.query; 
    
    // Bandera para el fallback
    const isPrototype = hiveCode === PROTOTYPE_HIVE_CODE;

    try {
        // 1. Obtener los sensores activos desde PostgreSQL
        const activeSensors = isPrototype 
            ? ['temperatura_BMP280', 'humidity', 'peso', 'gx', 'gy', 'gz']
            : await colmenaRepo.getActiveSensorsByHiveCode(hiveCode);

        if (activeSensors.length === 0) {
            return res.status(404).json({ message: 'Colmena encontrada, pero no tiene sensores activos registrados.' });
        }
        
        // 2. Obtener los datos de InfluxDB, PASANDO EL RANGO OBTENIDO
        // La función del repositorio usa el 'range' como cuarto argumento
        const historyData = await sensorRepo.getHiveSensorHistory(hiveCode, activeSensors, isPrototype, range); 
           
        // Los datos más recientes no usan el rango de historial, solo el rango fijo de -30d/last() del repositorio
        const latestData = await sensorRepo.getLatestHiveData(hiveCode, activeSensors, isPrototype); 
        
        res.json({
            hive_code: hiveCode,
            active_sensors: activeSensors,
            latest: latestData,
            history: historyData,
        });

    } catch (error) {
        if (error.message.includes("no encontrada")) {
             return res.status(404).json({ message: error.message });
        }
        console.error('Error al obtener datos de InfluxDB:', error);
        res.status(500).json({ message: 'Error interno: Fallo al consultar datos de sensores.' });
    }
});

module.exports = router;
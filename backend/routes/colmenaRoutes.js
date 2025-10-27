// backend/routes/colmenaRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // Solo necesitamos autenticación
const colmenaRepo = require('../repositories/colmenaRepository');

// =======================================================
// @route   GET /api/colmenas/sensors
// @desc    Obtiene la lista maestra de sensores disponibles
// @access  Private (para apicultores)
// =======================================================
router.get('/sensors', protect, (req, res) => {
    // Retornamos el modelo de sensores que definimos en el repositorio
    res.json(colmenaRepo.SENSOR_MODELS); 
});


// =======================================================
// @route   POST /api/colmenas
// @desc    Registra una nueva colmena con sus sensores
// @access  Private (para apicultores)
// =======================================================
router.post('/', protect, async (req, res) => {
    const { hive_code, description, selectedSensors } = req.body;
    const userId = req.user.id; // Obtenido del token JWT por el middleware 'protect'

    if (!hive_code || !selectedSensors || selectedSensors.length === 0) {
        return res.status(400).json({ message: 'El código de monitor y la selección de sensores son obligatorios.' });
    }
    
    try {
        const newColmena = await colmenaRepo.createColmena(
            hive_code, 
            description, 
            selectedSensors, 
            userId
        );

        res.status(201).json({ 
            message: `Colmena ${hive_code} registrada exitosamente.`,
            colmena: newColmena
        });

    } catch (error) {
        console.error('Error al registrar colmena:', error);
        // Devolvemos el mensaje de error personalizado del repositorio (ej: "ya existe")
        res.status(400).json({ 
            message: error.message || 'Error al procesar el registro de la colmena.' 
        });
    }
});


// =======================================================
// @route   GET /api/colmenas
// @desc    Obtiene las colmenas del apicultor logueado
// @access  Private (para apicultores)
// =======================================================
router.get('/', protect, async (req, res) => {
    const userId = req.user.id;
    try {
        const colmenas = await colmenaRepo.getColmenasByUserId(userId);
        res.json(colmenas);
    } catch (error) {
        console.error('Error al obtener colmenas:', error);
        res.status(500).json({ message: 'Error interno del servidor al listar colmenas.' });
    }
});

module.exports = router;
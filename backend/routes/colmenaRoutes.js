// backend/routes/colmenaRoutes.js (CÓDIGO FINAL CON RUTA GET :hiveCode)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const colmenaRepo = require('../repositories/colmenaRepository');
const db = require('../config/db'); // Necesario para la ruta DELETE

// =======================================================
// @route   GET /api/colmenas/sensors
// ... (Ruta GET sensors) ...
// =======================================================
router.get('/sensors', protect, (req, res) => {
    // Retornamos el modelo de sensores que definimos en el repositorio
    res.json(colmenaRepo.SENSOR_MODELS); 
});


// =======================================================
// @route   POST /api/colmenas
// ... (Ruta POST /) ...
// =======================================================
router.post('/', protect, async (req, res) => {
    const { hive_code, description, selectedSensors } = req.body;
    const userId = req.user.id; 

    if (!hive_code || !selectedSensors || selectedSensors.length === 0) {
        return res.status(400).json({ message: 'El código de monitor y la selección de sensores son obligatorios.' });
    }
    
    try {
        const newColmena = await colmenaRepo.createColmena(
            hive_code, description, selectedSensors, userId
        );
        res.status(201).json({ message: `Colmena ${hive_code} registrada exitosamente.`, colmena: newColmena });

    } catch (error) {
        console.error('Error al registrar colmena:', error);
        res.status(400).json({ message: error.message || 'Error al procesar el registro de la colmena.' });
    }
});

// =======================================================
// @route   GET /api/colmenas/:hiveCode <-- 🚨 RUTA AÑADIDA PARA DETALLES
// @desc    Obtiene los detalles completos de una colmena (incluye sensores)
// @access  Private (Debe ser el dueño o superadmin)
// =======================================================
router.get('/:hiveCode', protect, async (req, res) => {
    const { hiveCode } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;

    try {
        // Asumimos que esta función devuelve los detalles Y los selectedSensors
        const hive = await colmenaRepo.getHiveDetailsByCode(hiveCode);

        if (!hive) {
            return res.status(404).json({ message: 'Colmena no encontrada.' });
        }
        
        // Control de Acceso: Permitir si es Admin O si es el dueño
        if (userRole !== 'superadmin' && hive.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para ver esta colmena.' });
        }
        
        // No enviamos el user_id de vuelta al frontend
        delete hive.user_id; 

        res.status(200).json(hive);

    } catch (error) {
        console.error(`Error al obtener detalles de colmena ${hiveCode}:`, error);
        res.status(500).json({ message: error.message || 'Error interno del servidor.' });
    }
});


// =======================================================
// @route   PUT /api/colmenas/:hiveCode  <-- 🚨 RUTA DE EDICIÓN
// @desc    Actualiza la descripción y sensores de una colmena
// @access  Private (Debe ser el dueño o superadmin)
// =======================================================
router.put('/:hiveCode', protect, async (req, res) => {
    const { hiveCode } = req.params;
    const { description, selectedSensors } = req.body;
    const userId = req.user.id;
    const userRole = req.user.rol;
    
    if (!description || !selectedSensors) {
         return res.status(400).json({ message: 'Descripción y sensores son requeridos.' });
    }

    try {
        // 1. Obtener la colmena y verificar la propiedad/permisos
        const result = await db.query('SELECT user_id FROM colmenas WHERE hive_code = $1', [hiveCode]);
        const hive = result.rows[0];

        if (!hive) { return res.status(404).json({ message: 'Colmena no encontrada.' }); }
        if (userRole !== 'superadmin' && hive.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para editar esta colmena.' });
        }

        // 2. Llamar al repositorio para la lógica de edición
        await colmenaRepo.updateColmena(hiveCode, description, selectedSensors); 

        res.status(200).json({ message: 'Colmena actualizada con éxito.' });

    } catch (error) {
        console.error(`Error al actualizar colmena ${hiveCode}:`, error);
        res.status(500).json({ message: error.message || 'Error interno del servidor al actualizar.' });
    }
});


// =======================================================
// @route   DELETE /api/colmenas/:hiveCode
// @desc    Elimina una colmena
// @access  Private (Debe ser el dueño o superadmin)
// =======================================================
router.delete('/:hiveCode', protect, async (req, res) => {
    const { hiveCode } = req.params;
    const userId = req.user.id;
    const userRole = req.user.rol;

    try {
        // 1. Obtener la colmena y verificar la propiedad/permisos
        const result = await db.query('SELECT user_id FROM colmenas WHERE hive_code = $1', [hiveCode]);
        const hive = result.rows[0];

        if (!hive) {
            return res.status(404).json({ message: 'Colmena no encontrada.' });
        }

        // 2. Control de Acceso: Permitir si es Admin O si es el dueño
        if (userRole !== 'superadmin' && hive.user_id.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Acceso denegado. No eres el propietario de esta colmena.' });
        }

        // 3. Eliminar la colmena (CASCADE eliminará los sensores asociados)
        await colmenaRepo.deleteColmena(hiveCode); // 🚨 Usamos la función de repositorio
        
        res.status(200).json({ message: 'Colmena eliminada con éxito.' });

    } catch (error) {
        console.error('Error al eliminar colmena:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor al eliminar.' });
    }
});


// =======================================================
// @route   GET /api/colmenas
// @desc    Obtiene las colmenas del apicultor logueado
// @access  Private (para apicultores)
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
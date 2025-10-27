// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, roleMiddleware } = require('../middleware/authMiddleware');
const adminRepo = require('../repositories/adminRepository');

// Middleware para asegurar que SOLO el superadmin puede acceder a estas rutas
const adminProtect = [protect, roleMiddleware(['superadmin'])];

// =======================================================
// @route   GET /api/admin/dashboard-data
// @desc    Obtiene todos los datos de gestión (usuarios y colmenas)
// @access  Private (Rol: superadmin)
// =======================================================
router.get('/dashboard-data', adminProtect, async (req, res) => {
    try {
        const users = await adminRepo.getAllUsersWithHiveCount();
        const hives = await adminRepo.getAllManagedHives();

        // Calculamos los KPIs rápidos
        const totalUsers = users.length;
        const totalHives = hives.length;
        const totalAdmins = users.filter(u => u.rol === 'superadmin').length;

        res.json({
            users: users,
            hives: hives,
            kpis: {
                totalUsers,
                totalHives,
                totalApicultores: totalUsers - totalAdmins,
            }
        });

    } catch (error) {
        console.error('Error al obtener datos de administración:', error);
        res.status(500).json({ message: 'Error interno al cargar datos administrativos.' });
    }
});

router.put('/users/:id', adminProtect, async (req, res) => {
    const userId = req.params.id;
    const { name, email, rol } = req.body;
    
    // Validación básica
    if (!name || !email || !rol) {
        return res.status(400).json({ message: 'Todos los campos (nombre, email, rol) son obligatorios.' });
    }

    try {
        await adminRepo.updateUser(userId, name, email, rol);
        
        res.status(200).json({ message: 'Usuario actualizado con éxito.' });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: error.message || 'Error interno del servidor al actualizar el usuario.' });
    }
});

module.exports = router;
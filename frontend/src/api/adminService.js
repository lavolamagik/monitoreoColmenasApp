// frontend/src/api/adminService.js
import { apiFetch } from './config';

/**
 * Obtiene todos los datos consolidados para el dashboard de administración.
 * GET /api/admin/dashboard-data
 */
export const getAdminDashboardData = () => {
    return apiFetch('/admin/dashboard-data', {
        method: 'GET',
    });
};

export const updateUserData = (userId, userData) => {
    return apiFetch(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};
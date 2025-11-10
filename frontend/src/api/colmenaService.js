// src/api/colmenaService.js (CÓDIGO COMPLETO Y CORREGIDO)
import { apiFetch } from './config'; 

/**
 * Llama al endpoint para obtener la lista maestra de sensores disponibles.
 * GET /api/colmenas/sensors
 */
export const getAvailableSensors = () => {
    return apiFetch('/colmenas/sensors', {
        method: 'GET',
    });
};

/**
 * Llama al endpoint para registrar una nueva colmena y sus sensores.
 * POST /api/colmenas
 */
export const createNewColmena = (hiveCode, description, selectedSensors) => {
    return apiFetch('/colmenas', {
        method: 'POST',
        body: JSON.stringify({
            hive_code: hiveCode,
            description: description,
            selectedSensors: selectedSensors 
        }),
    });
};

/**
 * 🚨 NUEVA FUNCIÓN: Actualiza los detalles de una colmena existente.
 * PUT /api/colmenas/:hiveCode
 */
export const updateHiveDetails = (hiveCode, formData) => {
    return apiFetch(`/colmenas/${hiveCode}`, {
        method: 'PUT',
        body: JSON.stringify({
            description: formData.description,
            selectedSensors: formData.selectedSensors,
        }),
    });
};

/**
 * Obtiene la lista de colmenas del usuario logueado.
 * GET /api/colmenas
 */
export const getColmenasByUserId = () => {
    return apiFetch('/colmenas', {
        method: 'GET',
    });
};

export const getSensorModel = () => {
    // Es un alias para la función de la API de obtener sensores disponibles
    return getAvailableSensors();
};

/**
 * Elimina una colmena por su hiveCode.
 * DELETE /api/colmenas/:hiveCode
 */
export const deleteColmena = (hiveCode) => {
    // apiFetch ya adjunta el token
    return apiFetch(`/colmenas/${hiveCode}`, {
        method: 'DELETE',
    });
};

export const getHiveDetailsByCode = (hiveCode) => {
    return apiFetch(`/colmenas/${hiveCode}`, {
        method: 'GET',
    });
};
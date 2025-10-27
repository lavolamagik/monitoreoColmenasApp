// src/api/dataService.js
import { apiFetch } from './config';

/**
 * Obtiene el detalle de datos (latest y history) de una colmena específica.
 * GET /api/data/colmena/:hiveCode
 */
export const getColmenaData = (hiveCode) => {
    return apiFetch(`/data/colmena/${hiveCode}`, {
        method: 'GET',
    });
};
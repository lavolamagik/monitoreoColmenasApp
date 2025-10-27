// src/api/authService.js
import { apiFetch } from './config';

/**
 * Llama al endpoint de login.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string, user: {rol: string, name: string}}>}
 */
export const loginUser = (email, password) => {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

/**
 * Llama al endpoint de registro.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<any>}
 */
export const registerUser = (name, email, password) => {
    // Definimos un rol por defecto para los usuarios que se registran
    const role = 'apicultor'; 
    
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
    });
};
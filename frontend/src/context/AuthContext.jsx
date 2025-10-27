import React, { createContext, useState, useCallback, useEffect } from 'react';

// 1. Crear el Contexto
const AuthContext = createContext({
    isAuthenticated: false,
    user: null, // { role: 'apicultor' | 'superadmin', email: string, name: string }
    login: () => {},
    logout: () => {},
});

// 2. Crear el Proveedor (Provider)
export const AuthProvider = ({ children }) => {
    // Intentar cargar el estado inicial del usuario desde localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('authToken');
    });

    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    // Función de Login: se llama después de un POST exitoso al backend
    const login = useCallback(({ token, role, email, name }) => {
        localStorage.setItem('authToken', token);
        const userData = { role, email, name };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    // Función de Logout
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // 3. Devolver el Contexto
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
// Asegúrate de que esta ruta a tu contexto sea correcta:
import AuthContext from '../../context/AuthContext'; 
// Asegúrate de que esta librería esté instalada: npm install jwt-decode
import { jwtDecode } from 'jwt-decode'; 

// Este componente protege las rutas y verifica el rol
function ProtectedRoute({ allowedRoles }) {
    // Nota: Si aún no tienes AuthContext, necesitarás simular el usuario y isAuthenticated
    // Por ahora, asumimos que existe el contexto:
    const { isAuthenticated, user, login } = useContext(AuthContext); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        
        if (token && !isAuthenticated) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp > currentTime) {
                    // Cargar el usuario desde el token JWT (el campo 'rol' es CRUCIAL)
                    login({ 
                        token, 
                        role: decodedToken.rol, 
                        email: decodedToken.email,
                        name: decodedToken.name
                    });
                } else {
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                console.error("Error al decodificar token:", error);
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, [isAuthenticated, login]);

    // 1. Mostrar estado de carga
    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Verificando credenciales...</div>;
    }

    // 2. Verificar autenticación
    if (!isAuthenticated || !user) {
        // No hay token o es inválido: envía al Login
        return <Navigate to="/" replace />;
    }

    // 3. Verificar roles
    const userRole = user.role;
    const isAuthorized = allowedRoles.includes(userRole);

    if (isAuthorized) {
        // Si el usuario tiene el rol permitido: Muestra el componente hijo (AdminDashboard)
        // ESTO REEMPLAZA TU CÓDIGO VIEJO Y MUESTRA LA RUTA HIJA
        return <Outlet />; 
    } else {
        // No tiene los permisos: envía a No Autorizado
        return <Navigate to="/unauthorized" replace />;
    }
}

export default ProtectedRoute;

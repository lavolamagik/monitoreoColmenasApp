import React, { useState, useContext } from 'react'; 
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; // 👈 RUTA REAL: Asegúrate de que esta ruta es correcta

// Definimos el ancho del sidebar para usarlo en el layout del dashboard
export const SIDEBAR_WIDTH = 250; 
const THEME_COLOR = '#D97706';

// Definición de estilos temáticos
const styles = {
    sidebar: (isVisible) => ({ 
        // Lógica para que el sidebar no ocupe espacio y se deslice
        position: 'fixed', 
        top: 0,
        left: 0,
        bottom: 0,
        width: `${SIDEBAR_WIDTH}px`,
        minHeight: '100vh',
        backgroundColor: THEME_COLOR, 
        color: 'white',
        padding: '20px',
        boxShadow: '4px 0 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        zIndex: 1000, 
        borderRadius: '0 8px 8px 0', // Bordes redondeados sutiles

        transition: 'transform 0.3s ease, visibility 0.3s ease',
        transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
        visibility: isVisible ? 'visible' : 'hidden', 
    }),
    header: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '40px',
        textAlign: 'center',
        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuItem: {
        padding: '12px 15px',
        margin: '5px 0',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
    },
    menuItemHover: {
        backgroundColor: '#F6AD55', // Naranja/Miel más claro
    },
    menuItemSelected: {
        backgroundColor: 'white',
        color: THEME_COLOR, // Texto del color principal
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
    },
    footer: {
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.3)',
        paddingTop: '15px',
    },
    logoutButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: 'transparent',
        border: '1px solid white',
        color: 'white',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s, color 0.2s',
    },
    logoutButtonHover: {
        backgroundColor: 'white',
        color: THEME_COLOR,
    },
};

// Mapa de iconos simples
const iconMap = {
    'admin-main': '🛠️',
    'dashboard': '📊',
    'hives': '🐝',
    'alerts': '🚨',
    'reports': '📄',
};

/**
 * Componente Sidebar principal.
 * @param {boolean} isVisible - Controla si el sidebar está visible (para el efecto de deslizamiento).
 * @param {string} selectedMenu - La clave del menú seleccionado actualmente.
 * @param {function} setSelectedMenu - Función para actualizar la clave del menú seleccionado.
 */
function Sidebar({ isVisible, selectedMenu, setSelectedMenu }) { 
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); 

    const menuItems = [
        { name: 'Dashboard Apicultor', key: 'dashboard', path: '/app/dashboard', role: 'apicultor' },
        { name: 'Mis Colmenas', key: 'hives', path: '/app/hives', role: 'apicultor' },
        { name: 'Alertas', key: 'alerts', path: '/app/alerts', role: 'apicultor' },
        { name: 'Reportes', key: 'reports', path: '/app/reports', role: 'apicultor' },
        { name: 'Admin Principal', key: 'admin-main', path: '/admin/dashboard', role: 'superadmin' },
    ];
    
    const [hoverKey, setHoverKey] = useState(null);
    const [logoutHover, setLogoutHover] = useState(false);

    const handleNavigation = (path, key) => {
        setSelectedMenu(key);
        navigate(path);
    };

    const handleLogout = () => {
        // Ejecuta la función de logout proporcionada por el contexto
        logout(); 
        navigate('/login'); // O la ruta que uses para el inicio de sesión
    };

    return (
        <div style={styles.sidebar(isVisible)}>
            <div style={styles.header}>
                <span role="img" aria-label="Abeja" style={{ marginRight: '10px' }}>
                    🐝
                </span>
                Admin Hive
            </div>
            
            <nav>
                {menuItems.map((item) => {
                    // Determina el estilo base, hover y selección
                    const isSelected = selectedMenu === item.key;
                    const isHovering = hoverKey === item.key;
                    
                    let itemStyle = {
                        ...styles.menuItem,
                        color: isSelected ? THEME_COLOR : 'white',
                        backgroundColor: isSelected 
                                        ? styles.menuItemSelected.backgroundColor 
                                        : isHovering 
                                            ? styles.menuItemHover.backgroundColor 
                                            : 'transparent',
                    };

                    return (
                        <div
                            key={item.key}
                            style={itemStyle}
                            onClick={() => handleNavigation(item.path, item.key)}
                            onMouseEnter={() => setHoverKey(item.key)}
                            onMouseLeave={() => setHoverKey(null)}
                        >
                            <span style={{ marginRight: '10px' }}>{iconMap[item.key] || '🔗'}</span>
                            {item.name}
                        </div>
                    );
                })}
            </nav>

            <div style={styles.footer}>
                <button
                    style={{ ...styles.logoutButton, ...(logoutHover ? styles.logoutButtonHover : {}) }}
                    onClick={handleLogout}
                    onMouseEnter={() => setLogoutHover(true)}
                    onMouseLeave={() => setLogoutHover(false)}
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}

export default Sidebar;

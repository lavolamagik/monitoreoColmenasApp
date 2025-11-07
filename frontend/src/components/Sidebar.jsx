// src/components/Sidebar.jsx (CÓDIGO COMPLETO Y CORREGIDO LISTO PARA COPIAR/PEGAR)
import React, { useState, useContext } from 'react'; 
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; 

// 🐝 IMPORTACIÓN DE ICONOS PROFESIONALES (Lucide React - Recomendado)
// Requiere: npm install lucide-react
import { 
    BarChart, ListChecks, Bell, FileText, UserCog, 
    LogOut, Settings, Home, X 
} from 'lucide-react'; 

// Si Lucide no está instalado, usamos estos como fallback:
import { 
    FaChartBar, FaThList, FaBell, FaFileAlt, FaUserShield, 
    FaSignOutAlt, FaCog, FaHome 
} from 'react-icons/fa'; 

// --- Constantes de Diseño (Paleta Extendida) ---
export const SIDEBAR_WIDTH = 250; 
const PRIMARY_HONEY = '#D97706';     
const ACCENT_ORANGE = '#F6AD55';     
const TEXT_DARK = '#374151'; 

// Definiciones de iconos (Lucide primero, Fa como fallback)
const iconMap = {
    'admin-main': UserCog || FaUserShield, 
    'dashboard': BarChart || FaChartBar, 
    'hives': ListChecks || FaThList,
    'alerts': Bell || FaBell, 
    'reports': FileText || FaFileAlt,
    'default': Home || FaHome,
};
const SettingsIcon = Settings || FaCog;
const LogoutIcon = LogOut || FaSignOutAlt;
const CloseIcon = X; // Icono de cierre más limpio, solo si se usa Lucide

const styles = {
    sidebar: (isVisible) => ({ 
        position: 'fixed', top: 0, left: 0, bottom: 0, width: `${SIDEBAR_WIDTH}px`,
        minHeight: '100vh', backgroundColor: PRIMARY_HONEY, color: 'white',
        padding: '20px', boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)', // Sombra más fuerte
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif',
        zIndex: 1000, transition: 'transform 0.3s ease', 
        transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
    }),
    header: {
        fontSize: '1.6rem', // Ligeramente más grande
        letterSpacing: '0.05em', // Estilo moderno
        fontWeight: 'extrabold', marginBottom: '30px', textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '15px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    },
    titleContainer: { display: 'flex', alignItems: 'center', gap: '8px' }, // Mejor espaciado
    closeButtonContainer: {
        // Contenedor invisible para clic fácil en móvil
        padding: '5px',
        borderRadius: '50%',
        transition: 'background-color 0.2s',
    },
    closeIcon: (isHovering) => ({ 
        color: isHovering ? ACCENT_ORANGE : 'white', 
        cursor: 'pointer',
        fontSize: '24px', // Tamaño consistente
        transition: 'color 0.2s',
        lineHeight: '1', 
    }),
    menuItem: {
        padding: '12px 15px', margin: '5px 0', borderRadius: '8px', // Bordes más suaves
        cursor: 'pointer', transition: 'all 0.2s ease', 
        display: 'flex', alignItems: 'center',
        fontSize: '1rem',
    },
    menuItemHover: { backgroundColor: ACCENT_ORANGE, transform: 'translateX(3px)' },
    menuItemSelected: { 
        backgroundColor: 'white', 
        color: PRIMARY_HONEY, 
        fontWeight: 'bold', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra al elemento seleccionado
        borderLeft: `5px solid ${ACCENT_ORANGE}`, // Línea de acento
        paddingLeft: '10px', // Compensar el border-left
    },
    footer: {
        marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        paddingTop: '20px', marginBottom: '20px' 
    },
    logoutButton: {
        width: '100%', padding: '12px', backgroundColor: 'transparent',
        border: '1px solid white', color: 'white', borderRadius: '8px',
        cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s, color 0.2s',
    },
    logoutButtonHover: {
        backgroundColor: 'white', color: PRIMARY_HONEY, border: `1px solid white`,
    },
};


function Sidebar({ isVisible, selectedMenu, setSelectedMenu, toggleSidebar }) { 
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); 

    const menuItems = [
        { name: 'Dashboard Apicultor', key: 'dashboard', path: '/app/dashboard', role: 'apicultor' },
        { name: 'Mis Colmenas', key: 'hives', path: '/app/dashboard', role: 'apicultor' }, 
        { name: 'Alertas', key: 'alerts', path: '/app/alerts', role: 'apicultor' },
        { name: 'Reportes', key: 'reports', path: '/app/reports', role: 'apicultor' },
        { name: 'Admin Principal', key: 'admin-main', path: '/admin/dashboard', role: 'superadmin' },
    ];
    
    const [hoverKey, setHoverKey] = useState(null);
    const [logoutHover, setLogoutHover] = useState(false);
    const [closeHover, setCloseHover] = useState(false); 

    const handleNavigation = (path, key) => {
        setSelectedMenu(key);
        navigate(path);
    };

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    return (
        <div style={styles.sidebar(isVisible)}> 
            <div style={styles.header}>
                <div style={styles.titleContainer}>
                    <SettingsIcon size={24} style={{ color: ACCENT_ORANGE }} />
                    BeeHive Central
                </div>
                
                {/* BOTÓN DE CIERRE PROFESIONAL (Lucide X o &times; como fallback) */}
                <div 
                    onClick={toggleSidebar} 
                    title="Cerrar menú"
                    style={{
                        ...styles.closeButtonContainer,
                        backgroundColor: closeHover ? 'rgba(255,255,255,0.1)' : 'transparent'
                    }}
                    onMouseEnter={() => setCloseHover(true)}
                    onMouseLeave={() => setCloseHover(false)}
                >
                    {/* Renderiza el icono X de Lucide si está disponible, sino usa el carácter &times; */}
                    {CloseIcon ? <CloseIcon size={24} style={styles.closeIcon(closeHover)} /> : <span style={styles.closeIcon(closeHover)}>&times;</span>}
                </div>
            </div>
            
            <nav>
                {menuItems.map((item) => {
                    const isSelected = selectedMenu === item.key;
                    const isHovering = hoverKey === item.key;
                    
                    let itemStyle = {
                        ...styles.menuItem,
                        ...(isSelected ? styles.menuItemSelected : (isHovering ? styles.menuItemHover : {})),
                        color: isSelected ? PRIMARY_HONEY : 'white',
                        // Asegurar que el color del texto de los no seleccionados es blanco cuando no hay hover
                        // Esto se manejará por la propiedad 'color' en styles.menuItem
                    };

                    // Obtener el componente de icono
                    const IconComponent = iconMap[item.key] || iconMap['default'];

                    return (
                        <div
                            key={item.key}
                            style={itemStyle}
                            onClick={() => handleNavigation(item.path, item.key)}
                            onMouseEnter={() => setHoverKey(item.key)}
                            onMouseLeave={() => setHoverKey(null)}
                        >
                            <span style={{ marginRight: '10px' }}>
                                {/* 💡 Renderiza el icono como componente, color basado en selección */}
                                <IconComponent 
                                    size={20} 
                                    color={isSelected ? PRIMARY_HONEY : (isHovering ? TEXT_DARK : 'white')} 
                                />
                            </span>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <LogoutIcon 
                            size={20} 
                            color={logoutHover ? PRIMARY_HONEY : 'white'} 
                        />
                        Cerrar Sesión
                    </div>
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
// src/components/Sidebar.jsx (CÓDIGO FINAL CON LOGO A LA IZQUIERDA Y TÍTULO "BeeHive Monitor")
import React, { useState, useContext } from 'react'; 
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx'; 

// 🐝 IMPORTACIÓN DE ICONOS PROFESIONALES (Lucide React - Recomendado)
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
const TEXT_MUTED = '#6B7280'; 

// Definiciones de iconos (Lucide primero, Fa como fallback)
const iconMap = {
    'admin-main': UserCog || FaUserShield, 
    'dashboard': BarChart || FaChartBar, 
    'hives': ListChecks || FaThList,
    'alerts': Bell || FaBell, 
    'reports': FileText || FaFileAlt,
    'default': Home || FaHome,
};
const LogoIcon = ListChecks || FaThList; 
const LogoutIcon = LogOut || FaSignOutAlt;
const CloseIcon = X; 

const styles = {
    sidebar: (isVisible) => ({ 
        position: 'fixed', top: 0, left: 0, bottom: 0, width: `${SIDEBAR_WIDTH}px`,
        minHeight: '100vh', backgroundColor: PRIMARY_HONEY, color: 'white',
        padding: '20px', boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)', 
        display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif',
        zIndex: 1000, transition: 'transform 0.3s ease', 
        transform: isVisible ? 'translateX(0)' : 'translateX(-100%)',
    }),
    header: {
        fontSize: '1.4rem', 
        letterSpacing: '0.05em', 
        fontWeight: 'extrabold', marginBottom: '30px', textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '15px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
    },
    titleContainer: { 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1px', 
        // Eliminamos flexGrow y los márgenes automáticos para alineación a la izquierda
    }, 
    // ESTILO PARA EL LOGO PROPIO
    logoImage: {
        width: 'auto', 
        height: '40px', // Tamaño sugerido
        // Eliminamos los márgenes automáticos para que se quede a la izquierda
    },
    closeButtonContainer: {
        padding: '5px',
        borderRadius: '50%',
        transition: 'background-color 0.2s',
    },
    closeIcon: (isHovering) => ({ 
        color: isHovering ? ACCENT_ORANGE : 'white', 
        cursor: 'pointer',
        fontSize: '24px', 
        transition: 'color 0.2s',
        lineHeight: '1', 
    }),
    menuItem: {
        padding: '12px 15px', margin: '5px 0', borderRadius: '8px', 
        cursor: 'pointer', transition: 'all 0.2s ease', 
        display: 'flex', alignItems: 'center',
        fontSize: '1rem',
    },
    menuItemHover: { backgroundColor: ACCENT_ORANGE, transform: 'translateX(3px)' },
    menuItemSelected: { 
        backgroundColor: 'white', 
        color: PRIMARY_HONEY, 
        fontWeight: 'bold', 
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
        borderLeft: `5px solid ${ACCENT_ORANGE}`, 
        paddingLeft: '10px', 
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
    const { logout, user } = useContext(AuthContext); 
    const userRole = user?.role; 

    const baseMenuItems = [
        { name: 'Dashboard Apicultor', key: 'dashboard', path: '/app/dashboard', requiredRole: 'apicultor' },
        { name: 'Mis Colmenas', key: 'hives', path: '/app/mis-colmenas', requiredRole: 'apicultor' }, 
        { name: 'Admin Principal', key: 'admin-main', path: '/admin/dashboard', requiredRole: 'superadmin' },
    ];
    
    const filteredMenuItems = baseMenuItems.filter(item => {
        if (!userRole) return false; 
        
        const required = item.requiredRole;
        
        if (userRole === 'superadmin') {
            return true;
        }

        if (userRole === 'apicultor' && required === 'apicultor') {
            return true;
        }

        return false;
    });


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
                    {/* LOGO A LA IZQUIERDA */}
                    <img 
                        src="/beedata_logo.png" 
                        alt="BeeData Logo" 
                        style={styles.logoImage} 
                    />
                    {/* TEXTO A LA DERECHA DEL LOGO */}
                    <span style={{ fontWeight: 'bold', marginLeft: '-25px' }}>
                        BeeHive Monitor
                    </span>
                </div>
                
                {/* BOTÓN DE CIERRE PROFESIONAL */}
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
                    {CloseIcon ? <CloseIcon size={24} style={styles.closeIcon(closeHover)} /> : <span style={styles.closeIcon(closeHover)}>&times;</span>}
                </div>
            </div>
            
            <nav>
                {filteredMenuItems.map((item) => {
                    const isSelected = selectedMenu === item.key;
                    const isHovering = hoverKey === item.key;
                    
                    let itemStyle = {
                        ...styles.menuItem,
                        ...(isSelected ? styles.menuItemSelected : (isHovering ? styles.menuItemHover : {})),
                        color: isSelected ? PRIMARY_HONEY : 'white',
                    };

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
// src/pages/ApicultorDashboard.jsx (CÓDIGO FINAL CON BOTÓN DE CIERRE PROFESIONAL)
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 

import ColmenaForm from '../components/ColmenaForm'; 
import { getColmenasByUserId } from '../api/colmenaService'; 

// 🐝 NUEVAS IMPORTACIONES DE ICONOS (Lucide React - Asegúrate de tenerlo instalado)
import { Home, Thermometer, Droplets, AlertTriangle, Menu, PlusCircle, Maximize, X } from 'lucide-react'; 
// Si Lucide no está instalado, se usan estos como fallback:
import { FaHome, FaThermometerHalf, FaTint, FaExclamationTriangle } from 'react-icons/fa'; 

// --- Constantes de Diseño y Espaciado (PALETA EXTENDIDA) ---
const PRIMARY_HONEY = '#D97706';     
const ACCENT_ORANGE = '#F6AD55';     
const LIGHT_HONEY_BG = '#FFF7ED';     
const BACKGROUND_LIGHT = '#FAFAFA';  
const TEXT_DARK = '#374151';         
const TEXT_MUTED = '#6B7280';        
const BORDER_LIGHT = '#E5E7EB';      

// Colores de Estado (para alertas y feedback)
const STATUS_DANGER = '#EF4444';     
const STATUS_INFO = '#3B82F6';       
const STATUS_SUCCESS = '#059669';    

// Dimensiones y Breakpoints
const MOBILE_BREAKPOINT = 768; 
const SIDEBAR_WIDTH = 250; 
const CONTENT_MARGIN = 30; 

// --- Estilos Base ---
const dashboardStyles = {
    mainContainer: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: BACKGROUND_LIGHT, 
        fontFamily: 'Inter, sans-serif'
    },
    mainContent: { 
        flexGrow: 1, 
        padding: `${CONTENT_MARGIN}px`, 
        overflowY: 'auto',
        transition: 'margin-left 0.3s ease',
    },
    title: { 
        fontSize: '2.5rem', 
        color: TEXT_DARK, 
        marginBottom: '10px', 
        fontWeight: 'extrabold' 
    },
    subtitle: {
        fontSize: '1rem',
        color: TEXT_MUTED, 
        marginBottom: '30px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)', 
        border: `1px solid ${BORDER_LIGHT}`, 
        borderLeft: `5px solid ${ACCENT_ORANGE}`, 
        transition: 'all 0.3s ease', 
    },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '25px', 
        marginBottom: '40px' 
    },
    colmenaCard: { 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: `1px solid ${BORDER_LIGHT}`, 
        borderLeft: `5px solid ${PRIMARY_HONEY}`, 
        cursor: 'pointer',
        transition: 'all 0.2s ease', 
    },
    colmenaCode: {
        fontSize: '1.5rem', 
        color: PRIMARY_HONEY, 
        fontWeight: 'extrabold',
        marginBottom: '5px'
    },
    kpiIconPlaceholder: {
        marginBottom: '10px', 
    },
    actionButton: { 
        padding: '12px 25px', 
        backgroundColor: PRIMARY_HONEY, 
        color: 'white', 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: '600',
        fontSize: '1rem',
        transition: 'background-color 0.2s ease, transform 0.1s', 
    },
    sectionTitle: { 
        fontSize: '1.8rem', 
        color: TEXT_DARK, 
        fontWeight: 'bold',
        marginBottom: '0', 
        paddingBottom: '0',
    },
    formModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, overflowY: 'auto', padding: '20px 0', }, 
    formContent: {
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        position: 'relative', 
        maxWidth: '650px', 
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
        maxHeight: '90vh', 
        overflowY: 'auto', 
    },
    // 🚨 ESTILOS DEL BOTÓN DE CIERRE PROFESIONAL
    closeButtonWrapper: {
        position: 'absolute', 
        top: '15px', 
        right: '15px', 
        zIndex: 10,
        width: '35px', 
        height: '35px', 
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    closeIcon: { 
        fontSize: '24px', 
        border: 'none', 
        background: 'none', 
        padding: 0,
        lineHeight: 1,
        color: TEXT_MUTED, 
        transition: 'color 0.2s',
    },
    // ...
    toggleButton: {
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1001,
        backgroundColor: PRIMARY_HONEY, 
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '45px', 
        height: '45px',
        fontSize: '1.2rem',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s',
    },
};

// Se reemplazan los FaIcons por los de Lucide si están disponibles
const mockStats = (count) => [
    { title: "Total Colmenas Propias", value: count, icon: Home || FaHome, statusColor: STATUS_INFO },             
    { title: "Temperatura Promedio", value: 'N/A', icon: Thermometer || FaThermometerHalf, statusColor: ACCENT_ORANGE },  
    { title: "Nivel de Humedad", value: 'N/A', icon: Droplets || FaTint, statusColor: STATUS_SUCCESS },                   
    { title: "Colmenas en Alerta", value: '0', icon: AlertTriangle || FaExclamationTriangle, statusColor: STATUS_DANGER },    
];

const StatCard = ({ title, value, icon: IconComponent, statusColor }) => (
    <div 
        style={{...dashboardStyles.card, borderLeft: `5px solid ${statusColor}`}} 
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = dashboardStyles.card.boxShadow; }}
    >
        <div style={{...dashboardStyles.kpiIconPlaceholder, color: statusColor, marginBottom: '15px'}}>
            <IconComponent size={32} />
        </div> 
        <div style={{color: TEXT_MUTED, marginBottom: '5px', fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: '600'}}>{title}</div>
        <div style={{fontSize: '2.5rem', fontWeight: 'extrabold', color: TEXT_DARK}}>{value}</div> 
    </div>
);



function ApicultorDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 

    const [colmenas, setColmenas] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true); 
    const [dataError, setDataError] = useState(''); 
    const [showForm, setShowForm] = useState(false); 
    
    const [selectedMenu, setSelectedMenu] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);
    
    // El estado de hover del botón de cierre no es necesario aquí, se maneja en CloseModalButton

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Lógica para detectar el tamaño de la pantalla
    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            setIsMobile(isCurrentlyMobile);
            
            if (!isCurrentlyMobile && !isSidebarOpen) {
                setIsSidebarOpen(true);
            } 
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarOpen]); 
    
    
    // LÓGICA DE CARGA DE COLMENAS
    const fetchColmenas = useCallback(async () => {
        setIsLoadingData(true);
        setDataError('');
        try {
            const data = await getColmenasByUserId();
            setColmenas(data);
        } catch (err) {
            setDataError(err.message || 'Error al cargar la lista de colmenas.');
        } finally {
            setIsLoadingData(false);
        }
    }, []);

    useEffect(() => {
        fetchColmenas();
    }, [fetchColmenas]);
    
    // FUNCIONES DE MANEJO
    const handleColmenaRegistered = () => {
        setShowForm(false); 
        fetchColmenas(); 
    };

    const handleColmenaClick = (hiveCode) => {
        navigate(`/app/colmena/${hiveCode}`); 
    };

    if (user?.rol === 'superadmin') { 
        navigate('/admin/dashboard', { replace: true });
        return null; 
    }
    
    // CORRECCIÓN DE MARGEN
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : CONTENT_MARGIN, 
    };
    
    const ToggleIconComponent = Menu; 


    return (
        <div style={dashboardStyles.mainContainer}> 
            
            {/* 🚨 BOTÓN DE APERTURA FIJO: Se muestra solo si el Sidebar está cerrado */}
            {!isSidebarOpen && (
                 <button
                    style={dashboardStyles.toggleButton} 
                    onClick={toggleSidebar}
                    title={'Mostrar menú'}
                 >
                    <ToggleIconComponent size={24} />
                 </button>
            )}

            <Sidebar 
                isVisible={isSidebarOpen} 
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
                toggleSidebar={toggleSidebar} 
            />

            <main style={dynamicMainContentStyle}>
                <h1 style={dashboardStyles.title}>
                    Panel de Control de Apicultor
                </h1>
                <p style={dashboardStyles.subtitle}>
                    Bienvenido, 
                    <span style={{ 
                        color: PRIMARY_HONEY, 
                        fontWeight: 'bold', 
                        margin: '0 4px' 
                    }}>
                        {user?.name || 'Apicultor'}
                    </span>
                    . Gestiona la salud y el monitoreo de tus colmenas.
                </p>

                {/* -------------------------------------------------------- */}
                {/* ESTADÍSTICAS RÁPIDAS (KPIs) */}
                {/* -------------------------------------------------------- */}
                <h2 style={dashboardStyles.sectionTitle}>Resumen de Salud</h2>
                <div style={{...dashboardStyles.grid, borderBottom: `1px solid ${BORDER_LIGHT}`, paddingBottom: '20px'}}>
                    {mockStats(colmenas.length).map((stat, index) => (
                        <StatCard 
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            statusColor={stat.statusColor} 
                        />
                    ))}
                </div>

                {/* -------------------------------------------------------- */}
                {/* LISTA DE COLMENAS Y BOTÓN DE REGISTRO */}
                {/* -------------------------------------------------------- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px', marginBottom: '20px' }}>
                    <h2 style={dashboardStyles.sectionTitle}>
                        Monitores Registrados ({colmenas.length})
                    </h2>
                    
                    {/* Botón de acción con hover y transición */}
                    <button 
                        style={dashboardStyles.actionButton} 
                        onClick={() => setShowForm(true)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT_ORANGE; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HONEY; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <PlusCircle size={18} /> 
                            Registrar Nuevo Monitor
                        </span>
                    </button>
                </div>
                
                {dataError && <p style={{ color: STATUS_DANGER, marginBottom: '15px' }}>🚨 **Error:** {dataError}</p>} 
                
                {isLoadingData ? (
                    <p style={{color: TEXT_MUTED}}>Cargando lista de colmenas...</p> 
                ) : colmenas.length === 0 ? (
                    <div style={{...dashboardStyles.card, borderLeft: `5px solid ${STATUS_INFO}`}}> 
                        <p style={{ color: TEXT_MUTED, margin: 0 }}>
                            **Información:** Aún no tienes monitores registrados. Usa el botón **"+ Registrar Nuevo Monitor"** para comenzar.
                        </p>
                    </div>
                ) : (
                    <div style={dashboardStyles.grid}>
                        {colmenas.map((colmena) => (
                            <div 
                                key={colmena.id} 
                                onClick={() => handleColmenaClick(colmena.hive_code)}
                                style={dashboardStyles.colmenaCard}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                            >
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <p style={dashboardStyles.colmenaCode}>{colmena.hive_code}</p>
                                    <Maximize size={20} color={TEXT_MUTED} />
                                </div>
                                <p style={{ color: TEXT_MUTED, marginBottom: '10px' }}> 
                                    {colmena.description || 'Colmena sin descripción.'}
                                </p>
                                <small style={{ color: TEXT_MUTED }}> 
                                    Registrada: {new Date(colmena.created_at).toLocaleDateString()}
                                </small>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal para el formulario de registro */}
            {showForm && (
                <div style={dashboardStyles.formModal}>
                    <div style={dashboardStyles.formContent}>
                        {/* 🚨 REEMPLAZO DEL BOTÓN DE CIERRE BÁSICO */}
                        <CloseModalButton onClose={() => setShowForm(false)} /> 
                        <ColmenaForm onColmenaRegistered={handleColmenaRegistered} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------
// NUEVO COMPONENTE AUXILIAR DEL BOTÓN DE CIERRE (Mantenido al final del archivo)
// ----------------------------------------------------
const CloseModalButton = ({ onClose }) => {
    // 🚨 Usamos X directamente de las importaciones de Lucide
    const [isHovered, setIsHovered] = useState(false);
    
    return (
        <div 
            onClick={onClose}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                ...dashboardStyles.closeButtonWrapper,
                backgroundColor: isHovered ? BORDER_LIGHT : 'transparent', 
            }}
        >
            <button 
                style={{
                    ...dashboardStyles.closeIcon,
                    color: isHovered ? PRIMARY_HONEY : TEXT_MUTED 
                }} 
                title="Cerrar formulario"
            >
                {X ? <X size={24} /> : <span>&times;</span>}
            </button>
        </div>
    );
};


export default ApicultorDashboard;
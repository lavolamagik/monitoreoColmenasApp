import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 

import ColmenaForm from '../components/ColmenaForm'; 
import { getColmenasByUserId } from '../api/colmenaService'; 

// --- Constantes de Diseño y Espaciado ---
const THEME_COLOR = '#D97706'; // Miel Oscura
const ACCENT_COLOR = '#F6AD55'; // Naranja/Miel
const BG_COLOR = '#FAFAFA'; 
const MOBILE_BREAKPOINT = 768; 
const SIDEBAR_WIDTH = 250; 
const CONTENT_MARGIN = 30; // 👈 NUEVO: Espacio entre Sidebar y Contenido

// --- Estilos Base ---
const dashboardStyles = {
    mainContainer: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: BG_COLOR, 
        fontFamily: 'Inter, sans-serif'
    },
    mainContent: { 
        flexGrow: 1, 
        // 🚨 CORRECCIÓN: Quitamos el paddingLeft aquí para que sea dinámico
        padding: `${CONTENT_MARGIN}px`, 
        overflowY: 'auto',
        transition: 'margin-left 0.3s ease',
    },
    title: { 
        fontSize: '2.5rem', 
        color: THEME_COLOR, 
        marginBottom: '10px', 
        fontWeight: 'extrabold' 
    },
    subtitle: {
        fontSize: '1rem',
        color: '#6B7280',
        marginBottom: '30px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '25px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        borderLeft: `5px solid ${ACCENT_COLOR}`,
    },
    grid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
    },
    colmenaCard: { 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        borderLeft: `5px solid ${THEME_COLOR}`,
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
             transform: 'translateY(-2px)',
             boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
        }
    },
    colmenaCode: {
        fontSize: '1.4rem',
        color: THEME_COLOR,
        fontWeight: 'bold',
        marginBottom: '5px'
    },
    // NUEVO: Estilo para el botón de acción principal
    actionButton: { 
        padding: '10px 20px', 
        backgroundColor: THEME_COLOR, // Botón con el color primario
        color: 'white', 
        border: 'none', 
        borderRadius: '6px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        fontSize: '1rem',
        transition: 'background-color 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    // Estilos para el Modal (se mantienen)
    formModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px 0', },
    formContent: {backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '8px', 
        position: 'relative', 
        maxWidth: '600px', 
        width: '90%',
        maxHeight: '90vh', 
        overflowY: 'auto', },
    closeButton: { position: 'absolute', top: '10px', right: '15px', fontSize: '24px', cursor: 'pointer', border: 'none', background: 'none' },
    toggleButton: {
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1001,
        backgroundColor: THEME_COLOR,
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        fontSize: '1.5rem',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

// Datos para las estadísticas rápidas (Actualizados para reflejar el conteo real)
const mockStats = (count) => [
    { title: "Total Colmenas Propias", value: count, icon: '🏠' },
    { title: "Temperatura Promedio", value: 'N/A', icon: '🌡️' },
    { title: "Nivel de Humedad", value: 'N/A', icon: '💧' },
    { title: "Colmenas en Alerta", value: '0', icon: '🚨' },
];

const StatCard = ({ title, value, icon }) => (
    <div style={dashboardStyles.card}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{icon}</div>
        <div style={{...dashboardStyles.subtitle, marginBottom: '5px'}}>{title}</div>
        <div style={{fontSize: '2rem', fontWeight: 'bold', color: THEME_COLOR}}>{value}</div>
    </div>
);


function ApicultorDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 

    const [colmenas, setColmenas] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true); 
    const [dataError, setDataError] = useState(''); 
    const [showForm, setShowForm] = useState(false); 
    
    // Lógica original de Sidebar
    const [selectedMenu, setSelectedMenu] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

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
            else if (isCurrentlyMobile && isSidebarOpen) {
                setIsSidebarOpen(false);
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

    // --------------------------------------------------------------------------
    // RENDERIZADO Y ESTILOS DINÁMICOS
    // --------------------------------------------------------------------------
    
    if (user?.rol === 'superadmin') { 
        navigate('/admin/dashboard', { replace: true });
        return null; 
    }
    
    // 🚨 CORRECCIÓN DE MARGEN: Añadimos SIDEBAR_WIDTH + CONTENT_MARGIN como margen si el sidebar está abierto
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : '0', 
    };
    
    const toggleIcon = '☰'; 


    return (
        <div style={dashboardStyles.mainContainer}> 
            
            <button
                style={dashboardStyles.toggleButton}
                onClick={toggleSidebar}
                title={isSidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            >
                {toggleIcon}
            </button>
            
            <Sidebar 
                isVisible={isSidebarOpen} 
                selectedMenu={selectedMenu}
                setSelectedMenu={setSelectedMenu}
            />

            <main style={dynamicMainContentStyle}>
                <h1 style={dashboardStyles.title}>
                    Dashboard de Apicultor
                </h1>
                <p style={dashboardStyles.subtitle}>
                    Hola, 
                    <span style={{ 
                        color: THEME_COLOR, 
                        fontWeight: 'bold', 
                        margin: '0 4px' 
                    }}>
                        {user?.name || 'Apicultor'}
                    </span>
                    . Gestiona la salud de tus colmenas.
                </p>

                {/* -------------------------------------------------------- */}
                {/* ESTADÍSTICAS RÁPIDAS */}
                {/* -------------------------------------------------------- */}
                <div style={dashboardStyles.grid}>
                    {mockStats(colmenas.length).map((stat, index) => (
                        <StatCard 
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                        />
                    ))}
                </div>

                {/* -------------------------------------------------------- */}
                {/* LISTA DE COLMENAS Y BOTÓN DE REGISTRO */}
                {/* -------------------------------------------------------- */}
                
                {/* Cabecera para la lista con el botón alineado a la derecha */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px' }}>
                    <h2 style={{ fontSize: '1.8rem', color: THEME_COLOR, fontWeight: 'bold' }}>
                        Tus Monitores ({colmenas.length})
                    </h2>
                    
                    {/* Botón de acción con hover */}
                    <button 
                        style={dashboardStyles.actionButton} 
                        onClick={() => setShowForm(true)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                    >
                        + Registrar Nuevo Monitor
                    </button>
                </div>
                
                {dataError && <p style={{ color: 'red', marginBottom: '15px' }}>🚨 {dataError}</p>}
                
                {isLoadingData ? (
                    <p>Cargando lista de colmenas...</p>
                ) : colmenas.length === 0 ? (
                    <div style={{...dashboardStyles.card, borderLeft: `5px solid ${ACCENT_COLOR}`}}>
                        <p style={{ color: '#6B7280' }}>
                            Aún no tienes monitores registrados. Usa el botón **"+ Registrar Nuevo Monitor"** para comenzar.
                        </p>
                    </div>
                ) : (
                    <div style={dashboardStyles.grid}>
                        {colmenas.map((colmena) => (
                            <div 
                                key={colmena.id} 
                                onClick={() => handleColmenaClick(colmena.hive_code)}
                                style={dashboardStyles.colmenaCard}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)'}
                            >
                                <p style={dashboardStyles.colmenaCode}>{colmena.hive_code}</p>
                                <p style={{ color: '#4B5563', marginBottom: '10px' }}>
                                    {colmena.description || 'Colmena sin descripción.'}
                                </p>
                                <small style={{ color: '#9CA3AF' }}>
                                    Registrada: {new Date(colmena.created_at).toLocaleDateString()}
                                </small>
                            </div>
                        ))}
                    </div>
                )}


                {/* -------------------------------------------------------- */}
                {/* SECCIÓN "ACCIONES RÁPIDAS" ELIMINADA */}
                {/* -------------------------------------------------------- */}
            </main>

            {/* Modal para el formulario de registro */}
            {showForm && (
                <div style={dashboardStyles.formModal}>
                    <div style={dashboardStyles.formContent}>
                        <button 
                            style={dashboardStyles.closeButton} 
                            onClick={() => setShowForm(false)}
                        >
                            &times;
                        </button>
                        <ColmenaForm onColmenaRegistered={handleColmenaRegistered} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default ApicultorDashboard;
// src/pages/ColmenaDetailPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 

// IMPORTACIONES DE SERVICIOS
import { getColmenaData } from '../api/dataService'; // <-- Nuevo: Llama a /api/data/colmena/:hiveCode
import { getSensorModel } from '../api/colmenaService'; // <-- Nuevo: Para obtener el nombre y la unidad del sensor

// --- Constantes de Diseño y Responsividad (Se mantienen) ---
const SIDEBAR_WIDTH = 240; 
const CONTENT_MARGIN = 30;
const MOBILE_BREAKPOINT = 768; 
const THEME_COLOR = '#D97706'; 
const ACCENT_COLOR = '#F6AD55'; 
const BG_COLOR = '#FAFAFA'; 

// 


// Estilos centrales (simplificados)
const styles = {
    header: { fontSize: '2.5rem', color: THEME_COLOR, borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '30px', fontWeight: 'extrabold' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '40px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', },
    value: { fontSize: '2rem', fontWeight: 'bold', color: THEME_COLOR, marginTop: '8px' },
    label: { fontSize: '0.9rem', color: '#6B7280' },
    chartArea: { height: '300px', backgroundColor: '#F0F0F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAA', marginTop: '15px' },
    // Añadimos colores para mapear sensores
    sensorColors: {
        'temperatura_BMP280': '#E74C3C', 'humidity': '#3498DB', 'peso': '#16A085', 'pressure': '#F1C40F', 'default': '#95A5A6'
    }
};

const dashboardStyles = {
    // ... tus estilos de layout
    mainContainer: { 
        display: 'flex', 
        minHeight: '100vh', 
        backgroundColor: BG_COLOR, 
        fontFamily: 'Inter, sans-serif',
        width: '100%',
    },
    mainContent: { 
        flexGrow: 1, 
        padding: '30px', 
        overflowY: 'auto',
        transition: 'margin-left 0.3s ease',
    },
    toggleButton: (isSidebarOpen, isMobile) => ({
        position: 'fixed', top: '20px', 
        left: '20px',
        zIndex: 1001, backgroundColor: THEME_COLOR, color: 'white', border: 'none', borderRadius: '50%',
        width: '40px', height: '40px', fontSize: '1.5rem', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    })
};


function ColmenaDetailPage() {
    // Ahora usamos 'hiveCode' que es el nombre correcto que definimos en las rutas de App.jsx
    const { hiveCode } = useParams(); 
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 
    
    // Almacena la data cruda de la API, incluyendo latest, history y active_sensors
    const [data, setData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sensorModelMap, setSensorModelMap] = useState({}); // Mapa para obtener nombres/unidades rápidamente
    
    // Lógica de Sidebar
    const [selectedMenu, setSelectedMenu] = useState('hives'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Lógica de Responsividad (Tu useEffect original)
    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            if (isCurrentlyMobile !== isMobile) {
                setIsMobile(isCurrentlyMobile);
                setIsSidebarOpen(!isCurrentlyMobile);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]); 


    // --------------------------------------------------------------------------
    // LÓGICA DE CARGA DE DATOS REALES Y MODELO DE SENSORES
    // --------------------------------------------------------------------------
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 1. Cargar el modelo de sensores para mapear keys a nombres/unidades
            const sensorModels = await getSensorModel();
            const modelMap = sensorModels.reduce((acc, sensor) => {
                acc[sensor.key] = sensor;
                return acc;
            }, {});
            setSensorModelMap(modelMap);


            // 2. Llamar al servicio de datos con el código de colmena DINÁMICO
            // Esto llama a GET /api/data/colmena/:hiveCode
            const result = await getColmenaData(hiveCode); 
            
            setData(result); 

        } catch (err) {
            console.error("Error fetching data:", err);
            // Mostrar errores del backend (ej: "Colmena no encontrada" o "Fallo al consultar InfluxDB")
            setError(err.message || 'Fallo en la conexión o autenticación de datos.');
        } finally {
            setLoading(false);
        }
    }, [hiveCode]); 

    useEffect(() => {
        if (user) { 
            fetchAllData();
        } else {
            // Si ProtectedRoute falla y el usuario no está en el contexto, forzar la navegación
            setLoading(false);
            setError("No se pudieron cargar los datos del usuario. Vuelva a iniciar sesión.");
        }
    }, [user, fetchAllData]); 

    // --- Estilos Dinámicos de Layout ---
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : '0', 
    };
    const toggleButtonStyles = dashboardStyles.toggleButton(isSidebarOpen, isMobile);

    
    // --------------------------------------------------------------------------
    // RENDERIZADO DE PÁGINA (Carga, Error, Éxito)
    // --------------------------------------------------------------------------

    if (loading) {
        return (
            <div style={dashboardStyles.mainContainer}>
                <main style={dynamicMainContentStyle}><div style={{paddingTop: '50px', paddingLeft: '30px'}}>Cargando datos de la Colmena {hiveCode}...</div></main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={dashboardStyles.mainContainer}>
                <main style={dynamicMainContentStyle}>
                    <div style={{paddingTop: '50px', paddingLeft: '30px', color: 'red', border: '1px solid #F00', padding: '15px', marginTop: '20px'}}>
                        <h1 style={{color: 'red'}}>🚨 Error al cargar datos 🚨</h1>
                        <p>{error}</p>
                        <button 
                            onClick={() => navigate('/app/dashboard')} 
                            style={{ marginTop: '15px', padding: '10px 15px', backgroundColor: ACCENT_COLOR, color: THEME_COLOR, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Volver al Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }
    
    // Crear el array final de datos recientes con el modelo
    const latestDataArray = data ? Object.keys(data.latest).map(key => ({
        key,
        value: data.latest[key].value.toFixed(2),
        time: data.latest[key].time,
        // Usamos el sensor model para obtener el nombre y la unidad
        ...sensorModelMap[key] 
    })) : [];

    return (
        <div style={dashboardStyles.mainContainer}>
            
            <Sidebar isVisible={isSidebarOpen} selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
            <button style={toggleButtonStyles} onClick={toggleSidebar} title="Alternar menú">☰</button>

            <main style={dynamicMainContentStyle}>
                <div style={{ paddingTop: '50px', paddingLeft: '30px', paddingRight: '30px' }}>
                    
                    <button 
                        onClick={() => navigate('/app/dashboard')} 
                        style={{ marginBottom: '20px', padding: '10px 15px', backgroundColor: ACCENT_COLOR, color: THEME_COLOR, border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        ← Volver al Dashboard
                    </button>
                    
                    <h1 style={styles.header}>Monitoreo Colmena: {hiveCode}</h1>
                    <p style={{marginBottom: '30px', color: '#666'}}>
                        Visualizando datos en tiempo real para {data.active_sensors.length} sensores activos.
                    </p>
                    
                    <h2>Datos Recientes</h2>
                    <div style={styles.cardGrid}>
                        {latestDataArray.length > 0 ? latestDataArray.map((sensor) => (
                            <div 
                                key={sensor.key} 
                                // Color de borde dinámico o de fallback
                                style={{ ...styles.card, borderLeft: `5px solid ${styles.sensorColors[sensor.key] || styles.sensorColors.default}` }}
                            >
                                <div style={styles.label}>{sensor.name || sensor.key.toUpperCase()}</div>
                                <div style={styles.value}>
                                    {sensor.value} {sensor.unit}
                                </div>
                                <small style={{ color: '#9CA3AF' }}>
                                    Última lectura: {new Date(sensor.time).toLocaleTimeString()}
                                </small>
                            </div>
                        )) : (
                            <p>No hay datos recientes disponibles para esta colmena. Asegúrate de que el monitor esté encendido y enviando datos.</p>
                        )}
                    </div>

                    <h2>Gráfico Histórico (Últimas 6h)</h2>
                    <div style={styles.card}>
                        <h3 style={{ fontSize: '1.2rem', color: THEME_COLOR }}>Historial de Datos</h3>
                        <div style={styles.chartArea}>
                            [Aquí va la librería de gráficos (Chart.js / Recharts)]
                            <p>Gráfico de {data?.history?.length || 0} puntos de datos históricos listo para renderizar.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ColmenaDetailPage;
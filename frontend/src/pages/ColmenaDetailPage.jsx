// src/pages/ColmenaDetailPage.jsx (CÓDIGO COMPLETO PROFESIONAL)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 

import { getColmenaData } from '../api/dataService'; 
import { getSensorModel } from '../api/colmenaService'; 

// 🐝 IMPORTACIÓN DE ICONOS PROFESIONALES (Lucide React)
// Requiere: npm install lucide-react
import { 
    Thermometer, Droplets, Scale, Gauge, Zap, // Iconos para sensores
    Home, ChevronLeft, AlertTriangle, Loader, Menu 
} from 'lucide-react'; 

// =======================================================
// BLOQUE DE CONSTANTES DE DISEÑO
// =======================================================
const SIDEBAR_WIDTH = 240; 
const CONTENT_MARGIN = 30;
const MOBILE_BREAKPOINT = 768; 
const THEME_COLOR = '#D97706';     // Miel Principal
const ACCENT_COLOR = '#F6AD55';     // Naranja Acento
const BG_COLOR = '#FAFAFA'; 
const TEXT_DARK = '#374151';
const TEXT_MUTED = '#6B7280';
const BORDER_LIGHT = '#E5E7EB';
const STATUS_DANGER = '#E74C3C';
const STATUS_SUCCESS = '#2ECC71';

// Mapeo de iconos (Lucide o fallback simple)
const SensorIconMap = {
    'temperatura_BMP280': Thermometer, 
    'humidity': Droplets, 
    'peso': Scale, 
    'pressure': Gauge, 
    'gX': Zap, 
    'gY': Zap,
    'gZ': Zap,
    'default': Zap 
};

// Estilos centrales (ajustados para ser más limpios)
const styles = {
    header: { 
        fontSize: '2.5rem', 
        color: TEXT_DARK, 
        borderBottom: `2px solid ${BORDER_LIGHT}`, 
        paddingBottom: '10px', 
        marginBottom: '30px', 
        fontWeight: 'extrabold' 
    },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '25px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)', // Sombra más elegante
        border: `1px solid ${BORDER_LIGHT}`,
        transition: 'all 0.3s ease',
    },
    sectionTitle: { fontSize: '1.8rem', color: TEXT_DARK, fontWeight: 'bold', marginBottom: '20px' },
    value: { fontSize: '2.8rem', fontWeight: 'extrabold', color: THEME_COLOR, marginTop: '8px' }, // Tamaño de valor aumentado
    label: { fontSize: '0.9rem', color: TEXT_MUTED, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' },
    chartArea: { minHeight: '300px', width: '100%' }, 
    // Colores para el indicador de estabilidad
    sensorColors: {
        'temperatura_BMP280': '#E74C3C', 'humidity': STATUS_SUCCESS, 'peso': '#3B82F6', 'pressure': '#F1C40F', 
        'default': '#95A5A6',
        'stable': STATUS_SUCCESS,       
        'moderate': '#F1C40F',     
        'alert': STATUS_DANGER,        
        'data_error': TEXT_MUTED    
    }
};
const dashboardStyles = {
    mainContainer: { display: 'flex', minHeight: '100vh', backgroundColor: BG_COLOR, fontFamily: 'Inter, sans-serif', width: '100%' },
    mainContent: { flexGrow: 1, padding: '30px', overflowY: 'auto', transition: 'margin-left 0.3s ease' },
    toggleButton: (isSidebarOpen, isMobile) => ({
        position: 'fixed', top: '20px', left: '20px', zIndex: 1001, backgroundColor: THEME_COLOR, color: 'white', border: 'none', borderRadius: '50%',
        width: '45px', height: '45px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }),
    backButton: {
        marginBottom: '25px', 
        padding: '10px 18px', 
        backgroundColor: BORDER_LIGHT, 
        color: TEXT_DARK, 
        border: 'none', 
        borderRadius: '8px', 
        cursor: 'pointer', 
        fontWeight: '600',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }
};

// --- Componente auxiliar de Tarjeta de Sensor ---
const SensorCard = ({ sensor, value, time, color }) => {
    const IconComponent = SensorIconMap[sensor.key] || SensorIconMap['default'];
    
    // Función de formateo de fecha y hora completa
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/D';
        return new Date(isoString).toLocaleString('es-CL', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // 24h es más profesional
        });
    };

    return (
        <div style={{ ...styles.card, borderLeft: `5px solid ${color}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: color, marginBottom: '10px' }}>
                    <IconComponent size={30} />
                </div>
                <div style={{...styles.label, color: TEXT_DARK}}>{sensor.name || sensor.key.toUpperCase()}</div>
            </div>

            <div style={styles.value}>
                {value} {sensor.unit}
            </div>
            
            <small style={{ color: TEXT_MUTED, marginTop: 'auto', paddingTop: '10px', borderTop: `1px dashed ${BORDER_LIGHT}` }}>
                Última lectura: {formatDateTime(time)}
            </small>
        </div>
    );
};


function ColmenaDetailPage() {
    const { hiveCode } = useParams(); 
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 
    
    const [data, setData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sensorModelMap, setSensorModelMap] = useState({}); 
    
    // Lógica de Sidebar
    const [selectedMenu, setSelectedMenu] = useState('hives'); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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

    
    const fetchAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // 1. Cargar el modelo de sensores
            const sensorModels = await getSensorModel();
            const modelMap = sensorModels.reduce((acc, sensor) => {
                acc[sensor.key] = sensor;
                return acc;
            }, {});
            setSensorModelMap(modelMap);

            // 2. Llamar al servicio de datos
            const result = await getColmenaData(hiveCode); 
            setData(result); 

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message || 'Fallo en la conexión o autenticación de datos.');
        } finally {
            setLoading(false);
        }
    }, [hiveCode]); 

    useEffect(() => {
        if (user) { 
            fetchAllData();
        } else {
            setLoading(false);
            setError("No se pudieron cargar los datos del usuario. Vuelva a iniciar sesión.");
        }
    }, [user, fetchAllData]); 

    // --- Estilos Dinámicos ---
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : CONTENT_MARGIN, 
    };

    if (loading) {
        return (
            <div style={dashboardStyles.mainContainer}>
                <main style={dynamicMainContentStyle}>
                    <div style={{paddingTop: '50px', paddingLeft: '30px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <Loader size={30} color={THEME_COLOR} className="animate-spin" />
                        <h2 style={{color: TEXT_MUTED}}>Cargando datos de la Colmena {hiveCode}...</h2>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div style={dashboardStyles.mainContainer}>
                <Sidebar isVisible={isSidebarOpen} selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
                <main style={dynamicMainContentStyle}>
                    <div style={{paddingTop: '50px', paddingLeft: '30px', color: STATUS_DANGER, border: `2px solid ${STATUS_DANGER}`, padding: '25px', marginTop: '20px', borderRadius: '12px', backgroundColor: '#FEF2F2'}}>
                        <h1 style={{color: STATUS_DANGER, display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <AlertTriangle size={30} /> Error al cargar datos 
                        </h1>
                        <p style={{color: TEXT_DARK, marginBottom: '20px'}}>{error}</p>
                        <button 
                            onClick={() => navigate('/app/dashboard')} 
                            style={{ ...dashboardStyles.backButton, backgroundColor: THEME_COLOR, color: 'white'}}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                        >
                            <ChevronLeft size={18} /> Volver al Dashboard
                        </button>
                    </div>
                </main>
            </div>
        );
    }
    
    // ----------------------------------------------------
    // LÓGICA DE CÁLCULO DE ESTABILIDAD Y FILTRADO
    // ----------------------------------------------------
    const gyroKeysForCharts = ['gX', 'gY', 'gZ'];
    
    // 1. Preparación de datos (todos los sensores)
    const latestDataArray = data ? Object.keys(data.latest).map(key => ({
        key,
        value: parseFloat(data.latest[key].value), // Usamos parseFloat para el cálculo de Gyro
        time: data.latest[key].time,
        ...sensorModelMap[key] 
    })) : [];
    
    // 2. Lógica del Indicador de Estabilidad (GIROSCOPIO)
    const latestGyro = latestDataArray.filter(d => gyroKeysForCharts.includes(d.key));
    let stabilityIndicator = null; 

    const isGyroActiveInHive = data.active_sensors.some(k => gyroKeysForCharts.includes(k));

    if (latestGyro.length > 0) {
        // CÁLCULO DE ESTABILIDAD REAL
        const maxGyroValue = Math.max(...latestGyro.map(d => Math.abs(d.value)));
        
        let status;
        let color;
        let icon;

        if (maxGyroValue < 0.5) { 
            status = 'Estable (Mínimo)';
            color = styles.sensorColors.stable; 
            icon = Home;
        } else if (maxGyroValue < 3.0) {
            status = 'Movimiento Moderado';
            color = styles.sensorColors.moderate; 
            icon = AlertTriangle;
        } else {
            status = '¡Alerta Crítica!';
            color = styles.sensorColors.alert; 
            icon = AlertTriangle;
        }
        
        stabilityIndicator = {
            status: status,
            value: maxGyroValue.toFixed(2),
            time: latestGyro[0].time,
            color: color,
            icon: icon
        };
    } else if (isGyroActiveInHive) {
        // CONTINGENCIA
        stabilityIndicator = {
            status: 'Datos No Encontrados',
            value: 'N/A',
            time: latestDataArray[0]?.time || new Date().toISOString(),
            color: styles.sensorColors.data_error,
            icon: AlertTriangle
        };
    }

    // 3. Filtra la lista de tarjetas para EXCLUIR los ejes crudos del giroscopio
    const filteredLatestDataArray = latestDataArray.filter(d => !gyroKeysForCharts.includes(d.key));


    return (
        <div style={dashboardStyles.mainContainer}>
            
            <Sidebar isVisible={isSidebarOpen} selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} toggleSidebar={toggleSidebar} />
            <button style={dashboardStyles.toggleButton(isSidebarOpen, isMobile)} onClick={toggleSidebar} title="Alternar menú">
                <Menu size={20} />
            </button>

            <main style={dynamicMainContentStyle}>
                <div style={{ padding: CONTENT_MARGIN }}>
                    
                    <button 
                        onClick={() => navigate('/app/mis-colmenas')} 

                        style={dashboardStyles.backButton}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = THEME_COLOR}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BORDER_LIGHT}
                    >
                        <ChevronLeft size={18} color={dashboardStyles.backButton.color} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = TEXT_DARK} />
                        Volver a Colmenas
                    </button>
                    
                    <h1 style={styles.header}>Monitoreo en Vivo: Colmena {hiveCode}</h1>
                    <p style={{marginBottom: '30px', color: TEXT_MUTED}}>
                        Visualizando datos en tiempo real de {data.active_sensors.length} sensores activos.
                    </p>
                    
                    {/* -------------------------------------------------------- */}
                    {/* DATOS RECIENTES (Tarjetas) */}
                    {/* -------------------------------------------------------- */}
                    <h2 style={styles.sectionTitle}>Métricas de Sensores</h2>
                    <div style={styles.cardGrid}>
                        
                        {/* 🚨 TARJETA DE ESTABILIDAD (INDICADOR DEL GIROSCOPIO) */}
                        {stabilityIndicator && (
                            <div 
                                style={{ ...styles.card, borderLeft: `5px solid ${stabilityIndicator.color}` }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ color: stabilityIndicator.color, marginBottom: '10px' }}>
                                        {stabilityIndicator.icon && <stabilityIndicator.icon size={30} />}
                                    </div>
                                    <div style={{...styles.label, color: TEXT_DARK}}>Estabilidad de Movimiento</div>
                                </div>
                                <div style={{...styles.value, color: stabilityIndicator.color, fontSize: '2.4rem'}}>
                                    {stabilityIndicator.status}
                                </div>
                                <small style={{ color: TEXT_MUTED, marginTop: '10px', paddingTop: '10px', borderTop: `1px dashed ${BORDER_LIGHT}` }}>
                                    Máx. Movimiento: {stabilityIndicator.value} rad/s
                                    <br/>
                                    Última lectura: {new Date(stabilityIndicator.time).toLocaleTimeString('es-CL', { hour12: false })}
                                </small>
                            </div>
                        )}

                        {/* RENDERIZA LOS DEMÁS SENSORES */}
                        {filteredLatestDataArray.length > 0 ? filteredLatestDataArray.map((sensor) => (
                            // Usamos el nuevo componente auxiliar SensorCard
                            <SensorCard 
                                key={sensor.key}
                                sensor={sensor}
                                value={sensor.value.toFixed(2)}
                                time={sensor.time}
                                color={styles.sensorColors[sensor.key] || styles.sensorColors.default}
                            />
                        )) : (
                            <div style={{...styles.card, gridColumn: 'span 2', borderLeft: `5px solid ${TEXT_MUTED}`}}>
                                <p style={{color: TEXT_MUTED}}>No hay datos recientes disponibles. Verifica que el monitor esté enviando datos.</p>
                            </div>
                        )}
                    </div>

                    {/* -------------------------------------------------------- */}
                    {/* SECCIÓN DE GRÁFICOS (Placeholder) */}
                    {/* -------------------------------------------------------- */}
                    <h2 style={styles.sectionTitle}>Gráfico Histórico (Últimas 24h)</h2>
                    
                    {data && data.history && data.history.length > 0 ? (
                        <div style={{...styles.card, marginTop: '15px', borderLeft: `5px solid ${STATUS_SUCCESS}`}}>
                            <p style={{color: TEXT_DARK, fontWeight: '500'}}>
                                Datos históricos cargados: {data.history.length} puntos disponibles. 
                                (Integración de gráficos pendiente).
                            </p>
                        </div>
                    ) : (
                        <div style={{...styles.card, marginTop: '15px', borderLeft: `5px solid ${ACCENT_COLOR}`}}>
                            <p style={{color: TEXT_MUTED}}>No hay suficientes datos históricos para generar gráficos. Esperando más lecturas del sensor.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ColmenaDetailPage;
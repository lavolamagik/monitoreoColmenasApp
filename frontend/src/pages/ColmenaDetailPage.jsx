// src/pages/ColmenaDetailPage.jsx (CÓDIGO FINAL CON DISEÑO POR AGRUPACIÓN DE SENSORES)
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 

import { getColmenaData } from '../api/dataService'; 
import { getSensorModel } from '../api/colmenaService'; 

// 🚨 IMPORTACIÓN DE ICONOS PROFESIONALES (Lucide React)
import { 
    Thermometer, Droplets, Scale, Gauge, Zap, Home, ChevronLeft, AlertTriangle, Loader, Menu, 
    ChevronDown, ChevronUp, Users, CheckCircle, Activity, TrendingUp, Package 
} from 'lucide-react'; 

// =======================================================
// BLOQUE DE CONSTANTES DE DISEÑO
// =======================================================
const SIDEBAR_WIDTH = 240; 
const CONTENT_MARGIN = 30;
const MOBILE_BREAKPOINT = 768; 
const THEME_COLOR = '#D97706'; 
const ACCENT_COLOR = '#F6AD55'; 
const BG_COLOR = '#FAFAFA'; 
const LIGHT_HONEY_BG = '#FFFBEB';
const TEXT_DARK = '#374151';
const TEXT_MUTED = '#6B7280';
const BORDER_LIGHT = '#E5E7EB';
const STATUS_DANGER = '#EF4444';
const STATUS_SUCCESS = '#10B981';

// Mapeo de iconos y colores
const SensorIconMap = {
    'temperatura_BMP280': Thermometer, 
    'humidity': Droplets, 
    'peso': Scale, 
    'pressure': Gauge, 
    'gX': Zap, 
    'gY': Zap,
    'gZ': Zap,
    'aSqrt': TrendingUp, 
    'aX': Activity, 
    'aY': Activity,
    'aZ': Activity,
    'con_varroa': Users, 
    'sin_varroa': CheckCircle,
    'default': Package 
};

// Estilos centrales
const styles = {
    header: { fontSize: '2.5rem', color: TEXT_DARK, borderBottom: `2px solid ${BORDER_LIGHT}`, paddingBottom: '10px', marginBottom: '30px', fontWeight: 'extrabold' },
    // Grid para tarjetas individuales (min ancho 200px)
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' },
    // 🚨 CORRECCIÓN CLAVE: summaryCardGrid usa auto-fit para ser responsive.
    summaryCardGrid: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Se apila si el ancho es menor a 300px
        gap: '20px', 
        marginBottom: '40px' 
    },
    
    card: { 
        backgroundColor: 'white', borderRadius: '12px', padding: '20px', 
        boxShadow: '0 4px 10px rgba(0,0,0,0.08)', 
        border: `1px solid ${BORDER_LIGHT}`, 
        transition: 'all 0.3s ease',
        position: 'relative', 
    },
    sectionTitle: { fontSize: '1.8rem', color: TEXT_DARK, fontWeight: 'bold', marginBottom: '20px' },
    value: { fontSize: '2rem', fontWeight: 'extrabold', color: THEME_COLOR, marginTop: '8px' }, 
    label: { fontSize: '0.85rem', color: TEXT_MUTED, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' },
    sensorColors: {
        'temperatura_BMP280': STATUS_DANGER, 'humidity': STATUS_SUCCESS, 'peso': '#3B82F6', 'pressure': '#F1C40F', 
        'default': '#95A5A6', 'stable': STATUS_SUCCESS, 'moderate': '#F1C40F', 'alert': STATUS_DANGER, 'data_error': TEXT_MUTED     
    },
    backButton: {
        marginBottom: '25px', padding: '10px 18px', backgroundColor: BORDER_LIGHT, color: TEXT_DARK, border: 'none', 
        borderRadius: '8px', fontWeight: '600', transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
    },
};
const dashboardStyles = {
    mainContainer: { display: 'flex', minHeight: '100vh', backgroundColor: BG_COLOR, fontFamily: 'Inter, sans-serif', width: '100%' },
    mainContent: { flexGrow: 1, padding: '30px', overflowY: 'auto', transition: 'margin-left 0.3s ease' },
    toggleButton: (isSidebarOpen, isMobile) => ({
        position: 'fixed', top: '20px', left: '20px', zIndex: 1001, backgroundColor: THEME_COLOR, color: 'white', border: 'none', 
        borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }),
};


// --- Componente auxiliar de Tarjeta de Sensor (Con Hover) ---
const SensorCard = ({ sensor, value, time, color }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconComponent = SensorIconMap[sensor.key] || SensorIconMap['default'];
    
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/D';
        return new Date(isoString).toLocaleString('es-CL', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false, 
        });
    };
    
    const cardStyle = { 
        ...styles.card, 
        borderLeft: `5px solid ${color}`, 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'default',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)', 
        boxShadow: isHovered 
            ? '0 8px 20px rgba(0,0,0,0.15)' 
            : '0 4px 10px rgba(0,0,0,0.08)',
        position: 'relative', 
    };

    return (
        <div 
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: color, marginBottom: '10px' }}>
                    <IconComponent size={30} />
                </div>
                <div style={{...styles.label, color: TEXT_DARK}}>{sensor.name || sensor.key.toUpperCase()}</div>
            </div>

            <div style={styles.value}>
                {value} <span style={{ fontSize: '1.2rem', fontWeight: 'normal', color: TEXT_MUTED }}>{sensor.unit}</span>
            </div>
            
            <small style={{ color: TEXT_MUTED, marginTop: 'auto', paddingTop: '10px', borderTop: `1px dashed ${BORDER_LIGHT}` }}>
                Última lectura: {formatDateTime(time)}
            </small>
        </div>
    );
};


// ----------------------------------------------------------------------
// 🚨 Tarjeta Resumen con Despliegue (Con Hover y UX mejorada)
// ----------------------------------------------------------------------
const SummaryCard = ({ title, status, color, icon: Icon, time, detailedData, labelMap, onClick, isExpanded, gridSpan }) => {
    const [isHovered, setIsHovered] = useState(false);
    const hasDetailedData = detailedData && detailedData.length > 0;

    const containerStyle = { 
        ...styles.card, 
        borderLeft: `5px solid ${color}`, 
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
            ? '0 6px 15px rgba(0,0,0,0.12)' 
            : '0 4px 10px rgba(0,0,0,0.08)',
        position: 'relative',
        
        // 🚨 CLAVE: Aplicar la propiedad gridColumn que puede ser 'span 1' o '1 / -1'
        gridColumn: gridSpan, 
    };
    
    const headerStyle = {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        cursor: hasDetailedData ? 'pointer' : 'default', 
        transition: 'background-color 0.2s',
        backgroundColor: isHovered ? BORDER_LIGHT : 'transparent', 
        borderRadius: '8px', 
        padding: '10px',
        margin: '-10px', 
    };
    
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/D';
        return new Date(isoString).toLocaleString('es-CL', { hour12: false });
    };


    return (
        <div 
            style={containerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div 
                onClick={onClick} // Llama a handleSummaryClick en el componente padre
                style={headerStyle}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Icon size={30} color={color} />
                    <div style={{}}>
                        <p style={{...styles.label, marginBottom: '3px', color: TEXT_DARK}}>
                            {title}
                        </p>
                        <p style={{ fontWeight: 'bold', color: color, fontSize: '1.1rem' }}>
                            {status}
                        </p>
                    </div>
                </div>
                
                <div style={{ color: TEXT_MUTED }}>
                    {hasDetailedData ? (isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />) : <Package size={20} />}
                </div>
            </div>

            {/* CONTENIDO DETALLADO (Desplegable) */}
            {hasDetailedData && (
                <div 
                    style={{
                        // 🚨 CLAVE: Usamos max-height para empujar el contenido de abajo.
                        maxHeight: isExpanded ? '500px' : '0', 
                        overflow: 'hidden',
                        transition: 'max-height 0.4s ease-in-out',
                        backgroundColor: LIGHT_HONEY_BG, 
                        marginTop: isExpanded ? '15px' : '0',
                        borderRadius: '8px',
                        zIndex: 10, 
                        minHeight: isExpanded ? 'auto' : '0', 
                    }}
                >
                    <div style={{ padding: isExpanded ? '15px 20px 15px 20px' : '0 20px' }}> 
                        <h4 style={{ color: TEXT_DARK, fontSize: '1.1rem', marginBottom: '10px', fontWeight: 'bold' }}>
                            Valores Recientes ({labelMap.detailLabel}):
                        </h4>
                        
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {detailedData.map(d => (
                                <li key={d.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px dotted ${BORDER_LIGHT}`, color: TEXT_MUTED }}>
                                    <span style={{ fontWeight: '600', color: TEXT_DARK }}>{labelMap[d.key] || d.key.toUpperCase()}:</span>
                                    <span>{d.value.toFixed(3)} {d.unit || ''}</span>
                                </li>
                            ))}
                        </ul>
                        <small style={{ color: TEXT_MUTED, marginTop: '10px', display: 'block' }}>
                            Último muestreo: {formatDateTime(detailedData[0]?.time)}
                        </small>
                    </div>
                </div>
            )}
        </div>
    );
};
// ----------------------------------------------------------------------


function ColmenaDetailPage() {
    const { hiveCode } = useParams(); 
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 
    
    const [data, setData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sensorModelMap, setSensorModelMap] = useState({}); 
    // 🚨 NUEVO ESTADO: Controla qué panel de detalle se muestra
    const [activeDetail, setActiveDetail] = useState(null); // 'gyro', 'varroa', 'acceleration', null
    
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
        setLoading(true); setError(null);
        try {
            const sensorModels = await getSensorModel();
            const modelMap = sensorModels.reduce((acc, sensor) => { acc[sensor.key] = sensor; return acc; }, {});
            setSensorModelMap(modelMap);
            const result = await getColmenaData(hiveCode); 
            setData(result); 

        } catch (err) { setError(err.message || 'Fallo en la conexión o autenticación de datos.');
        } finally { setLoading(false); }
    }, [hiveCode]); 

    useEffect(() => {
        if (user) { fetchAllData(); } 
        else { setLoading(false); setError("No se pudieron cargar los datos del usuario. Vuelva a iniciar sesión."); }
    }, [user, fetchAllData]); 

    // 🚨 Función para manejar el clic en la tarjeta de síntesis (controla el estado activeDetail)
    const handleSummaryClick = (detailKey) => {
        setActiveDetail(activeDetail === detailKey ? null : detailKey);
    };


    // --- Lógica de Estabilidad y Varroa ---
    const gyroKeys = ['gX', 'gY', 'gZ'];
    const accelerationKeys = ['aX', 'aY', 'aZ', 'aSqrt']; 
    const varroaKeys = ['con_varroa', 'sin_varroa'];

    const latestDataArray = data ? Object.keys(data.latest).map(key => ({
        key, value: parseFloat(data.latest[key].value), time: data.latest[key].time, ...sensorModelMap[key] 
    })) : [];
    
    let filteredLatestDataArray = [...latestDataArray];
    
    // ------------------------------------------------------
    // CÁLCULO 1: GIROSCOPIO (Estabilidad/Inclinación)
    // ------------------------------------------------------
    const latestGyro = latestDataArray.filter(d => gyroKeys.includes(d.key));
    let stabilityIndicator = null; 

    if (latestGyro.length > 0) {
        const maxGyroValue = Math.max(...latestGyro.map(d => Math.abs(d.value)));
        let status, color, icon;
        if (maxGyroValue < 0.5) { status = 'Estable (Mínimo)'; color = styles.sensorColors.stable; icon = Home; } 
        else if (maxGyroValue < 3.0) { status = 'Movimiento Moderado'; color = styles.sensorColors.moderate; icon = AlertTriangle; } 
        else { status = '¡Alerta Crítica!'; color = styles.sensorColors.alert; icon = AlertTriangle; }
        stabilityIndicator = { status, value: maxGyroValue.toFixed(2), time: latestGyro[0].time, color, icon };
        
        filteredLatestDataArray = filteredLatestDataArray.filter(d => !gyroKeys.includes(d.key));
    }

    // ------------------------------------------------------
    // CÁLCULO 2: ACELERACIÓN (Actividad General)
    // ------------------------------------------------------
    const latestAcceleration = latestDataArray.filter(d => accelerationKeys.includes(d.key));
    let activityIndicator = null;
    
    if (latestAcceleration.length > 0) {
        const totalAcceleration = latestAcceleration.find(d => d.key === 'aSqrt')?.value || 0;
        
        let status, color, icon = Activity;

        if (totalAcceleration < 1.05) { 
            status = 'Baja Actividad';
            color = styles.sensorColors.stable;
        } else if (totalAcceleration < 5) {
            status = 'Actividad Normal';
            color = styles.sensorColors.moderate;
        } else {
            status = 'Movimiento Brusco';
            color = styles.sensorColors.alert;
        }

        activityIndicator = { status, value: totalAcceleration.toFixed(3), time: latestAcceleration[0]?.time, color, icon };

        filteredLatestDataArray = filteredLatestDataArray.filter(d => !accelerationKeys.includes(d.key));
    }
    
    // ------------------------------------------------------
    // CÁLCULO 3: VARROA (Detección Consolidada)
    // ------------------------------------------------------
    const latestVarroa = latestDataArray.filter(d => varroaKeys.includes(d.key));
    let varroaIndicator = null;
    if (latestVarroa.length > 0) {
        const conVarroa = latestVarroa.find(d => d.key === 'con_varroa')?.value || 0;
        const sinVarroa = latestVarroa.find(d => d.key === 'sin_varroa')?.value || 0;
        const total = conVarroa + sinVarroa;
        const percentage = total > 0 ? (conVarroa / total * 100).toFixed(1) : 0;
        
        let status = total > 0 ? `${percentage}% Presencia Varroa` : 'Sin Detección Reciente';
        let color = percentage > 5 ? styles.sensorColors.alert : styles.sensorColors.stable;

        varroaIndicator = { status, value: percentage, time: latestVarroa[0]?.time, color, icon: Users, detailedData: latestVarroa };
        filteredLatestDataArray = filteredLatestDataArray.filter(d => !varroaKeys.includes(d.key));
    }

    // 🚨 Agrupamos todos los indicadores para el renderizado dinámico
    const allIndicators = [
        stabilityIndicator ? { key: 'gyro', ...stabilityIndicator, detailedData: latestGyro, labelMap: { 'gX': 'Eje X', 'gY': 'Eje Y', 'gZ': 'Eje Z', detailLabel: 'Valores Giroscópicos (rad/s)' } } : null,
        activityIndicator ? { key: 'acceleration', ...activityIndicator, detailedData: latestAcceleration, labelMap: { 'aX': 'Eje X', 'aY': 'Eje Y', 'aZ': 'Eje Z', 'aSqrt': 'Aceleración Total', detailLabel: 'Valores Aceleración (m/s²)' } } : null,
        varroaIndicator ? { key: 'varroa', ...varroaIndicator, detailedData: latestVarroa, labelMap: { 'con_varroa': 'Con Varroa', 'sin_varroa': 'Sin Varroa', detailLabel: 'Conteo de Muestras' } } : null,
    ].filter(Boolean);


    // --- Render de Carga y Error ---
    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : CONTENT_MARGIN, 
    };

    if (loading) {
        // ... (loading state) ...
        return <div style={dashboardStyles.mainContainer}><main style={dynamicMainContentStyle}><div style={{padding: CONTENT_MARGIN, display: 'flex', alignItems: 'center', gap: '10px'}}><Loader size={30} color={THEME_COLOR} className="animate-spin" /><h2 style={{color: TEXT_MUTED}}>Cargando datos de la Colmena {hiveCode}...</h2></div></main></div>;
    }

    if (error) {
        // ... (error state) ...
        return (
            <div style={dashboardStyles.mainContainer}>
                <Sidebar isVisible={isSidebarOpen} selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} toggleSidebar={toggleSidebar} />
                <main style={dynamicMainContentStyle}>
                    <div style={{padding: CONTENT_MARGIN, color: STATUS_DANGER, border: `2px solid ${STATUS_DANGER}`, padding: '25px', marginTop: '20px', borderRadius: '12px', backgroundColor: '#FEF2F2'}}>
                        <h1 style={{color: STATUS_DANGER, display: 'flex', alignItems: 'center', gap: '10px'}}><AlertTriangle size={30} /> Error al cargar datos </h1>
                        <p style={{color: TEXT_DARK, marginBottom: '20px'}}>{error}</p>
                        <button 
                            onClick={() => navigate('/app/mis-colmenas')} 
                            style={styles.backButton}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = THEME_COLOR; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BORDER_LIGHT; e.currentTarget.style.color = TEXT_DARK; }}
                        >
                            <ChevronLeft size={18} /> Volver a Colmenas
                        </button>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div style={dashboardStyles.mainContainer}>
            <Sidebar isVisible={isSidebarOpen} selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} toggleSidebar={toggleSidebar} />
            
            {/* 🚨 BOTÓN DE APERTURA FIJO: Solo se muestra si el Sidebar está cerrado */}
            {!isSidebarOpen && (
                 <button style={dashboardStyles.toggleButton(isSidebarOpen, isMobile)} onClick={toggleSidebar} title="Mostrar menú">
                    <Menu size={20} />
                 </button>
            )}

            <main style={dynamicMainContentStyle}>
                <div style={{ padding: CONTENT_MARGIN }}>
                    
                    {/* Botón de Volver con efecto hover profesional */}
                    <button 
                        onClick={() => navigate('/app/mis-colmenas')} 
                        style={styles.backButton}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = THEME_COLOR; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = BORDER_LIGHT; e.currentTarget.style.color = TEXT_DARK; }}
                    >
                        <ChevronLeft size={18} /> 
                        Volver a Colmenas
                    </button>
                    
                    <h1 style={styles.header}>Monitoreo en Vivo: Colmena {hiveCode}</h1>
                    <p style={{marginBottom: '30px', color: TEXT_MUTED}}>
                        Visualizando datos en tiempo real de {data.active_sensors.length} sensores activos.
                    </p>
                    
                    {/* -------------------------------------------------------- */}
                    {/* DATOS DE RESUMEN/AGRUPADOS (Tarjetas Expandibles) */}
                    {/* -------------------------------------------------------- */}
                    <h2 style={styles.sectionTitle}>Métricas de Sensores Agrupados</h2>
                    
                    {/* 🚨 BLOQUE DE TARJETAS EXPANDIBLES (Summary Cards) - AHORA RESPONSIVE */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={styles.summaryCardGrid}> 
                            
                            {allIndicators.map((indicator) => (
                                <SummaryCard
                                    key={indicator.key}
                                    title={indicator.key === 'gyro' ? "Estabilidad de Movimiento" : indicator.key === 'acceleration' ? "Actividad / Impacto" : "Salud - Varroa"}
                                    status={indicator.status}
                                    color={indicator.color}
                                    icon={indicator.icon}
                                    time={indicator.time}
                                    detailedData={indicator.detailedData}
                                    labelMap={indicator.labelMap}
                                    onClick={() => handleSummaryClick(indicator.key)}
                                    isExpanded={activeDetail === indicator.key}
                                    // 🚨 CORRECCIÓN CLAVE: '1 / -1' es el span responsivo para ocupar todo el ancho.
                                    gridSpan={activeDetail === indicator.key ? '1 / -1' : 'span 1'}
                                />
                            ))}
                        </div>
                    </div>


                    {/* 🚨 FILA DE TARJETAS INDIVIDUALES (Temperatura, Peso, Humedad) */}
                    <h2 style={styles.sectionTitle}>Métricas de Sensores Individuales</h2>
                    <div style={styles.cardGrid}>
                        {filteredLatestDataArray.length > 0 ? filteredLatestDataArray.map((sensor) => (
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
                </div>
            </main>
        </div>
    );
}

export default ColmenaDetailPage;
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 
import ColmenaForm from '../components/ColmenaForm'; 

// Importamos servicios y el componente de gráfico
import { getColmenasByUserId } from '../api/colmenaService'; 
import { getColmenaData } from '../api/dataService'; 
import SensorLineChart from '../components/SensorLineChart'; // 🚨 REQUIERE: Archivo SensorLineChart.jsx

// Íconos necesarios
import { Home, Thermometer, Droplets, AlertTriangle, Menu, Maximize, X, Filter, Clock } from 'lucide-react'; 
import { FaHome, FaThermometerHalf, FaTint, FaExclamationTriangle } from 'react-icons/fa'; 

// --- Constantes de Diseño y Estilos ---
const PRIMARY_HONEY = '#D97706';     
const ACCENT_ORANGE = '#F6AD55';     
const LIGHT_HONEY_BG = '#FFF7ED';     
const BACKGROUND_LIGHT = '#FAFAFA';  
const TEXT_DARK = '#374151';         
const TEXT_MUTED = '#6B7280';        
const BORDER_LIGHT = '#E5E7EB';      

const STATUS_DANGER = '#EF4444';     
const STATUS_INFO = '#3B82F6';       
const STATUS_SUCCESS = '#059669';    

const MOBILE_BREAKPOINT = 768; 
const SIDEBAR_WIDTH = 250; 
const CONTENT_MARGIN = 30; 
const BACKGROUND_CARD = 'white'; 

// --- Opciones de Rango de Tiempo ---
const TIME_RANGES = [
  { label: 'Últimas 6 horas', value: '6h' },
  { label: 'Último día', value: '1d' },
  { label: 'Últimos 7 días', value: '7d' },
  { label: 'Últimos 30 días', value: '30d' },
  { label: 'Últimos 60 días', value: '60d' },
];

// --- Grupos de Gráficos para Renderizado Condicional ---
const CHART_GROUPS = [
    { key: 'TEMP', label: 'Temperatura', sensors: ['temperatura_BMP280'], icon: Thermometer, color: '#e74c3c', unit: '°C' },
    { key: 'HUM_PRES', label: 'Humedad / Presión', sensors: ['humidity', 'pressure'], icon: Droplets, color: '#3498db', unit: '' },
    { key: 'ACCEL', label: 'Aceleración', sensors: ['aX', 'aY', 'aZ', 'aSqrt'], icon: Maximize, color: '#f1c40f', unit: 'm/s²' },
    { key: 'VELOCITY', label: 'Velocidad Angular', sensors: ['gX', 'gY', 'gZ'], icon: Maximize, color: '#ff69b4', unit: '°/s' },
    { key: 'WEIGHT', label: 'Peso', sensors: ['peso'], icon: Home, color: '#2ecc71', unit: 'kg' },
    { key: 'SOUND', label: 'Sonido', sensors: ['microfono'], icon: AlertTriangle, color: '#9b59b6', unit: 'dB' },
    { key: 'VARROA', label: 'Varroa', sensors: ['con_varroa', 'sin_varroa'], icon: X, color: '#D97706', unit: 'unidades' },
];

// --- Estilos Base (Se mantienen) ---
const dashboardStyles = {
    mainContainer: { display: 'flex', minHeight: '100vh', backgroundColor: BACKGROUND_LIGHT, fontFamily: 'Inter, sans-serif' },
    mainContent: { flexGrow: 1, padding: `${CONTENT_MARGIN}px`, overflowY: 'auto', transition: 'margin-left 0.3s ease', },
    title: { fontSize: '2.5rem', color: TEXT_DARK, marginBottom: '10px', fontWeight: 'extrabold' },
    subtitle: { fontSize: '1rem', color: TEXT_MUTED, marginBottom: '30px', },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', border: `1px solid ${BORDER_LIGHT}`, borderLeft: `5px solid ${ACCENT_ORANGE}`, transition: 'all 0.3s ease', },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' },
    actionButton: { padding: '12px 25px', backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'background-color 0.2s ease, transform 0.1s', },
    sectionTitle: { fontSize: '1.8rem', color: TEXT_DARK, fontWeight: 'bold', marginBottom: '0', paddingBottom: '0', },
    formModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, overflowY: 'auto', padding: '20px 0', }, 
    formContent: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', position: 'relative', maxWidth: '650px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto', },
    hiveSelectorContainer: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', padding: '20px 0', borderBottom: `1px solid ${BORDER_LIGHT}`, borderTop: `1px solid ${BORDER_LIGHT}`, flexWrap: 'wrap', },
    selectBase: { padding: '10px 15px', fontSize: '1rem', borderRadius: '8px', border: `1px solid ${BORDER_LIGHT}`, cursor: 'pointer', backgroundColor: 'white', color: TEXT_DARK, },
    closeButtonWrapper: { position: 'absolute', top: '15px', right: '15px', zIndex: 10, width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s', },
    closeIcon: { fontSize: '24px', border: 'none', background: 'none', padding: 0, lineHeight: 1, color: TEXT_MUTED, transition: 'color 0.2s',},
    toggleButton: { position: 'fixed', top: '20px', left: '20px', zIndex: 1001, backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s',},
};


// 💡 LÓGICA DE PROCESAMIENTO (Maneja objeto vacío {})
const calculateSummary = (data) => {
    // 1. Chequeo si data es null o undefined
    if (!data || !data.latest) {
        return { temperature: 'N/A', humidity: 'N/A', alertCount: '0' };
    }
    
    const latest = data.latest;

    // 🚨 CORRECCIÓN: Chequeamos si el objeto 'latest' está presente pero vacío.
    const isLatestEmpty = Object.keys(latest).length === 0;

    if (isLatestEmpty) {
        return { temperature: 'N/A', humidity: 'N/A', alertCount: '0' };
    }

    // Extraer y formatear valores del último punto (latest)
    const latestTemp = latest.temperatura_BMP280?.value;
    const latestHumidity = latest.humidity?.value;
    
    return {
        // Aseguramos que el valor extraído no sea undefined o null antes de formatear
        temperature: latestTemp !== undefined && latestTemp !== null ? `${latestTemp.toFixed(1)} °C` : 'N/A',
        humidity: latestHumidity !== undefined && latestHumidity !== null ? `${latestHumidity.toFixed(1)} %` : 'N/A',
        alertCount: '0', 
    };
};


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

// --- Componente de Selector de Colmena y Rango de Tiempo (Se mantiene igual) ---
const HiveSelector = ({ colmenas, selectedHiveCode, onSelectHive, timeRange, onSelectRange, onNavigate }) => (
    <div style={dashboardStyles.hiveSelectorContainer}>
        {/* Selector de Colmena */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} style={{ color: TEXT_DARK }} />
            <select 
                value={selectedHiveCode} 
                onChange={(e) => onSelectHive(e.target.value)}
                style={{...dashboardStyles.selectBase, minWidth: '250px'}}
                title="Seleccionar Colmena"
            >
                <option value="">-- Ver Resumen General --</option>
                {colmenas.map(colmena => (
                    <option key={colmena.id} value={colmena.hive_code}>
                        {colmena.hive_code} - {colmena.description || 'Sin descripción'}
                    </option>
                ))}
            </select>
        </div>

        {/* Selector de Rango de Tiempo (Solo visible si hay una colmena seleccionada) */}
        {selectedHiveCode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} style={{ color: TEXT_DARK }} />
                <select 
                    value={timeRange} 
                    onChange={(e) => onSelectRange(e.target.value)}
                    style={dashboardStyles.selectBase}
                    title="Seleccionar Rango de Tiempo"
                >
                    {TIME_RANGES.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        )}

        {/* Botón de Navegación (Solo visible si hay una colmena seleccionada) */}
        {selectedHiveCode && (
            <button
                style={{...dashboardStyles.actionButton, padding: '10px 20px', marginLeft: '10px', display: 'flex', alignItems: 'center'}}
                onClick={() => onNavigate(selectedHiveCode)}
            >
                <Maximize size={18} style={{ marginRight: '8px' }} />
                Ver Detalle Completo
            </button>
        )}
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
    
    // 💡 ESTADOS CLAVE
    const [selectedHiveCode, setSelectedHiveCode] = useState(''); 
    const [timeRange, setTimeRange] = useState('7d'); 
    const [colmenaSensorData, setColmenaSensorData] = useState(null);
    const [isLoadingSensorData, setIsLoadingSensorData] = useState(false);

    // 💡 PROCESAMIENTO DE DATOS: Se recalcula cada vez que colmenaSensorData cambia
    const summaryStats = useMemo(() => calculateSummary(colmenaSensorData), [colmenaSensorData]);
    
    // 💡 NUEVO ESTADO: Controla qué gráfico se muestra por defecto
    const [activeChartKey, setActiveChartKey] = useState('TEMP');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Lógica para detectar el tamaño de la pantalla (Se mantiene)
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
            
            // 🚨 Ajuste de estado: Si hay colmenas cargadas, selecciona la primera.
            if (data.length > 0 && selectedHiveCode === '') {
                setSelectedHiveCode(data[0].hive_code);
            }

        } catch (err) {
            setDataError(err.message || 'Error al cargar la lista de colmenas.');
        } finally {
            setIsLoadingData(false);
        }
    }, [selectedHiveCode]); 

    // 💡 FUNCIÓN PRINCIPAL DE CARGA DE DATOS FILTRADOS
    const fetchColmenaSensorData = useCallback(async () => {
        if (!selectedHiveCode) { 
            setColmenaSensorData(null);
            return;
        }

        setIsLoadingSensorData(true);
        try {
            // ✅ Usa selectedHiveCode y timeRange
            const data = await getColmenaData(selectedHiveCode, timeRange);
            setColmenaSensorData(data);
        } catch (err) {
            console.error('Error al cargar datos de sensores:', err.message);
            setColmenaSensorData(null); 
        } finally {
            setIsLoadingSensorData(false);
        }
    }, [selectedHiveCode, timeRange]);

    useEffect(() => {
        fetchColmenas();
    }, [fetchColmenas]);
    
    // 💡 useEffect: Se dispara la recarga cuando los filtros cambian
    useEffect(() => {
        if (!isLoadingData) {
            fetchColmenaSensorData();
        }
    }, [fetchColmenaSensorData, isLoadingData]);
    
    // FUNCIONES DE MANEJO (Se mantienen)
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
    
    // 💡 Definición de los KPIs usando los datos reales (summaryStats)
    const statData = [
        { title: "Total Colmenas Propias", value: colmenas.length, icon: Home, statusColor: STATUS_INFO },             
        { title: "Temperatura Promedio", value: summaryStats.temperature, icon: Thermometer, statusColor: ACCENT_ORANGE },  
        { title: "Nivel de Humedad", value: summaryStats.humidity, icon: Droplets, statusColor: STATUS_SUCCESS },                   
        { title: "Colmenas en Alerta", value: summaryStats.alertCount, icon: AlertTriangle, statusColor: STATUS_DANGER },    
    ];
    
    // 💡 RENDERIZADOR CONDICIONAL DE GRÁFICOS
    const renderActiveChart = (activeKey, data) => {
        const group = CHART_GROUPS.find(g => g.key === activeKey);
        if (!group) return null;

        // Filtramos las claves activas de este grupo que realmente existen en el backend
        const sensorKeys = group.sensors.filter(key => data.active_sensors.includes(key));
        
        if (sensorKeys.length === 0) {
            return <p style={{ color: TEXT_MUTED }}>No hay datos de sensores activos para {group.label} en esta colmena.</p>;
        }

        // Si hay una sola línea (ej. Temperatura, Peso, Sonido)
        if (sensorKeys.length === 1 && group.sensors.length === 1) {
            return (
                <SensorLineChart
                    historyData={data.history}
                    sensorKey={sensorKeys[0]}
                    title={group.label}
                    unit={group.unit}
                    color={group.color}
                />
            );
        }
        
        // Si es multi-línea (Aceleración, Giroscopio, Varroa, Humedad/Presión)
        return (
            <SensorLineChart
                historyData={data.history}
                multiSensorKeys={sensorKeys}
                title={group.label}
                unit={group.unit}
                color={group.color} // Solo usa el color si el gráfico es binario/primario
            />
        );
    };

    const dynamicMainContentStyle = {
        ...dashboardStyles.mainContent,
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : CONTENT_MARGIN, 
    };
    
    const ToggleIconComponent = Menu; 


    return (
        <div style={dashboardStyles.mainContainer}> 
            
            {/* Botón y Sidebar (Se mantienen iguales) */}
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
                {/* FILTRO Y ACCESO RÁPIDO A COLMENA */}
                {/* -------------------------------------------------------- */}
                <h2 style={{...dashboardStyles.sectionTitle, marginBottom: '20px'}}>Acceso Rápido</h2>
                {isLoadingData ? (
                    <p style={{color: TEXT_MUTED}}>Cargando colmenas...</p>
                ) : dataError ? (
                    <p style={{color: STATUS_DANGER}}>Error: {dataError}</p>
                ) : (
                    <HiveSelector
                        colmenas={colmenas}
                        selectedHiveCode={selectedHiveCode}
                        onSelectHive={setSelectedHiveCode} // Actualiza la colmena seleccionada
                        timeRange={timeRange}
                        onSelectRange={setTimeRange} // Actualiza el rango de tiempo
                        onNavigate={handleColmenaClick}
                    />
                )}
                
                {/* -------------------------------------------------------- */}
                {/* ESTADÍSTICAS RÁPIDAS (KPIs) */}
                {/* -------------------------------------------------------- */}
                <h2 style={{...dashboardStyles.sectionTitle, marginTop: '20px'}}>Resumen de Salud (General)</h2>
                <div style={{...dashboardStyles.grid, borderBottom: `1px solid ${BORDER_LIGHT}`, paddingBottom: '20px'}}>
                    {statData.map((stat, index) => (
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
                {/* LÓGICA DE DETALLE DE COLMENA ÚNICA (GRÁFICOS) */}
                {/* -------------------------------------------------------- */}
                {selectedHiveCode && (
                    <div style={{ marginTop: '40px' }}>
                        <h2 style={dashboardStyles.sectionTitle}>
                            Gráficos de Sensores
                        </h2>
                        <div style={{...dashboardStyles.card, borderLeft: '5px solid #3B82F6', marginTop: '20px', padding: '30px'}}>
                            {isLoadingSensorData ? (
                                <p style={{color: TEXT_MUTED}}>Cargando datos de sensores para el rango seleccionado...</p>
                            ) : (
                                colmenaSensorData && colmenaSensorData.history?.length > 0 ? (
                                    <>
                                        {/* Botones de Renderizado Condicional */}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                            {CHART_GROUPS.map((group) => {
                                                // Verifica que la colmena tenga al menos un sensor de este grupo
                                                const hasActiveSensor = colmenaSensorData.active_sensors.some(sensor => group.sensors.includes(sensor));
                                                
                                                if (!hasActiveSensor) return null; // Oculta botones si no hay datos relevantes

                                                return (
                                                    <button
                                                        key={group.key}
                                                        onClick={() => setActiveChartKey(group.key)}
                                                        style={{
                                                            ...dashboardStyles.actionButton,
                                                            padding: '8px 15px',
                                                            backgroundColor: activeChartKey === group.key ? PRIMARY_HONEY : BORDER_LIGHT,
                                                            color: activeChartKey === group.key ? 'white' : TEXT_DARK,
                                                            border: 'none',
                                                            transition: 'background-color 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <group.icon size={18} style={{ marginRight: '5px' }} />
                                                        {group.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Título de Puntos e Indicador de Rango */}
                                        <h3 style={{ fontSize: '1.2rem', color: TEXT_DARK, marginBottom: '25px', fontWeight: 'bold' }}>
                                            Mostrando: {CHART_GROUPS.find(g => g.key === activeChartKey)?.label} ({colmenaSensorData.history.length} puntos históricos)
                                        </h3>

                                        {/* 🚨 RENDERIZADO CONDICIONAL DEL GRÁFICO ACTIVO */}
                                        <div style={{ padding: '15px', borderRadius: '8px', backgroundColor: BACKGROUND_CARD, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                            {renderActiveChart(activeChartKey, colmenaSensorData)}
                                        </div>

                                    </>
                                ) : (
                                    <p style={{color: STATUS_DANGER}}>No se encontraron datos de sensores o la colmena no está disponible para el rango seleccionado.</p>
                                )
                            )}
                            
                            <button
                                style={{...dashboardStyles.actionButton, marginTop: '20px'}}
                                onClick={() => handleColmenaClick(selectedHiveCode)}
                            >
                                Ir a la Página Completa de {selectedHiveCode}
                            </button>
                        </div>
                    </div>
                )}


            </main>

            {/* Modal para el formulario de registro (Se mantiene igual) */}
            {showForm && (
                <div style={dashboardStyles.formModal}>
                    <div style={dashboardStyles.formContent}>
                        <CloseModalButton onClose={() => setShowForm(false)} /> 
                        <ColmenaForm onColmenaRegistered={handleColmenaRegistered} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------
// COMPONENTE AUXILIAR DEL BOTÓN DE CIERRE (Se mantiene igual)
// ----------------------------------------------------
const CloseModalButton = ({ onClose }) => {
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
// src/pages/MisColmenas.jsx (CÓDIGO FINAL CON CARGA ASÍNCRONA DE DETALLES PARA EDICIÓN)
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx'; 
import AuthContext from '../context/AuthContext.jsx'; 
import ColmenaForm from '../components/ColmenaForm'; 
import EditHiveModal from '../components/EditHiveModal.jsx'; 
import { getColmenasByUserId, getHiveDetailsByCode } from '../api/colmenaService'; 

// 🚨 IMPORTACIÓN DE ICONOS (Lucide React - Asumimos instalación)
import { Maximize, PlusCircle, Menu, X, Edit2, Package } from 'lucide-react'; 
import { FaHome, FaThermometerHalf, FaTint, FaExclamationTriangle } from 'react-icons/fa'; // Fallback

// --- Constantes de Diseño y Paleta ---
const PRIMARY_HONEY = '#D97706';     
const ACCENT_ORANGE = '#F6AD55';     
const BACKGROUND_LIGHT = '#FAFAFA';  
const TEXT_DARK = '#374151';         
const TEXT_MUTED = '#6B7280';        
const BORDER_LIGHT = '#E5E7EB';      
const STATUS_DANGER = '#EF4444';     
const STATUS_INFO = '#3B82F6';       
const MOBILE_BREAKPOINT = 768; 
const SIDEBAR_WIDTH = 250; 
const CONTENT_MARGIN = 30; 

// --- Estilos Base (Copiados y adaptados del Dashboard) ---
const styles = {
    mainContainer: { display: 'flex', minHeight: '100vh', backgroundColor: BACKGROUND_LIGHT, fontFamily: 'Inter, sans-serif' },
    mainContent: (isSidebarOpen, isMobile) => ({ 
        flexGrow: 1, padding: `${CONTENT_MARGIN}px`, overflowY: 'auto',
        transition: 'margin-left 0.3s ease',
        marginLeft: (isSidebarOpen && !isMobile) ? `${SIDEBAR_WIDTH + CONTENT_MARGIN}px` : CONTENT_MARGIN,
    }),
    title: { fontSize: '2.5rem', color: TEXT_DARK, marginBottom: '10px', fontWeight: 'extrabold' },
    subtitle: { fontSize: '1rem', color: TEXT_MUTED, marginBottom: '30px' },
    sectionTitle: { fontSize: '1.8rem', color: TEXT_DARK, fontWeight: 'bold', marginBottom: '20px', paddingBottom: '10px', borderBottom: `1px solid ${BORDER_LIGHT}`, },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px', marginBottom: '40px' },
    card: { backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', border: `1px solid ${BORDER_LIGHT}`, transition: 'all 0.3s ease' },
    colmenaCard: { 
        backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        borderLeft: `5px solid ${PRIMARY_HONEY}`, cursor: 'pointer', transition: 'all 0.2s ease', 
        position: 'relative', 
    },
    colmenaCode: { fontSize: '1.5rem', color: PRIMARY_HONEY, fontWeight: 'extrabold', marginBottom: '5px' },
    actionButton: { 
        padding: '12px 25px', backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', 
        borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
        transition: 'background-color 0.2s ease, transform 0.1s', 
    },
    formModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, overflowY: 'auto', padding: '20px 0', }, 
    formContent: {
        backgroundColor: 'white', padding: '30px', borderRadius: '12px', position: 'relative', 
        maxWidth: '650px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
        maxHeight: '90vh', overflowY: 'auto', 
    },
    closeButtonWrapper: { position: 'absolute', top: '15px', right: '15px', zIndex: 10, width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background-color 0.2s' },
    closeIcon: { fontSize: '24px', color: TEXT_MUTED, transition: 'color 0.2s', lineHeight: 1 },
    cardControlGroup: { 
        position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px', zIndex: 5,
    },
    // Estilo para el botón de Apertura (☰)
    toggleButton: {
        position: 'fixed', top: '20px', left: '20px', zIndex: 1001, backgroundColor: PRIMARY_HONEY, color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s',
    },
};

// Componente auxiliar para el botón de cierre del Modal
const CloseModalButton = ({ onClose }) => {
    const [isHovered, setIsHovered] = useState(false);
    const IconX = X; 

    return (
        <div 
            onClick={onClose}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                ...styles.closeButtonWrapper,
                backgroundColor: isHovered ? BORDER_LIGHT : 'transparent', 
            }}
        >
            <IconX size={24} style={{...styles.closeIcon, color: isHovered ? PRIMARY_HONEY : TEXT_MUTED }} title="Cerrar formulario" />
        </div>
    );
};


function MisColmenas() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); 

    const [colmenas, setColmenas] = useState([]); 
    const [isLoadingData, setIsLoadingData] = useState(true); 
    const [dataError, setDataError] = useState(''); 
    const [showForm, setShowForm] = useState(false); 
    const [hiveToEdit, setHiveToEdit] = useState(null); 
    
    const [selectedMenu, setSelectedMenu] = useState('hives');
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > MOBILE_BREAKPOINT);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Lógica de Responsividad (mantenida)
    useEffect(() => {
        const handleResize = () => {
            const isCurrentlyMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            setIsMobile(isCurrentlyMobile);
            if (!isCurrentlyMobile && !isSidebarOpen) { setIsSidebarOpen(true); } 
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
    
    // FUNCIÓN DE MANEJO DE REGISTRO
    const handleColmenaRegistered = () => {
        setShowForm(false); 
        fetchColmenas(); 
    };

    // NAVEGACIÓN A DETALLE
    const handleColmenaClick = (hiveCode) => {
        navigate(`/app/colmena/${hiveCode}`); 
    };

    // 🚨 FUNCIÓN CRÍTICA: CARGA ASÍNCRONA DE DETALLES ANTES DE EDITAR
    const handleEditClick = async (colmena) => {
        setIsLoadingData(true); 
        setDataError('');

        try {
            // 1. OBTENER LOS DETALLES COMPLETOS (Incluye selectedSensors)
            const fullHiveDetails = await getHiveDetailsByCode(colmena.hive_code); 
            console.log("Sensores recibidos para edición (Claves):", fullHiveDetails.selectedSensors);
            // 2. Abrir el modal con los datos completos
            setHiveToEdit({
                ...fullHiveDetails,
                // Mantenemos el nombre 'selectedSensors' que el modal espera
                selectedSensors: fullHiveDetails.selectedSensors || [] 
            });
            
        } catch (error) {
            setDataError(`Error al cargar detalles de la colmena: ${error.message}`);
            setHiveToEdit(null); // Aseguramos que el modal no se abra
        } finally {
            setIsLoadingData(false);
        }
    };
    
    // Estilos dinámicos
    const dynamicMainContentStyle = styles.mainContent(isSidebarOpen, isMobile);
    const ToggleIconComponent = Menu; 
    const MaximizeIcon = Maximize;
    const EditIcon = Edit2;


    return (
        <div style={styles.mainContainer}> 
            
            {/* Botón de Apertura Fijo */}
            {!isSidebarOpen && (
                 <button style={styles.toggleButton} onClick={toggleSidebar} title={'Mostrar menú'}>
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
                <h1 style={styles.title}>
                    Mis Colmenas Registradas
                </h1>
                <p style={styles.subtitle}>
                    Aquí puedes registrar nuevos monitores y acceder a los datos detallados de cada colmena.
                </p>

                {/* -------------------------------------------------------- */}
                {/* LISTA DE COLMENAS Y BOTÓN DE REGISTRO */}
                {/* -------------------------------------------------------- */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={styles.sectionTitle}>
                        Monitores Activos ({colmenas.length})
                    </h2>
                    
                    <button 
                        style={styles.actionButton} 
                        onClick={() => setShowForm(true)}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT_ORANGE; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = PRIMARY_HONEY; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <PlusCircle size={18} style={{ marginRight: '8px' }} />
                        Registrar Nuevo Monitor
                    </button>
                </div>
                
                {dataError && <p style={{ color: STATUS_DANGER, marginBottom: '15px' }}>Error: {dataError}</p>} 
                
                {isLoadingData ? (
                    <div style={{...styles.card, borderLeft: `5px solid ${STATUS_INFO}`}}><p style={{color: TEXT_MUTED}}>Cargando lista de colmenas...</p></div>
                ) : colmenas.length === 0 ? (
                    <div style={{...styles.card, borderLeft: `5px solid ${STATUS_INFO}`}}> 
                        <p style={{ color: TEXT_MUTED, margin: 0 }}>
                            **Información:** Aún no tienes monitores registrados. Usa el botón **"Registrar Nuevo Monitor"** para comenzar.
                        </p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {colmenas.map((colmena) => (
                            <div 
                                key={colmena.id} 
                                style={styles.colmenaCard}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.15)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
                            >
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                                    <p style={styles.colmenaCode}>{colmena.hive_code}</p>
                                    
                                    {/* 🚨 GRUPO DE BOTONES DE CONTROL */}
                                    <div style={styles.cardControlGroup}>
                                        {/* BOTÓN DE EDICIÓN */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(colmena); }} 
                                            title="Editar Colmena"
                                            style={{ background: 'none', border: 'none', color: PRIMARY_HONEY, cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = ACCENT_ORANGE}
                                            onMouseLeave={(e) => e.currentTarget.style.color = PRIMARY_HONEY}
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        
                                        {/* BOTÓN DE VER DATA (Navegación al detalle) */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleColmenaClick(colmena.hive_code); }}
                                            title="Ver Datos"
                                            style={{ background: 'none', border: 'none', color: TEXT_MUTED, cursor: 'pointer', transition: 'color 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = TEXT_DARK}
                                            onMouseLeave={(e) => e.currentTarget.style.color = TEXT_MUTED}
                                        >
                                            <Maximize size={20} />
                                        </button>
                                    </div>
                                    
                                </div>
                                <p style={{ color: TEXT_MUTED, marginBottom: '10px' }}> 
                                    {colmena.description || 'Colmena sin descripción.'}
                                </p>
                                <small style={{ color: TEXT_MUTED, fontSize: '0.85rem' }}> 
                                    Registrada: {new Date(colmena.created_at).toLocaleDateString()}
                                </small>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal para el formulario de REGISTRO */}
            {showForm && (
                <div style={styles.formModal}>
                    <div style={styles.formContent}>
                        <CloseModalButton onClose={() => setShowForm(false)} /> 
                        <ColmenaForm onColmenaRegistered={handleColmenaRegistered} />
                    </div>
                </div>
            )}
            
            {/* 🚨 MODAL DE EDICIÓN/ELIMINACIÓN */}
            {hiveToEdit && (
                <div style={styles.formModal}>
                    <div style={styles.formContent}>
                        <CloseModalButton onClose={() => setHiveToEdit(null)} /> 
                        <EditHiveModal 
                            colmena={hiveToEdit}
                            onClose={() => setHiveToEdit(null)}
                            onHiveUpdated={fetchColmenas} // Recarga la lista después de Guardar/Eliminar
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default MisColmenas;
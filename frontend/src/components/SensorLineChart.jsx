// src/components/SensorLineChart.jsx (NUEVO ARCHIVO)
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SensorLineChart = ({ historyData, sensorKey, title, unit, multiSensorKeys = [], color = '#3B82F6' }) => {
    // Si se pasan múltiples claves (para giroscopio/acelerómetro), las usamos
    // De lo contrario, usamos la clave única del sensor
    const keysToChart = multiSensorKeys.length > 0 ? multiSensorKeys : [sensorKey];

    const labels = historyData.length > 0
        ? [...new Set(historyData.map(item => new Date(item._time).toLocaleString()))]
        : [];

    const datasets = keysToChart.map((key, index) => {
        const dataForSensor = labels.map(label => {
            const entry = historyData.find(item =>
                new Date(item._time).toLocaleString() === label && item._measurement === key
            );
            return entry ? entry._value : null; // Usa null para valores faltantes para romper la línea
        });

        // Generar un color diferente si hay múltiples líneas en el mismo gráfico
        const dynamicColor = multiSensorKeys.length > 1
            ? `hsl(${index * 60}, 70%, 50%)` // HSL para variación
            : color;

        return {
            label: key.replace(/_/g, ' ') + (unit ? ` (${unit})` : ''),
            data: dataForSensor,
            borderColor: dynamicColor,
            backgroundColor: dynamicColor.replace('rgb', 'rgba').replace(')', ', 0.2)'), // Color más claro para el área bajo la línea
            tension: 0.3, // Curvatura de la línea
            pointRadius: 1, // Tamaño de los puntos
        };
    });

    const chartData = {
        labels: labels,
        datasets: datasets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Importante para controlar el tamaño
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e0e0e0', // Color del texto de la leyenda
                }
            },
            title: {
                display: true,
                text: title,
                color: '#e0e0e0', // Color del título
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Tiempo',
                    color: '#a0a0a0', // Color del título del eje X
                },
                ticks: {
                    color: '#a0a0a0', // Color de las etiquetas del eje X
                    maxRotation: 45,
                    minRotation: 45,
                    callback: function(value, index, values) {
                        // Muestra solo algunas etiquetas si hay muchas
                        if (index % Math.ceil(labels.length / 7) !== 0) return '';
                        return value;
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Color de las líneas de la cuadrícula
                },
            },
            y: {
                title: {
                    display: true,
                    text: unit,
                    color: '#a0a0a0', // Color del título del eje Y
                },
                ticks: {
                    color: '#a0a0a0', // Color de las etiquetas del eje Y
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)', // Color de las líneas de la cuadrícula
                },
            },
        },
    };

    if (!historyData || historyData.length === 0) {
        return <p style={{ color: '#a0a0a0' }}>No hay datos disponibles para {title} en este rango.</p>;
    }

    return (
        <div style={{ height: '300px', width: '100%' }}> {/* Contenedor para el gráfico */}
            <Line data={chartData} options={options} />
        </div>
    );
};

export default SensorLineChart;
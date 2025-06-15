import React from 'react';

/**
 * Simple Progress Chart Component
 * Visualizza un grafico di progresso minimalista senza dipendenze esterne
 */
const ProgressChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="progress-chart-empty" style={{ height }}>
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="progress-chart" style={{ height }}>
      <h4 className="chart-title">{title}</h4>
      <div className="chart-container">
        <svg width="100%" height={height - 50} viewBox={`0 0 400 ${height - 50}`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="40"
              y1={((100 - y) / 100) * (height - 80) + 20}
              x2="380"
              y2={((100 - y) / 100) * (height - 80) + 20}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map(y => (
            <text
              key={y}
              x="35"
              y={((100 - y) / 100) * (height - 80) + 25}
              fontSize="12"
              fill="#64748b"
              textAnchor="end"
            >
              {y}%
            </text>
          ))}
          
          {/* Progress line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((d, i) => {
              const x = 40 + (i / (data.length - 1)) * 340;
              const y = ((maxValue - d.value) / range) * (height - 80) + 20;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((d, i) => {
            const x = 40 + (i / (data.length - 1)) * 340;
            const y = ((maxValue - d.value) / range) * (height - 80) + 20;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % Math.ceil(data.length / 5) === 0) {
              const x = 40 + (i / (data.length - 1)) * 340;
              return (
                <text
                  key={i}
                  x={x}
                  y={height - 25}
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              );
            }
            return null;
          })}
        </svg>
      </div>
    </div>
  );
};

/**
 * Simple Bar Chart Component
 */
const BarChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bar-chart-empty" style={{ height }}>
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bar-chart" style={{ height }}>
      <h4 className="chart-title">{title}</h4>
      <div className="chart-container">
        <svg width="100%" height={height - 50} viewBox={`0 0 400 ${height - 50}`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="40"
              y1={((100 - y) / 100) * (height - 80) + 20}
              x2="380"
              y2={((100 - y) / 100) * (height - 80) + 20}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Bars */}
          {data.map((d, i) => {
            const barWidth = 280 / data.length - 10;
            const x = 50 + i * (280 / data.length);
            const barHeight = (d.value / maxValue) * (height - 80);
            const y = height - 60 - barHeight;
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#3b82f6"
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  fontSize="12"
                  fill="#374151"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {d.value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - 35}
                  fontSize="12"
                  fill="#64748b"
                  textAnchor="middle"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

/**
 * Donut Chart Component
 */
const DonutChart = ({ data, title, size = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="donut-chart-empty" style={{ width: size, height: size }}>
        <p>Nessun dato disponibile</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  let cumulativePercentage = 0;
  const radius = size * 0.3;
  const innerRadius = radius * 0.6;
  const center = size / 2;

  return (
    <div className="donut-chart" style={{ width: size, height: size }}>
      <h4 className="chart-title">{title}</h4>
      <svg width={size} height={size}>
        {data.map((d, i) => {
          const percentage = (d.value / total) * 100;
          const startAngle = (cumulativePercentage / 100) * 2 * Math.PI - Math.PI / 2;
          const endAngle = ((cumulativePercentage + percentage) / 100) * 2 * Math.PI - Math.PI / 2;
          
          const x1 = center + radius * Math.cos(startAngle);
          const y1 = center + radius * Math.sin(startAngle);
          const x2 = center + radius * Math.cos(endAngle);
          const y2 = center + radius * Math.sin(endAngle);
          
          const x3 = center + innerRadius * Math.cos(endAngle);
          const y3 = center + innerRadius * Math.sin(endAngle);
          const x4 = center + innerRadius * Math.cos(startAngle);
          const y4 = center + innerRadius * Math.sin(startAngle);
          
          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${x3} ${y3}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
            'Z'
          ].join(' ');
          
          cumulativePercentage += percentage;
          
          return (
            <path
              key={i}
              d={pathData}
              fill={colors[i % colors.length]}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
        
        {/* Center text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#1a202c"
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          fontSize="12"
          fill="#64748b"
        >
          Totale
        </text>
      </svg>
      
      {/* Legend */}
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="legend-label">{d.label}</span>
            <span className="legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ProgressChart, BarChart, DonutChart };

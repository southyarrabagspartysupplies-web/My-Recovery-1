import React from 'react';
import { motion } from 'framer-motion';

const SimpleLineChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const width = 320;
  const height = 180;
  const padding = { top: 20, right: 10, bottom: 30, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value for scaling
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const yScale = chartHeight / maxCount;
  const xScale = chartWidth / (data.length - 1 || 1);

  // Generate path for line
  const linePath = data
    .map((point, i) => {
      const x = padding.left + (i * xScale);
      const y = padding.top + chartHeight - (point.count * yScale);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate area path (filled area under line)
  const areaPath = `${linePath} L ${padding.left + chartWidth} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  // Get day labels (every 3rd day)
  const getDateLabel = (dateStr, index) => {
    if (index % 3 !== 0) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="mx-auto">
        {/* Grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = padding.top + (chartHeight / 4) * i;
          return (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={padding.left + chartWidth}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area under line */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 0.5 }}
          d={areaPath}
          fill="#F5F5F5"
        />

        {/* Line */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          d={linePath}
          fill="none"
          stroke="#F5F5F5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, i) => {
          const x = padding.left + (i * xScale);
          const y = padding.top + chartHeight - (point.count * yScale);
          return (
            <motion.g key={`point-${i}`}>
              <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                cx={x}
                cy={y}
                r="4"
                fill="#F5F5F5"
                stroke="#0F1115"
                strokeWidth="2"
              />
              {/* Show count on hover */}
              {point.count > 0 && (
                <text
                  x={x}
                  y={y - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(255,255,255,0.6)"
                  fontWeight="600"
                >
                  {point.count}
                </text>
              )}
            </motion.g>
          );
        })}

        {/* X-axis labels */}
        {data.map((point, i) => {
          const label = getDateLabel(point.date, i);
          if (!label) return null;
          const x = padding.left + (i * xScale);
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fontSize="10"
              fill="rgba(255,255,255,0.4)"
            >
              {label}
            </text>
          );
        })}

        {/* Y-axis labels */}
        {[0, Math.ceil(maxCount / 2), maxCount].map((value, i) => {
          const y = padding.top + chartHeight - (value * yScale);
          return (
            <text
              key={`y-${i}`}
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgba(255,255,255,0.4)"
            >
              {value}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default SimpleLineChart;

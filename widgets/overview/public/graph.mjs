'use strict';
import { getPriceColor } from './colors.mjs';
import { getCurrentHourKey, dateIsToday } from './utils.mjs';

const { createElement } = React;
const {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  ReferenceLine,
  ReferenceArea,
} = window.Recharts;

const html = htm.bind(createElement);

function calculateEstimatedHourlyUsage(currentUsage) {
  const minutesIntoHour = new Date().getMinutes();
  // Avoid division by zero and handle edge cases
  if (minutesIntoHour === 0) return currentUsage;
  // Extrapolate the usage for full hour
  return (currentUsage / minutesIntoHour) * 60;
}

export function Graph({
  data,
  activeDate,
  dailyAverage,
  dailyPriceVariation,
  minPrice,
}) {
  const hourNow = getCurrentHourKey();
  const isToday = dateIsToday(activeDate);

  const calulatedHourlyUsage = calculateEstimatedHourlyUsage(
    data.find((d) => d.time === hourNow)?.usageHomey || 0,
  );

  const PriceDot = (props) => {
    const { cx, cy, value } = props;

    const color = getPriceColor(value, minPrice, dailyPriceVariation);

    return html`<svg
      x=${cx - 5}
      y=${cy - 5}
      width=${10}
      height=${10}
      viewBox="0 0 100 100"
    >
      <circle
        cx="50"
        cy="50"
        r="42.5"
        fill=${color}
        stroke="var(--homey-color-white)"
        strokeWidth=${10}
      />
    </svg>`;
  };

  return html`
      <${ResponsiveContainer} width="100%" height=${200} className="power-chart">
        <${ComposedChart} data=${data}>

        <defs>
          <pattern
            id="diagonalStripes"
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
            patternTransform="rotate(45)"
          >
            <rect width="2" height="4" fill="transparent" />
            <rect x="2" width="2" height="4" fill="var(--homey-color-blue-100)" />
          </pattern>
        </defs>

          <${CartesianGrid} 
            strokeDasharray="3 2"
            stroke="var(--homey-color-mono-200)"
            vertical=${true}
            horizontalPoints=${[45, 75, 105, 135]} 
          />

          <${ReferenceLine}
            yAxisId="left"
            y=${dailyAverage}
            stroke="var(--homey-color-orange-500)" 
            strokeDasharray="3 3"
          />

          <${Bar} 
            yAxisId="right"
            dataKey="usageHomey" 
            barSize="100%"
            fill="var(--homey-color-blue-300)"
            isAnimationActive=${false}
          />

          ${
            isToday
              ? html`<${ReferenceArea}
                    yAxisId="right"
                    x1=${hourNow}
                    x2=${hourNow}
                    y2=${calulatedHourlyUsage}
                    fill="url(#diagonalStripes)"
                    strokeWidth=${0}
                  />
                  <${ReferenceArea}
                    yAxisId="right"
                    x1=${hourNow}
                    x2=${hourNow}
                    fill="transparent"
                    strokeWidth=${1}
                    stroke="var(--homey-color-blue-100)"
                    strokeDasharray="2 2"
                  />`
              : null
          }

          <${Line} 
            yAxisId="left"
            dataKey="price" 
            stroke="var(--homey-color-white)" 
            strokeWidth=${3} 
            dot=${PriceDot}
            isAnimationActive=${false} 
          />

          <${YAxis} 
            type="number" 
            orientation="right" 
            yAxisId="right" 
            padding=${{ top: 40, right: 0 }}
            tick=${{ fill: 'var(--homey-text-color-light)' }} 
            tickFormatter=${(value) => `${value}`}
            width=${20}
            label=${{ value: 'kW', position: 'insideTopLeft' }}

          />

          <${YAxis} 
            type="number" 
            orientation="left" 
            yAxisId="left"
            tick=${{ fill: 'var(--homey-text-color-light)' }} 
            tickFormatter=${(value) => `${value}`}
            padding=${{ top: 40 }}
            width=${30}
            label=${{ value: 'øre', position: 'insideTopRight' }}
          />

          <${XAxis} 
            dataKey="time" 
            tick=${{ fill: 'var(--homey-text-color-light)' }} 
            ticks=${['00:00', '06:00', '12:00', '18:00', '23:00']}
            padding=${{ left: 10, right: 10 }}
          />
        </${ComposedChart}>
      </${ResponsiveContainer}>
  `;
}

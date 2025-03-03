'use strict';

const { createElement, useState, useEffect } = React;
const { XAxis, YAxis, ResponsiveContainer, Bar, BarChart, Legend, LabelList } =
  window.Recharts;

const html = htm.bind(createElement);

export function BarGraph({ Homey, dailyCost }) {
  const [usage, setUsage] = useState({
    heat: null,
    vvb: null,
    other: null,
    unknown: null,
  });

  // Calculate percentage distribution based on usage and dailyCost
  const distributedData = [
    {
      name: 'Forbruk',
      // Default to 0 if values are null or dailyCost is 0
      heat: 0,
      vvb: 0,
      other: 0,
      unknown: 0,
    },
  ];

  // Only calculate percentages if dailyCost exists
  if (dailyCost) {
    const data = distributedData[0];
    const categories = ['heat', 'vvb', 'other'];

    // Calculate percentages for known categories
    let totalPercentage = 0;

    categories.forEach((category) => {
      if (usage[category] != null) {
        data[category] = Math.round((usage[category] / dailyCost) * 100);
        totalPercentage += data[category];
      }
    });

    // Calculate unknown as the remaining percentage
    data.unknown = Math.max(0, 100 - totalPercentage);
  }

  // Effect for usage distribution
  useEffect(() => {
    // Initial call
    const fetchData = () => {
      if (Homey) {
        Homey.api('GET', `/usage-distribution`, {})
          .then((usage) => {
            if (!usage) {
              return;
            }
            setUsage(usage);
          })
          .catch(console.error);
      }
    };

    fetchData(); // Call immediately

    // Set up interval
    const interval = setInterval(fetchData, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [Homey]);

  const customLegendFormatter = (value) => {
    return html`<span style=${{ color: 'var(--homey-color-white)' }}
      >${value}</span
    >`;
  };

  const valueAccessor = (dataKey) => (entry) => {
    return entry[dataKey];
  };

  // Function to conditionally render LabelList based on value threshold
  const renderLabelList = (dataKey) => {
    const value = distributedData[0][dataKey];
    // Only render LabelList if value is 7% or higher
    // This is because the graph gets to crowded with less than 7%
    if (value >= 7) {
      return html`
        <${LabelList}
          position="center"
          formatter=${(value) => `${value}%`}
          valueAccessor=${valueAccessor(dataKey)}
          fill="var(--homey-color-white)"
        />
      `;
    }
    return null;
  };

  return html`
      <p class="power-headline-text">Fordeling</p>
      <${ResponsiveContainer} width="100%" height=${80} className="power-chart">
        <${BarChart} data=${distributedData} layout="vertical">
          <${XAxis} type="number" hide />
          <${YAxis} type="category" dataKey="name" hide />
          <${Legend} formatter=${customLegendFormatter} verticalAlign="top" align="left" iconSize=${10} />
          <${Bar} dataKey="heat" name="Varme" stackId="a" fill="var(--homey-color-red-400)">
            ${renderLabelList('heat')}
          </${Bar}>
          <${Bar} dataKey="vvb" name="VVB" stackId="a" fill="var(--homey-color-blue-400)">
            ${renderLabelList('vvb')}
          </${Bar}>
          <${Bar} dataKey="other" name="Annet" stackId="a" fill="var(--homey-color-orange-500)">
            ${renderLabelList('other')}
          </${Bar}>
          <${Bar} dataKey="unknown" name="Ukjent" stackId="a" fill="var(--homey-color-mono-300)">
            ${renderLabelList('unknown')}
          </${Bar}>
        </${BarChart}>
      </${ResponsiveContainer}>
  `;
}

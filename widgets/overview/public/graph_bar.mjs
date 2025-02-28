'use strict';

const { createElement } = React;
const { XAxis, YAxis, ResponsiveContainer, Bar, BarChart, Legend, LabelList } =
  window.Recharts;

const html = htm.bind(createElement);

export function BarGraph() {
  const dataTest = [{ name: 'Kategori 1', heat: 50, vvb: 20, unknown: 30 }];

  const customLegendFormatter = (value) => {
    return html`<span style=${{ color: 'var(--homey-color-white)' }}
      >${value}</span
    >`;
  };

  const valueAccessor = (dataKey) => (entry) => {
    return entry[dataKey];
  };

  return html`
      <p class="power-headline-text">Fordeling</p>
      <${ResponsiveContainer} width="100%" height=${80} className="power-chart">
        <${BarChart} data=${dataTest} layout="vertical">
          <${XAxis} type="number" hide />
          <${YAxis} type="category" dataKey="name" hide />
          <${Legend} formatter=${customLegendFormatter} verticalAlign="top" align="left" iconSize=${10} />
          <${Bar} dataKey="heat" name="Varme" stackId="a" fill="var(--homey-color-red-400)">
            <${LabelList} 
              position="center" 
              formatter=${(value) => `${value}%`}
              valueAccessor=${valueAccessor('heat')}
              fill="var(--homey-color-white)" 
            />
          </${Bar}>
          <${Bar} dataKey="vvb" name="VVB" stackId="a" fill="var(--homey-color-blue-400)">
            <${LabelList} 
              position="center" 
              formatter=${(value) => `${value}%`}
              valueAccessor=${valueAccessor('vvb')}
              fill="var(--homey-color-white)" 
            />
          </${Bar}>
          <${Bar} dataKey="unknown" name="Annet" stackId="a" fill="var(--homey-color-mono-300)">
            <${LabelList} 
              position="center" 
              formatter=${(value) => `${value}%`}
              valueAccessor=${valueAccessor('unknown')}
              fill="var(--homey-color-white)" 
            />
          </${Bar}>
        </${BarChart}>
      </${ResponsiveContainer}>
  `;
}

'use strict';
import { getPriceColor, getBooleanColorScale } from './colors.mjs';

const { createElement } = React;
const html = htm.bind(createElement);

export function Status({
  currentPrice,
  dailyAverage,
  dailyPriceVariation,
  minPrice,
}) {
  // TODO: Handle if not today, then we will not show values here
  // TODO: handle fireplace
  return html`
    <div class="power-grid homey-text-small">
      <${PriceCard}
        value=${currentPrice}
        getFillColor=${(value) => {
          return getPriceColor(value, minPrice, dailyPriceVariation);
        }}
         unit='øre/kWh'
      >
        Akkurat nå
      </${PriceCard}>

      <${PriceCard}
        value=${currentPrice > 160 ? 'Ja' : 'Nei'}
        getFillColor=${(value) => {
          return getBooleanColorScale(value === 'Nei');
        }}
      >
       Fyre i peisen?
      </${PriceCard}>

      <${PriceCard}
        value=${dailyAverage}
         unit='øre/kWh'
      >
        Gjennomsnitt i dag
      </${PriceCard}>

      <${PriceCard}
        value=${dailyPriceVariation}
        unit='øre/kWh'
      >
        Prisen varierer med
      </${PriceCard}>
    </div>
  `;
}

function PriceCard({ children, value, getFillColor, unit }) {
  const valToShow = typeof value === 'number' ? Math.round(value) : value;

  return html`
    <div class="power-card">
      <p>
        ${children}<br />
        <span
          class="power-card__number"
          style=${value && typeof getFillColor === 'function'
            ? { backgroundColor: getFillColor(value) }
            : {}}
        >
          ${valToShow || '-'}
        </span>
        <span class="homey-text-small-light">${unit}</span>
      </p>
    </div>
  `;
}

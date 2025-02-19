'use strict';
import { getPriceColor, getBooleanColorScale } from './colors.mjs';
import { PriceCard } from './card.mjs';

const { createElement } = React;
const html = htm.bind(createElement);

export function Status({
  currentPrice,
  dailyAverage,
  dailyPriceVariation,
  minPrice,
}) {
  /* 
  Fireplace values from https://vedkalkulator.no/Home/ShowMain
  */

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
        value=${currentPrice > 145 ? 'Ja' : 'Nei'}
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

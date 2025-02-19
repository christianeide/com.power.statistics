'use strict';

const { createElement } = React;
const html = htm.bind(createElement);

export function PriceCard({ children, value, getFillColor, unit }) {
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
          ${valToShow ?? '-'}
        </span>
        <span class="homey-text-small-light">${unit}</span>
      </p>
    </div>
  `;
}

'use strict';
import { Graph } from './graph.mjs';
import { Status } from './status.mjs';
import { Bill } from './bill.mjs';
import { LineIcon, BarIcon } from './icons.mjs';
import {
  getHourKey,
  dateIsToday,
  dateIsTomorrow,
  calculateTotalPrice,
} from './utils.mjs';

const { createElement, useState, useEffect } = React;

const { render } = ReactDOM;
const html = htm.bind(createElement);

function getPowerPrices(date) {
  return new Promise((resolve, reject) => {
    const dateString = date
      .toLocaleDateString('no', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .split('.');

    fetch(
      `https://www.hvakosterstrommen.no/api/v1/prices/${dateString[2]}/${dateString[1]}-${dateString[0]}_NO1.json`,
    )
      .then((res) => {
        if (!res.ok) {
          return reject(res.statusText);
        }

        res.json().then((prices) => {
          const parsedPrices = prices.map((entity) => {
            return {
              value: entity.NOK_per_kWh * 1.25 * 100,
              time: entity.time_start,
            };
          });

          resolve(parsedPrices);
        });
      })
      .catch(reject);
  });
}

function WidgetApp() {
  const [activeDate, setActiveDate] = useState(new Date());
  const [prices, setPrices] = useState([]);
  const [settingsUsage, setSettingsUsage] = useState([]);
  const [Homey, setHomey] = useState(null);
  const [showSubsidy, setShowSubsidy] = useState(true);

  useEffect(() => {
    window.onHomeyReady = (homeyInstance) => {
      setHomey(homeyInstance);
      homeyInstance.ready();
    };

    // Cleanup
    return () => {
      window.onHomeyReady = undefined;
    };
  }, []);

  // Effect for power prices - runs only when activeDate changes
  useEffect(() => {
    getPowerPrices(activeDate).then(setPrices).catch(console.error);
  }, [activeDate]);

  // Effect to check and update activeDate every 5 minutes if not today
  // This is used to update the date after midnight, as well as to reset the date
  // after a give time
  useEffect(() => {
    const checkAndUpdateDate = () => {
      if (!dateIsToday(activeDate)) {
        setActiveDate(new Date());
      }
    };

    const interval = setInterval(checkAndUpdateDate, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeDate]);

  // Effect for power usage - runs every 30 seconds
  useEffect(() => {
    // Initial call
    const fetchData = () => {
      if (Homey) {
        const dateKey = activeDate.toLocaleDateString('en-GB');
        Homey.api('GET', `/?date=${dateKey}`, {})
          .then((data) => {
            if (!data) {
              return setSettingsUsage([]);
            }
            setSettingsUsage(data);
          })
          .catch(console.error);
      }
    };

    fetchData(); // Call immediately

    // Set up interval
    const interval = setInterval(fetchData, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [activeDate, Homey]);

  const completeDataSet = Array.from(Array(24)).map((_, i) => {
    const time = getHourKey(i);

    const { originalPrice, subsidyPrice } = calculateTotalPrice(
      prices[i]?.value || 0,
    );
    return {
      time,
      originalPrice,
      price: showSubsidy ? subsidyPrice : originalPrice,
      usageHomey:
        settingsUsage.find((entry) => entry?.time === time)?.usage || 0,
    };
  });

  // Calculate all price-related values in a single prices.reduce
  const priceStats = completeDataSet.reduce(
    (stats, current) => {
      // Sum for average
      stats.sum += current.price;

      // Track max and min
      if (!stats.max || current.price > stats.max.price) stats.max = current;
      if (!stats.min || current.price < stats.min.price) stats.min = current;

      // Track current hour price
      const currentHour = new Date().getHours();
      if (current.time === getHourKey(currentHour)) {
        stats.current = current;
      }

      return stats;
    },
    { sum: 0, max: null, min: null, current: null },
  );

  const maxPrice = priceStats.max?.price || 0;
  const minPrice = priceStats.min?.price || 0;
  const dailyAverage = Math.round(priceStats.sum / 24);
  const dailyPriceVariation =
    maxPrice && minPrice ? Math.round(maxPrice - minPrice) : 0;
  const currentPrice = priceStats.current?.price || 0;

  return html`
    <div class="power-wrapper">
      <div class="power-legends">
        <div class="homey-text-small power-legends__item">
          Pris
          <${LineIcon} />
        </div>
        <div class="homey-text-small power-legends__nav">
          <button
            class="power-legends__nav-button power-legends__nav-button--left"
            onClick=${() =>
              setActiveDate(
                new Date(
                  new Date(activeDate).setDate(activeDate.getDate() - 1),
                ),
              )}
          >
            ${'<'}
          </button>

          ${dateIsToday(activeDate) ? 'I dag' : activeDate.toLocaleDateString()}
          <button
            class="power-legends__nav-button"
            onClick=${() =>
              setActiveDate(
                new Date(
                  new Date(activeDate).setDate(activeDate.getDate() + 1),
                ),
              )}
            disabled=${dateIsTomorrow(activeDate)}
          >
            ${'>'}
          </button>
        </div>
        <div class="homey-text-small power-legends__item">
          <${BarIcon} />
          Forbruk</div
        >
      </div>

      <${Graph}
        data=${completeDataSet}
        activeDate=${activeDate}
        dailyPriceVariation=${dailyPriceVariation}
        minPrice=${minPrice}
      />

      <${Status}
        currentPrice=${currentPrice}
        dailyAverage=${dailyAverage}
        dailyPriceVariation=${dailyPriceVariation}
        minPrice=${minPrice}
      />

      <p class="power-headline-text">
        Regning

        <label class="power-headline-text__label">
          <input
            type="checkbox"
            class="power-headline-text__input"
            checked=${showSubsidy}
            onChange=${() => setShowSubsidy(!showSubsidy)}
          />
          Strømstøtte
        </label>
      </p>

      <${Bill} Homey=${Homey} completeDataSet=${completeDataSet} />
    </div>
  `;
}

render(html`<${WidgetApp} />`, document.getElementById('app'));

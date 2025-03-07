'use strict';
import { getPriceColor, getBooleanColorScale } from './colors.mjs';
import { PriceCard } from './card.mjs';
import { calculateDailyCost } from './utils.mjs';
const { createElement, useState, useEffect } = React;
const html = htm.bind(createElement);

export function Bill({ Homey, completeDataSet, dailyCost }) {
  // TODO: Consider calulating monthly cost based on daily costs instead
  const [monthlyCost, setMonthlyCost] = useState(0);

  // Effect for bill cost
  useEffect(() => {
    // Initial call
    const fetchData = () => {
      if (Homey) {
        Homey.api('GET', `/bill-cost`, {})
          .then((costs) => {
            if (!costs) {
              return;
            }
            setMonthlyCost(costs);
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

  const savedToday = () => {
    // Normal usage profile in percentages for each hour
    // This profile is not science, but best guess based on online resources
    const normalUsageProfile = {
      '00': 1.25, // 1/80 * 100
      '01': 1.25,
      '02': 1.25,
      '03': 1.25,
      '04': 1.25,
      '05': 2.5, // 2/80 * 100
      '06': 5, // 4/80 * 100
      '07': 7.5, // 6/80 * 100
      '08': 5.0,
      '09': 2.5,
      10: 1.25,
      11: 1.25,
      12: 1.25,
      13: 1.25,
      14: 2.5,
      15: 7.5, // 6/80 * 100
      16: 10, // 8/80 * 100
      17: 12.5, // 10/80 * 100
      18: 10,
      19: 8.75, // 7/80 * 100
      20: 7.5,
      21: 5,
      22: 2.5,
      23: 1.25,
    };

    // Calculate total actual usage for the day
    const totalUsage = completeDataSet.reduce(
      (sum, hour) => sum + hour.usageHomey,
      0,
    );

    // Calculate cost with normal usage distribution
    const costWithNormalUsage = completeDataSet.reduce((sum, hour) => {
      const hourKey = hour.time.substring(0, 2);
      // Calculate expected usage for this hour based on the normal profile
      const expectedUsage = totalUsage * (normalUsageProfile[hourKey] / 100);
      const hourCost = expectedUsage * (hour.price / 100);
      return sum + hourCost;
    }, 0);

    const actualDailyCost = dailyCost;
    // Return difference between normal usage cost and actual cost
    return Math.ceil(costWithNormalUsage - actualDailyCost);
  };

  return html`
   <div class="power-grid homey-text-small">
      <${PriceCard}
        value=${Math.round(dailyCost)}
        getFillColor=${(value) => {
          return getPriceColor(value, 0, 145);
        }}
         unit='kr'
      >
        I dag
      </${PriceCard}>

      <${PriceCard}
        value=${monthlyCost}
        unit='kr'
      >
        Denne måneden
      </${PriceCard}>

      <${PriceCard}
        value=${savedToday()}
        unit='kr'
        getFillColor=${(value) => {
          return getBooleanColorScale(value > 0);
        }}
      >
        Spart i dag
      </${PriceCard}>
      
    </div>
  `;
}

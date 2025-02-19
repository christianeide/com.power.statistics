'use strict';
import type Homey from 'homey/lib/Homey.d.ts';

export default {
  async getUsageLogs({
    homey,
    query,
  }: {
    homey: Homey;
    query: { date: string };
  }) {
    try {
      const logs = await homey.settings.get(query.date);
      homey.log('api return:', logs);

      return logs;
    } catch (error) {
      homey.log('api error:', error);

      return null;
    }
  },
  async getBillCost({ homey }: { homey: Homey }) {
    try {
      const dailyCost = await homey.settings.get('dailyCost');
      const monthlyCost = await homey.settings.get('monthlyCost');

      return { dailyCost, monthlyCost };
    } catch (error) {
      homey.log('api error:', error);

      return null;
    }
  },
};

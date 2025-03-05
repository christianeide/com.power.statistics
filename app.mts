import Homey from 'homey';
import { HomeyAPI } from 'homey-api';

interface EnergyEntry {
  time: string;
  usage: number;
}

export default class PowerStatistics extends Homey.App {
  lastConsumptionUpdate: number | null = null;
  insightsLog: Homey.InsightsLog | null = null;
  homeyApi: HomeyAPI | null = null;
  /**
   * onInit is called when the app is initialized.
   */
  override async onInit() {
    process.env.TZ = this.homey.clock.getTimezone();

    // Get or create insights log
    try {
      this.insightsLog = await this.homey.insights.getLog('energyusage');
    } catch (error) {
      // Create log if it doesn't exist
      this.insightsLog = await this.homey.insights.createLog('energyusage', {
        title: 'Energy usage',
        type: 'number',
        units: 'kWh',
        decimals: 10,
      });
    }
    // await this.homey.insights.deleteLog(insightsLog);

    this.homeyApi = await HomeyAPI.createAppAPI({
      homey: this.homey,
    });

    this.homey.flow
      .getActionCard('update-energy-usage')
      .registerRunListener((args) => this.handleUpdateEnergyUsage(args));
  }

  async handleUpdateEnergyUsage(args: { effect: number }) {
    const timeNow = new Date();

    const usage = await this.getEnergyUsage(args.effect, timeNow);
    this.log('usage:', usage);

    // Skip if usage is 0
    if (!usage) {
      return;
    }

    // Generate date key for settings storage. Use common en-GB format.
    const dateKey = timeNow.toLocaleDateString('en-GB');
    this.log('dateKey:', dateKey);
    // Get current hour
    const currentHour = `${new Date(timeNow)
      .getHours()
      .toString()
      .padStart(2, '0')}:00`;

    this.log('currentHour:', currentHour);

    // Get existing data for current date
    const dailyData: Array<EnergyEntry> =
      this.homey.settings.get(dateKey) || [];

    // Find existing entry for current hour
    const existingEntryIndex = dailyData.findIndex(
      (entry) => entry.time === currentHour,
    );

    let newTotalUsage = usage;
    if (existingEntryIndex !== -1) {
      // Update existing entry by adding the new usage
      newTotalUsage = dailyData[existingEntryIndex]!.usage + usage;
      dailyData[existingEntryIndex]!.usage = newTotalUsage;
    } else {
      // Create new entry if none exists for current hour
      dailyData.push({
        time: currentHour,
        usage: usage,
      });
    }
    this.log('dailyData:', dailyData);

    // Save the updated data for this date
    this.homey.settings.set(dateKey, dailyData);

    if (this.insightsLog) {
      await this.insightsLog.createEntry(newTotalUsage);
    }

    // Clean up old data (keep last 30 days)
    this.cleanupOldData();
  }

  async getCosts() {
    if (!this.homeyApi) {
      return null;
    }

    //@ts-expect-error devices is defined in homey-api
    const devices = await this.homeyApi.devices.getDevices();
    if (!devices) {
      return null;
    }

    // We do a little hack here and get the bill cost directly from the device
    const strømregningDevices = Object.values(devices).find((device: any) => {
      return device.uri === 'homey:device:5a76b0d9-c910-4ac3-8d67-a391265328d6';
    });

    // @ts-expect-error This contains monthly cost
    const monthlyCost = strømregningDevices?.capabilitiesObj.meter_sum_month;
    if (!monthlyCost) {
      return null;
    }

    return monthlyCost.value;
  }

  async getUsageDistribution() {
    if (!this.homeyApi) {
      return null;
    }

    //@ts-expect-error devices is defined in homey-api
    const devices = await this.homeyApi.devices.getDevices();
    if (!devices) {
      return null;
    }

    const distribution: Record<string, number | null> = {
      heat: null,
      vvb: null,
      other: null,
    };

    // This will get all the strømregning devices and sum up the usage for each category
    Object.values(devices).forEach((device: any) => {
      if (device.name.startsWith('A Pris')) {
        const value = device.capabilitiesObj.meter_sum_day.value;
        if (value >= 0) {
          distribution.other += value;
        }
      }

      if (device.name.startsWith('W Pris')) {
        const value = device.capabilitiesObj.meter_sum_day.value;
        if (value >= 0) {
          distribution.vvb += value;
        }
      }

      if (device.name.startsWith('V Pris')) {
        const value = device.capabilitiesObj.meter_sum_day.value;
        if (value >= 0) {
          distribution.heat += value;
        }
      }
    });

    return distribution;
  }

  async getEnergyUsage(energy: number, aDate: Date) {
    const thisConsumptionUpdate = new Date(aDate).valueOf();

    if (!this.lastConsumptionUpdate) {
      this.lastConsumptionUpdate = thisConsumptionUpdate;
      return;
    }

    /* 
    Energy is in watt. (watt is joule per second)
    Find the seconds between the last update and this update.
    Convert to kWh
    */
    const kwhConsumption =
      energy *
      ((thisConsumptionUpdate - this.lastConsumptionUpdate) / 1000 / 3600) *
      (1 / 1000);

    this.lastConsumptionUpdate = thisConsumptionUpdate;

    return kwhConsumption;
  }

  private cleanupOldData(): void {
    const keys = this.homey.settings.getKeys();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    keys.forEach((key) => {
      this.log('storage key:', key);
      // Only process keys that match our date format (DD/MM/20YY)
      if (key.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = key.split('/');
        const date = new Date(`${year}-${month}-${day}`);

        if (date < thirtyDaysAgo) {
          this.homey.settings.unset(key);
        }
      }
    });
  }
}

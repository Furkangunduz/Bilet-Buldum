import { groupBy } from 'lodash';
import { Types } from 'mongoose';
import { TCDDController } from '../controllers/TCDDController';
import SearchAlert from '../models/SearchAlert';
import NotificationService from './NotificationService';

interface SearchAlertDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fromStationId: string;
  toStationId: string;
  date: string;
  cabinClass: string;
  departureTimeRange: {
    start: string;
    end: string;
  } | null;
  isActive: boolean;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  statusReason?: string;
  lastChecked: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

class CronJobService {
  private static instance: CronJobService;
  private tcddController: TCDDController;

  private constructor() {
    this.tcddController = new TCDDController();
  }

  public static getInstance(): CronJobService {
    if (!CronJobService.instance) {
      CronJobService.instance = new CronJobService();
    }
    return CronJobService.instance;
  }

  private async getActiveSearchAlerts(): Promise<SearchAlertDocument[]> {
    const alerts = await SearchAlert.find({
      isActive: true,
      departureTimeRange: { $ne: null },
    })
      .sort({ createdAt: 1 })
      .lean();

    console.log(`[SearchAlerts] Found ${alerts.length} active alerts`);
    return alerts as SearchAlertDocument[];
  }

  private groupSearchAlerts(searchAlerts: SearchAlertDocument[]) {
    const grouped = groupBy(searchAlerts, (alert: SearchAlertDocument) => `${alert.fromStationId}-${alert.toStationId}-${alert.date}`);

    console.log(`[SearchAlerts] Created ${Object.keys(grouped).length} groups from ${searchAlerts.length} alerts`);
    return grouped;
  }

  private async processSearchGroup(alerts: SearchAlertDocument[]) {
    const firstAlert = alerts[0];
    if (!firstAlert.departureTimeRange) return;

    console.log(
      `[SearchAlerts] Processing ${alerts.length} alerts for ${firstAlert.fromStationId} -> ${firstAlert.toStationId} (${firstAlert.date})`
    );

    try {
      const dateParts = firstAlert.date.split(' ')[0].split('-');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]} 00:00:00`;

      const searchPayload = {
        fromStationId: firstAlert.fromStationId,
        toStationId: firstAlert.toStationId,
        date: formattedDate,
        passengerCount: 1,
        departureTimeRange: firstAlert.departureTimeRange,
        preferredCabinClass: firstAlert.cabinClass,
        wantHighSpeedTrain: true,
      };

      const searchResult = await this.tcddController.searchTrainsDirectly(searchPayload);
      console.log(
        `[SearchAlerts] Search result for ${firstAlert.fromStationId} -> ${firstAlert.toStationId} (${firstAlert.date}):`,
        searchResult
      );

      for (const alert of alerts) {
        const now = new Date();
        const searchDate = new Date(alert.date.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));

        if (searchDate < now) {
          await SearchAlert.findByIdAndUpdate(alert._id, {
            isActive: false,
            status: 'FAILED',
            lastChecked: now,
            statusReason: 'Search date has passed',
          });
          await NotificationService.sendPushNotification(
            alert.userId,
            'Search Alert Expired',
            `Your search alert for ${alert.fromStationId} to ${alert.toStationId} on ${alert.date} has expired.`
          );
          console.log(`[v ] Alert ${alert._id} expired - past date`);
          continue;
        }

        await SearchAlert.findByIdAndUpdate(alert._id, { lastChecked: now });

        if (searchResult?.data && searchResult?.data.length > 0) {
          await SearchAlert.findByIdAndUpdate(alert._id, {
            isActive: false,
            status: 'COMPLETED',
            statusReason: 'Seats found',
          });
          await NotificationService.sendPushNotification(
            alert.userId,
            'Seats Available!',
            `We found seats for your journey from ${alert.fromStationId} to ${alert.toStationId} on ${alert.date}. Book now!`,
            {
              type: 'SEATS_FOUND',
              fromStationId: alert.fromStationId,
              toStationId: alert.toStationId,
              date: alert.date,
              cabinClass: alert.cabinClass,
            }
          );
          console.log(`[SearchAlerts] Alert ${alert._id} completed - seats found`);
        }
      }
    } catch (error) {
      console.error('[SearchAlerts] Error processing search group:', error);
      for (const alert of alerts) {
        await SearchAlert.findByIdAndUpdate(alert._id, {
          isActive: false,
          status: 'FAILED',
          statusReason: 'Search failed due to technical error',
        });
        console.log(`[SearchAlerts] Alert ${alert._id} failed - technical error`);
      }
    }
  }

  public async processSearchAlerts() {
    console.log('\n[SearchAlerts] Starting search alerts processing');

    try {
      const activeAlerts = await this.getActiveSearchAlerts();
      if (!activeAlerts.length) {
        console.log('[SearchAlerts] No active alerts found');
        return;
      }

      const groupedAlerts = this.groupSearchAlerts(activeAlerts);
      let groupIndex = 1;
      const totalGroups = Object.keys(groupedAlerts).length;

      for (const [key, alerts] of Object.entries(groupedAlerts)) {
        console.log(`[SearchAlerts] Processing group ${groupIndex}/${totalGroups}`);
        await this.processSearchGroup(alerts as SearchAlertDocument[]);
        groupIndex++;
      }

      console.log('[SearchAlerts] Completed processing all groups');
    } catch (error) {
      console.error('[SearchAlerts] Error processing search alerts:', error);
    }
  }
}

export default CronJobService.getInstance();

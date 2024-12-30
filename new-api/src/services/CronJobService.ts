import { groupBy } from 'lodash';
import { Types } from 'mongoose';
import { TCDDController } from '../controllers/TCDDController';
import SearchAlert from '../models/SearchAlert';

interface SearchResult {
  success: boolean;
  data: any[];
}

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
    console.log('[SearchAlerts] Fetching active search alerts...');
    const alerts = await SearchAlert.find({ 
      isActive: true,
      departureTimeRange: { $ne: null } 
    })
      .sort({ createdAt: 1 }) // Sort by creation time to prioritize older searches
      .lean();

    console.log(`[SearchAlerts] Found ${alerts.length} active search alerts`);
    return alerts as SearchAlertDocument[];
  }

  private groupSearchAlerts(searchAlerts: SearchAlertDocument[]) {
    console.log('[SearchAlerts] Grouping search alerts by common criteria...');
    const grouped = groupBy(searchAlerts, (alert: SearchAlertDocument) => 
      `${alert.fromStationId}-${alert.toStationId}-${alert.date}`
    );
    
    const groupCount = Object.keys(grouped).length;
    console.log(`[SearchAlerts] Created ${groupCount} groups from ${searchAlerts.length} alerts`);
    
    Object.entries(grouped).forEach(([key, alerts]) => {
      console.log(`[SearchAlerts] Group ${key}: ${alerts.length} alerts`);
    });

    return grouped;
  }

  private async processSearchGroup(alerts: SearchAlertDocument[]) {
    const firstAlert = alerts[0];
    if (!firstAlert.departureTimeRange) {
      console.log('[SearchAlerts] Skipping group - no departure time range');
      return;
    }
    
    console.log(`[SearchAlerts] Processing group for route ${firstAlert.fromStationId} -> ${firstAlert.toStationId} on ${firstAlert.date}`);
    console.log(`[SearchAlerts] Time range: ${firstAlert.departureTimeRange.start} - ${firstAlert.departureTimeRange.end}`);
    console.log(`[SearchAlerts] Number of alerts in group: ${alerts.length}`);
    
    try {
      const searchPayload = {
        fromStationId: firstAlert.fromStationId,
        toStationId: firstAlert.toStationId,
        date: firstAlert.date,
        passengerCount: 1,
        departureTimeRange: firstAlert.departureTimeRange,
        preferredCabinClass: firstAlert.cabinClass,
        wantHighSpeedTrain: true
      };

      console.log('[SearchAlerts] Sending search request to TCDD API:', JSON.stringify(searchPayload, null, 2));

      const mockResponse = {
        json: (data: SearchResult) => data,
        status: () => ({ json: (data: SearchResult) => data })
      };

      const searchResult = await Promise.resolve(this.tcddController.searchTrains(
        { body: searchPayload } as any,
        mockResponse as any
      )) as unknown as SearchResult;

      console.log(`[SearchAlerts] Search completed. Found ${searchResult?.data?.length || 0} results`);

      for (const alert of alerts) {
        const now = new Date();
        console.log(`[SearchAlerts] Processing alert ${alert._id}`);
        
        const searchDate = new Date(alert.date.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));
        if (searchDate < now) {
          console.log(`[SearchAlerts] Alert ${alert._id} has passed its search date`);
          await SearchAlert.findByIdAndUpdate(alert._id, {
            isActive: false,
            status: 'FAILED',
            lastChecked: now,
            statusReason: 'Search date has passed'
          });
          console.log(`[SearchAlerts] Alert ${alert._id} marked as failed due to past date`);
          continue;
        }

        await SearchAlert.findByIdAndUpdate(alert._id, {
          lastChecked: now
        });
        console.log(`[SearchAlerts] Updated last checked time for alert ${alert._id}`);

        if (searchResult?.data && searchResult?.data.length > 0) {
          console.log(`[SearchAlerts] Found seats for alert ${alert._id}`);
          console.log('[SearchAlerts] Search result details:', JSON.stringify(searchResult.data[0], null, 2));
          
          await SearchAlert.findByIdAndUpdate(alert._id, {
            isActive: false,
            status: 'COMPLETED',
            statusReason: 'Seats found'
          });
          console.log(`[SearchAlerts] Alert ${alert._id} marked as completed`);
          console.log(`******************************************************************`);
          console.log(`*************                          *****************************`);
          console.log(`*************  from: ${alert.fromStationId} *************`);
          console.log(`*************  to: ${alert.toStationId} *****************`);
          console.log(`*************  date: ${alert.date} **********************`);
          console.log(`*************  cabinClass: ${alert.cabinClass} **********`);
          console.log(`*************  departureTimeRange: ${alert.departureTimeRange} ***********`);
          console.log('************************************************');
        } else {
          console.log(`[SearchAlerts] No seats found for alert ${alert._id}`);
        }
      }
    } catch (error) {
      console.error('[SearchAlerts] Error processing search group:', error);
      // Update all alerts in the group with error status
      for (const alert of alerts) {
        console.log(`[SearchAlerts] Marking alert ${alert._id} as failed due to error`);
        await SearchAlert.findByIdAndUpdate(alert._id, {
          isActive: false,
          status: 'FAILED',
          statusReason: 'Search failed due to technical error'
        });
        console.log(`[SearchAlerts] Alert ${alert._id} marked as failed`);

        console.log('******************************************************************');
        console.log(`********************  from: ${alert.fromStationId} ********************`);
        console.log(`********************  to: ${alert.toStationId} ********************`);
        console.log(`********************  date: ${alert.date} ********************`);
        console.log(`********************  cabinClass: ${alert.cabinClass} ********************`);
        console.log(`********************  departureTimeRange: ${alert.departureTimeRange} ********************`);
        console.log('******************************************************************');
        }
    }
  }

  public async processSearchAlerts() {
    console.log('\n[SearchAlerts] Starting search alerts processing...');
    console.log('[SearchAlerts] Time:', new Date().toISOString());
    
    try {
      const activeAlerts = await this.getActiveSearchAlerts();
      if (!activeAlerts.length) {
        console.log('[SearchAlerts] No active search alerts found');
        return;
      }

      const groupedAlerts = this.groupSearchAlerts(activeAlerts);

      console.log('[SearchAlerts] Starting to process groups...');
      let groupIndex = 1;
      const totalGroups = Object.keys(groupedAlerts).length;
      
      for (const [key, alerts] of Object.entries(groupedAlerts)) {
        console.log(`\n[SearchAlerts] Processing group ${groupIndex}/${totalGroups}`);
        console.log(`[SearchAlerts] Group key: ${key}`);
        await this.processSearchGroup(alerts as SearchAlertDocument[]);
        groupIndex++;
      }
      
      console.log('\n[SearchAlerts] Completed processing all groups');
    } catch (error) {
      console.error('[SearchAlerts] Error processing search alerts:', error);
    }
  }
}

export default CronJobService.getInstance(); 
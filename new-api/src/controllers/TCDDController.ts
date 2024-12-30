import { Request, Response } from 'express';
import { env } from '../config/env';
import { TCDDApiService } from '../services/TCDDApiService';
import { BaseController } from './BaseController';

export class TCDDController extends BaseController {
  private tcddApiService: TCDDApiService;

  constructor() {
    super();
    this.tcddApiService = new TCDDApiService(env.TCDD_AUTH_TOKEN);
  }

  public searchTrains = async (req: Request, res: Response): Promise<void> => {
    try {
      const { fromStationId, toStationId, date, passengerCount } = req.body;

      if (!fromStationId || !toStationId || !date) {
        this.sendError(res, new Error('Missing required parameters'), 400);
        return;
      }

      // Load stations map to get station names
      const stationsMap = await this.tcddApiService.loadStationsMap();
      
      // Find station names from the map
      let fromStationName, toStationName;
      
      for (const [stationName, data] of Object.entries(stationsMap)) {
        if (data.id === fromStationId) {
          fromStationName = stationName;
        }
        if (data.id === toStationId) {
          toStationName = stationName;
        }
        if (fromStationName && toStationName) break;
      }

      if (!fromStationName || !toStationName) {
        this.sendError(res, new Error('Invalid station IDs'), 400);
        return;
      }

      const result = await this.tcddApiService.searchTrains({
        fromStationId: Number(fromStationId),
        fromStationName,
        toStationId: Number(toStationId),
        toStationName,
        date: new Date(date),
        passengerCount: Number(passengerCount) || 1
      });

      this.sendSuccess(res, result);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getStationsMap = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stationsMap = await this.tcddApiService.loadStationsMap();
      this.sendSuccess(res, stationsMap);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };
} 
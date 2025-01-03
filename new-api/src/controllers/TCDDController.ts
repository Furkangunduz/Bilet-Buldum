import axios from 'axios';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { TCDDData } from '../types/tcdd.types';
import { BaseController } from './BaseController';

interface StationData {
  id: string;
  destinations: Array<{
    id: string;
    text: string;
  }>;
}

interface StationsMap {
  [key: string]: StationData;
}

interface Leg {
  trainAvailabilities: TrainAvailability[];
}

interface TrainAvailability {
  trains: Train[];
}

interface Train {
  id: number;
  commercialName?: string;
  trainNumber: string;
  segments: Array<{
    segment: {
      departureStation: {
        name: string;
      };
      arrivalStation: {
        name: string;
      };
    };
    departureTime: number;
    arrivalTime: number;
  }>;
  cabinClassAvailabilities: Array<{
    cabinClass: {
      name: string;
    };
    availabilityCount: number;
  }>;
}

interface Cabin {
  cabinClass: {
    name: string;
  };
  availabilityCount: number;
}

export class TCDDController extends BaseController {
  private readonly API_BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
  private readonly HEADERS = {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'tr',
    'Content-Type': 'application/json',
    Origin: 'https://ebilet.tcddtasimacilik.gov.tr',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'unit-id': '3895',
  };

  private readonly AVAILABLE_CABIN_CLASSES = [
    {
      id: 1,
      code: 'Y1',
      name: 'EKONOMİ',
    },
    {
      id: 2,
      code: 'C',
      name: 'BUSİNESS',
    },
  ];

  private isHighSpeedTrain(train: Train): boolean {
    return !train?.commercialName?.toLowerCase()?.includes('ekspres');
  }

  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  private knka(date: string): boolean {
    const dateRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    return dateRegex.test(date);
  }

  private validateTimeFormat(time: string): boolean {
    const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeFormatRegex.test(time);
  }

  private validateDateFormat(date: string): boolean {
    const dateFormatRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
    return dateFormatRegex.test(date);
  }

  private validateTimeRange(start: string, end: string): boolean {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if ((startHour >= 1 && startHour < 5) || (endHour >= 1 && endHour < 5)) {
      return false;
    }

    return startMinutes < endMinutes;
  }

  private async validateStationIds(fromStationId: string, toStationId: string): Promise<boolean> {
    const stationsMap = await this.loadStationsMap();
    let fromStationExists = false;
    let toStationExists = false;

    for (const [_, data] of Object.entries<StationData>(stationsMap)) {
      if (data.id === fromStationId) fromStationExists = true;
      if (data.id === toStationId) toStationExists = true;
      if (fromStationExists && toStationExists) break;
    }

    return fromStationExists && toStationExists;
  }

  private validateSearchDate(dateStr: string): { isValid: boolean; error?: string } {
    const searchDate = new Date(dateStr.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1'));
    const now = new Date();
    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(now.getDate() + 10);

    if (searchDate.toDateString() === now.toDateString()) {
      const currentHour = now.getHours();
      if (currentHour >= 23) {
        return { isValid: false, error: 'Cannot create search for today after 23:00' };
      }
    }

    if (searchDate < now) {
      return { isValid: false, error: 'Cannot create search for past dates' };
    }

    if (searchDate > tenDaysFromNow) {
      return { isValid: false, error: 'Cannot create search for dates more than 10 days in the future' };
    }

    return { isValid: true };
  }

  private async loadStationsMap(): Promise<StationsMap> {
    const filePath = path.join(process.cwd(), 'stations_map.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    throw new Error('Stations map file not found');
  }

  public searchTrains = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        fromStationId,
        toStationId,
        date,
        passengerCount = 1,
        departureTimeRange = { start: '00:00', end: '23:59' },
        preferredCabinClass = 'EKONOMİ',
        wantHighSpeedTrain = true,
      } = req.body;

      if (!fromStationId || !toStationId || !date || !departureTimeRange?.start || !departureTimeRange?.end) {
        this.sendError(res, new Error('All fields are required: fromStationId, toStationId, date, departureTimeRange'), 400);
        return;
      }

      if (!this.validateDateFormat(date)) {
        this.sendError(res, new Error('Invalid date format. Use DD-MM-YYYY HH:mm:ss'), 400);
        return;
      }

      const formattedDate = date.includes(':') ? date : `${date.split(' ')[0]} 00:00:00`;

      const dateValidation = this.validateSearchDate(formattedDate);
      if (!dateValidation.isValid) {
        this.sendError(res, new Error(dateValidation.error || 'Invalid date'), 400);
        return;
      }

      const areStationsValid = await this.validateStationIds(fromStationId, toStationId);
      if (!areStationsValid) {
        this.sendError(res, new Error('Invalid station IDs'), 400);
        return;
      }

      if (!this.validateTimeFormat(departureTimeRange.start) || !this.validateTimeFormat(departureTimeRange.end)) {
        this.sendError(res, new Error('Invalid time format. Use HH:mm'), 400);
        return;
      }

      if (!this.validateTimeRange(departureTimeRange.start, departureTimeRange.end)) {
        this.sendError(
          res,
          new Error('Invalid time range. Cannot search between 01:00 - 05:00, and start time must be before end time'),
          400
        );
        return;
      }

      if (typeof passengerCount !== 'number' || passengerCount < 1) {
        this.sendError(res, new Error('Invalid passenger count'), 400);
        return;
      }

      if (!['EKONOMİ', 'BUSINESS'].includes(preferredCabinClass)) {
        this.sendError(res, new Error('Invalid cabin class. Must be either EKONOMİ or BUSINESS'), 400);
        return;
      }

      const stationsMap = await this.loadStationsMap();

      let fromStationName, toStationName;

      for (const [stationName, data] of Object.entries<StationData>(stationsMap)) {
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

      const requestData = {
        searchRoutes: [
          {
            departureStationId: Number(fromStationId),
            departureStationName: fromStationName,
            arrivalStationId: Number(toStationId),
            arrivalStationName: toStationName,
            departureDate: date,
          },
        ],
        passengerTypeCounts: [
          {
            id: 0,
            count: Number(passengerCount),
          },
        ],
        searchReservation: false,
      };

      const response = await axios.post<TCDDData>(`${this.API_BASE_URL}/train/train-availability?environment=dev&userId=1`, requestData, {
        headers: {
          ...this.HEADERS,
          Authorization: env.TCDD_AUTH_TOKEN,
        },
      });

      const data = response?.data;
      const trainLegs = data.trainLegs;
      const trainAvailabilities = trainLegs.flatMap((leg) => leg.trainAvailabilities);
      const trains = trainAvailabilities.flatMap((trainAvailability) => {
        return trainAvailability.trains.map((train) => {
          const firstSegment = train.segments[0];
          const lastSegment = train.segments[train.segments.length - 1];

          return {
            trainNumber: train.trainNumber,
            departureStationName: firstSegment.segment.departureStation.name,
            arrivalStationName: lastSegment.segment.arrivalStation.name,
            departureTime: this.formatTimestamp(firstSegment.departureTime),
            arrivalTime: this.formatTimestamp(lastSegment.arrivalTime),
            cabinClassAvailabilities: train.cabinClassAvailabilities.map((cabin) => ({
              cabinClass: cabin.cabinClass,
              availabilityCount: cabin.availabilityCount,
            })),
            isHighSpeed: this.isHighSpeedTrain(train),
          };
        });
      });

      let filteredTrains = trains;

      if (wantHighSpeedTrain !== undefined) {
        filteredTrains = filteredTrains.filter((train) => train.isHighSpeed === wantHighSpeedTrain);
      }

      if (departureTimeRange) {
        const [startHour, startMinute] = departureTimeRange.start.split(':').map(Number);
        const [endHour, endMinute] = departureTimeRange.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        filteredTrains = filteredTrains.filter((train) => {
          const departureDate = new Date(train.departureTime);
          const localHours = (departureDate.getUTCHours() + 3) % 24;
          const localMinutes = departureDate.getUTCMinutes();
          const trainMinutes = localHours * 60 + localMinutes;

          return trainMinutes >= startMinutes && trainMinutes <= endMinutes;
        });
      }

      if (preferredCabinClass) {
        filteredTrains = filteredTrains
          .filter((train) =>
            train.cabinClassAvailabilities.some((cabin) => cabin.cabinClass.name === preferredCabinClass && cabin.availabilityCount > 1)
          )
          .map((train) => ({
            ...train,
            cabinClassAvailabilities: train.cabinClassAvailabilities.filter((cabin) => cabin.cabinClass.name === preferredCabinClass),
          }));
      }

      this.sendSuccess(res, filteredTrains);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        this.sendError(res, new Error(`TCDD API Error: ${error.response?.data?.message || error.message}`));
      } else {
        this.sendError(res, error);
      }
    }
  };

  public searchTrainsDirectly = async (params: {
    fromStationId: string;
    toStationId: string;
    date: string;
    departureTimeRange: { start: string; end: string };
    preferredCabinClass: string;
    passengerCount?: number;
    wantHighSpeedTrain?: boolean;
  }) => {
    try {
      const {
        fromStationId,
        toStationId,
        date,
        departureTimeRange,
        preferredCabinClass,
        passengerCount = 1,
        wantHighSpeedTrain = true,
      } = params;

      if (!this.validateDateFormat(date)) {
        throw new Error('Invalid date format. Use DD-MM-YYYY HH:mm:ss');
      }

      const dateValidation = this.validateSearchDate(date);
      if (!dateValidation.isValid) {
        throw new Error(dateValidation.error || 'Invalid date');
      }

      const areStationsValid = await this.validateStationIds(fromStationId, toStationId);
      if (!areStationsValid) {
        throw new Error('Invalid station IDs');
      }

      const stationsMap = await this.loadStationsMap();
      let fromStationName, toStationName;

      for (const [stationName, data] of Object.entries<StationData>(stationsMap)) {
        if (data.id === fromStationId) fromStationName = stationName;
        if (data.id === toStationId) toStationName = stationName;
        if (fromStationName && toStationName) break;
      }

      const requestData = {
        searchRoutes: [
          {
            departureStationId: Number(fromStationId),
            departureStationName: fromStationName,
            arrivalStationId: Number(toStationId),
            arrivalStationName: toStationName,
            departureDate: date,
          },
        ],
        passengerTypeCounts: [
          {
            id: 0,
            count: Number(passengerCount),
          },
        ],
        searchReservation: false,
      };

      const response = await axios.post<TCDDData>(`${this.API_BASE_URL}/train/train-availability?environment=dev&userId=1`, requestData, {
        headers: {
          ...this.HEADERS,
          Authorization: env.TCDD_AUTH_TOKEN,
        },
      });

      const data = response?.data;
      const trainLegs = data.trainLegs;
      const trainAvailabilities = trainLegs.flatMap((leg) => leg.trainAvailabilities);

      const trains = trainAvailabilities.flatMap((trainAvailability) => {
        return trainAvailability.trains.map((train) => {
          const firstSegment = train.segments[0];
          const lastSegment = train.segments[train.segments.length - 1];

          return {
            trainNumber: train.trainNumber,
            departureStationName: firstSegment.segment.departureStation.name,
            arrivalStationName: lastSegment.segment.arrivalStation.name,
            departureTime: this.formatTimestamp(firstSegment.departureTime),
            arrivalTime: this.formatTimestamp(lastSegment.arrivalTime),
            cabinClassAvailabilities: train.cabinClassAvailabilities.map((cabin) => ({
              cabinClass: cabin.cabinClass,
              availabilityCount: cabin.availabilityCount,
            })),
            isHighSpeed: this.isHighSpeedTrain(train),
          };
        });
      });

      let filteredTrains = trains;
      console.log('----------[[FILTERS]]----------');
      console.log('Preferred Cabin Class:', preferredCabinClass);

      if (preferredCabinClass) {
        filteredTrains = filteredTrains
          .filter((train) => {
            return train.cabinClassAvailabilities.some((cabin) => {
              return cabin.cabinClass.id === parseInt(preferredCabinClass) && cabin.availabilityCount >= 1;
            });
          })
          .map((train) => ({
            ...train,
            cabinClassAvailabilities: train.cabinClassAvailabilities.filter((cabin) => cabin.cabinClass.name === preferredCabinClass),
          }));
      }

      if (wantHighSpeedTrain !== undefined) {
        filteredTrains = filteredTrains.filter((train) => train.isHighSpeed === wantHighSpeedTrain);
      }

      if (departureTimeRange) {
        console.log('---------- Departure Time Range ----------');
        console.log('Departure time range:', departureTimeRange);
        const [startHour, startMinute] = departureTimeRange.start.split(':').map(Number);
        const [endHour, endMinute] = departureTimeRange.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        filteredTrains = filteredTrains.filter((train) => {
          const departureDate = new Date(train.departureTime);

          const localHours = departureDate.getHours();
          const localMinutes = departureDate.getMinutes();
          const trainMinutes = localHours * 60 + localMinutes;

          console.log(`Train: ${train.trainNumber}`);
          console.log(`Departure Time (Local): ${localHours}:${localMinutes}`);
          console.log(`Calculated Train Minutes: ${trainMinutes}`);
          console.log(`Start Minutes: ${startMinutes}, End Minutes: ${endMinutes}`);
          console.log('---------[[RESULT]]----------');
          console.log(trainMinutes >= startMinutes && trainMinutes <= endMinutes);

          return trainMinutes >= startMinutes && trainMinutes <= endMinutes;
        });
      }

      return {
        success: true,
        data: filteredTrains,
      };
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          data: [],
          error: error.response?.data,
        };
      }
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  };

  public getStationsMap = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stationsMap = await this.loadStationsMap();
      this.sendSuccess(res, stationsMap);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getDepartureStations = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stationsMap = await this.loadStationsMap();
      const departureStations = Object.entries(stationsMap).map(([stationName, data]) => ({
        id: data.id,
        name: stationName,
      }));

      this.sendSuccess(res, departureStations);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getArrivalStations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departureStationId } = req.params;

      if (!departureStationId) {
        this.sendError(res, new Error('Departure station ID is required'), 400);
        return;
      }

      const stationsMap = await this.loadStationsMap();

      let departureStation: StationData | null = null;
      for (const [_, data] of Object.entries(stationsMap)) {
        if (data.id === departureStationId) {
          departureStation = data;
          break;
        }
      }

      if (!departureStation) {
        this.sendError(res, new Error('Invalid departure station ID'), 400);
        return;
      }

      const arrivalStations = departureStation.destinations.map((dest) => {
        let stationName = '';
        for (const [name, data] of Object.entries(stationsMap)) {
          if (data.id === dest.id) {
            stationName = name;
            break;
          }
        }

        return {
          id: dest.id,
          name: stationName,
        };
      });

      this.sendSuccess(res, arrivalStations);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getCabinClasses = async (_req: Request, res: Response): Promise<void> => {
    try {
      this.sendSuccess(res, this.AVAILABLE_CABIN_CLASSES);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  private formatTrainData(leg: Leg, trainAvailability: TrainAvailability, train: Train): any {
    // ... existing code
  }

  private formatCabinData(cabin: Cabin): any {
    // ... existing code
  }
}

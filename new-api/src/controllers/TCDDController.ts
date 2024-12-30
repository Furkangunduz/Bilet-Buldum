import axios from 'axios';
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { TCDDData, Train } from '../types/tcdd.types';
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

export class TCDDController extends BaseController {
  private readonly API_BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
  private readonly HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr',
    'Content-Type': 'application/json',
    'Origin': 'https://ebilet.tcddtasimacilik.gov.tr',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'unit-id': '3895'
  };

  private readonly AVAILABLE_CABIN_CLASSES = [
    {
      id: 1,
      code: 'Y1',
      name: 'EKONOMİ'
    },
    {
      id: 2,
      code: 'C',
      name: 'BUSİNESS'
    }
  ];

  private isHighSpeedTrain(train: Train): boolean {
    return !train?.commercialName?.toLowerCase()?.includes('ekspres');
  }

  private formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }

  private validateDate(date: string): boolean {
    const dateRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    return dateRegex.test(date);
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
        departureTimeRange = { start: "00:00", end: "23:59" },  // Default to full day
        preferredCabinClass = 'EKONOMİ',  // Default to economy
        wantHighSpeedTrain = true // Default to high-speed trains
      } = req.body;

      if (!fromStationId || !toStationId || !date) {
        this.sendError(res, new Error('Missing required parameters'), 400);
        return;
      }

      if (!this.validateDate(date)) {
        this.sendError(res, new Error('Invalid date format. Use DD-MM-YYYY HH:mm:ss'), 400);
        return;
      }

      // Validate time range format if provided
      const timeFormatRegex = /^\d{2}:\d{2}$/;
      if (departureTimeRange) {
        if (!timeFormatRegex.test(departureTimeRange.start) || !timeFormatRegex.test(departureTimeRange.end)) {
          this.sendError(res, new Error('Invalid time range format. Use HH:mm for both start and end times'), 400);
          return;
        }

        // Validate that start time is before end time
        const [startHour, startMinute] = departureTimeRange.start.split(':').map(Number);
        const [endHour, endMinute] = departureTimeRange.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        if (startMinutes >= endMinutes) {
          this.sendError(res, new Error('Start time must be before end time'), 400);
          return;
        }
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
        searchRoutes: [{
          departureStationId: Number(fromStationId),
          departureStationName: fromStationName,
          arrivalStationId: Number(toStationId),
          arrivalStationName: toStationName,
          departureDate: date
        }],
        passengerTypeCounts: [{
          id: 0,
          count: Number(passengerCount)
        }],
        searchReservation: false
      };

      const response = await axios.post<TCDDData>(
        `${this.API_BASE_URL}/train/train-availability?environment=dev&userId=1`,
        requestData,
        {
          headers: {
            ...this.HEADERS,
            'Authorization': env.TCDD_AUTH_TOKEN
          }
        }
      );

      const data = response?.data
      const trainLegs = data.trainLegs;
      const trainAvailabilities = trainLegs.flatMap(leg => leg.trainAvailabilities);
      const trains = trainAvailabilities.flatMap((trainAvailability) => {
        return trainAvailability.trains.map(train => {
          const firstSegment = train.segments[0];
          const lastSegment = train.segments[train.segments.length - 1];
          
          return {
            trainNumber: train.trainNumber,
            departureStationName: firstSegment.segment.departureStation.name,
            arrivalStationName: lastSegment.segment.arrivalStation.name,
            departureTime: this.formatTimestamp(firstSegment.departureTime),
            arrivalTime: this.formatTimestamp(lastSegment.arrivalTime),
            cabinClassAvailabilities: train.cabinClassAvailabilities.map(cabin => ({
              cabinClass: cabin.cabinClass,
              availabilityCount: cabin.availabilityCount
            })),
            isHighSpeed: this.isHighSpeedTrain(train)
          };
        });
      });

      // Filter trains based on user preferences
      let filteredTrains = trains;

      // Filter by high-speed preference
      if (wantHighSpeedTrain !== undefined) {
        filteredTrains = filteredTrains.filter(train => train.isHighSpeed === wantHighSpeedTrain);
      }

      // Filter by departure time range
      if (departureTimeRange) {
        const [startHour, startMinute] = departureTimeRange.start.split(':').map(Number);
        const [endHour, endMinute] = departureTimeRange.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        filteredTrains = filteredTrains.filter(train => {
          const departureDate = new Date(train.departureTime);
          // Add 3 hours to UTC time to get the correct local time
          const localHours = (departureDate.getUTCHours() + 3) % 24;
          const localMinutes = departureDate.getUTCMinutes();
          const trainMinutes = localHours * 60 + localMinutes;
          
          return trainMinutes >= startMinutes && trainMinutes <= endMinutes;
        });
      }

      // Filter by preferred cabin class
      if (preferredCabinClass) {
        filteredTrains = filteredTrains.filter(train => 
          train.cabinClassAvailabilities.some(cabin => 
            cabin.cabinClass.name === preferredCabinClass && cabin.availabilityCount > 0
          )
        );
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

  public getStationsMap = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stationsMap = await this.loadStationsMap();
      this.sendSuccess(res, stationsMap);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Get all available departure stations
  public getDepartureStations = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stationsMap = await this.loadStationsMap();
      const departureStations = Object.entries(stationsMap).map(([stationName, data]) => ({
        id: data.id,
        name: stationName
      }));
      
      this.sendSuccess(res, departureStations);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Get possible arrival stations for a selected departure station
  public getArrivalStations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { departureStationId } = req.params;
      
      if (!departureStationId) {
        this.sendError(res, new Error('Departure station ID is required'), 400);
        return;
      }

      const stationsMap = await this.loadStationsMap();
      
      // Find the departure station in the map
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

      // Get possible destinations for this departure station
      const arrivalStations = departureStation.destinations.map(dest => {
        // Find the full station name from the map
        let stationName = '';
        for (const [name, data] of Object.entries(stationsMap)) {
          if (data.id === dest.id) {
            stationName = name;
            break;
          }
        }
        
        return {
          id: dest.id,
          name: stationName
        };
      });

      this.sendSuccess(res, arrivalStations);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  // Get available cabin classes
  public getCabinClasses = async (_req: Request, res: Response): Promise<void> => {
    try {
      this.sendSuccess(res, this.AVAILABLE_CABIN_CLASSES);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };
} 
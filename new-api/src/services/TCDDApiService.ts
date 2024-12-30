import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { StationMap } from '../types/crawler.types';

interface SearchRoute {
  departureStationId: number;
  departureStationName: string;
  arrivalStationId: number;
  arrivalStationName: string;
  departureDate: string;
}

interface PassengerTypeCount {
  id: number;
  count: number;
}

interface TrainSearchRequest {
  searchRoutes: SearchRoute[];
  passengerTypeCounts: PassengerTypeCount[];
  searchReservation: boolean;
}

export class TCDDApiService {
  private readonly API_BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
  private readonly HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr',
    'Content-Type': 'application/json',
    'Origin': 'https://ebilet.tcddtasimacilik.gov.tr',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'unit-id': '3895'
  };

  constructor(private authToken: string) {}

  public async searchTrains(params: {
    fromStationId: number;
    fromStationName: string;
    toStationId: number;
    toStationName: string;
    date: Date;
    passengerCount?: number;
  }) {
    const { fromStationId, fromStationName, toStationId, toStationName, date, passengerCount = 1 } = params;

    const requestData: TrainSearchRequest = {
      searchRoutes: [{
        departureStationId: fromStationId,
        departureStationName: fromStationName,
        arrivalStationId: toStationId,
        arrivalStationName: toStationName,
        departureDate: this.formatDate(date)
      }],
      passengerTypeCounts: [{
        id: 0,
        count: passengerCount
      }],
      searchReservation: false
    };

    try {
      const response = await axios.post(
        `${this.API_BASE_URL}/train/train-availability?environment=dev&userId=1`,
        requestData,
        {
          headers: {
            ...this.HEADERS,
            'Authorization': this.authToken
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`TCDD API Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  private formatDate(date: Date | string): string {
    // If date is a string in format DD-MM-YYYY, convert it to Date
    if (typeof date === 'string') {
      const [day, month, year] = date.split('-').map(Number);
      date = new Date(year, month - 1, day);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    // Always set time to 21:00:00 as per the example
    return `${day}-${month}-${year} 21:00:00`;
  }

  public async loadStationsMap(): Promise<StationMap> {
    const filePath = path.join(process.cwd(), 'stations_map.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
    throw new Error('Stations map file not found');
  }
} 
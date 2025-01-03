export interface TrainAvailabilities {
  trains: Train[];
  totalTripTime: number;
  minPrice: number;
  connection: boolean;
  dayChanged: boolean;
}

export interface Train {
  id: number;
  number: string;
  name: string;
  commercialName: string;
  type: string;
  line: null | string;
  reversed: boolean;
  scheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  minPrice: Price;
  reservationLockTime: number;
  reservable: boolean;
  bookingClassCapacities: BookingClassCapacity[];
  segments: Segment[];
  cars: Car[];
  trainSegments: TrainSegment[];
  totalDistance: number;
  availableFareInfo: AvailableFareInfo[];
  cabinClassAvailabilities: CabinClassAvailability[];
  trainDate: number;
  trainNumber: string;
  skipsDay: boolean;
}

export interface Price {
  type: null | string;
  priceAmount: number;
  priceCurrency: string;
}

export interface BookingClassCapacity {
  id: number;
  trainId: number;
  bookingClassId: BookingClassId;
  capacity: number;
}

export interface Segment {
  id: number;
  departureTime: number;
  arrivalTime: number;
  stops: boolean;
  duration: number;
  stopDuration: number;
  distance: number;
  segment: SegmentDetail;
}

export interface SegmentDetail {
  id: number;
  name: string;
  departureStation: Station;
  arrivalStation: Station;
  lineId: number;
  lineOrder: number;
}

export interface Station {
  id: number;
  stationNumber: string;
  areaCode: number;
  name: string;
  stationStatus: StationStatus;
  stationType: StationType;
  unitId: number;
  cityId: number;
  districtId: number;
  neighbourhoodId: number;
  uicCode: null | string;
  technicalUnit: string;
  stationChefId: number;
  detail: string;
  showOnQuery: boolean;
  passengerDrop: boolean;
  ticketSaleActive: boolean;
  active: boolean;
  email: string;
  orangeDeskEmail: string;
  address: string;
  longitude: number;
  latitude: number;
  altitude: number;
  startKm: number;
  endKm: number;
  showOnMap: boolean;
  passengerAdmission: boolean;
  disabledAccessibility: boolean;
  phones: null | any;
  workingDays: null | any;
  hardwares: null | any;
  physicalProperties: null | any;
  stationPlatforms: null | any;
  salesChannels: null | any;
  IATACode: null | string;
}

export interface StationStatus {
  id: number;
  name: null | string;
  detail: null | string;
}

export interface StationType {
  id: number;
  name: null | string;
  detail: null | string;
}

export interface Car {
  id: number;
  name: string;
  trainId: number;
  templateId: number;
  carIndex: number;
  unlabeled: boolean;
  capacity: number;
  cabinClassId: number;
  availabilities: CarAvailability[];
}

export interface CarAvailability {
  trainCarId: number;
  trainCarName: null | string;
  cabinClass: CabinClass | null;
  availability: number;
  pricingList: PricingItem[];
  additionalServices: AdditionalService[] | null;
}

export interface CabinClass {
  id: number | string;
  code: 'C' | 'Y1' | 'DSB' | 'B';
  name: 'BUSİNESS' | 'EKONOMİ' | 'EKERLEKLİ SANDALYE' | 'YATAKLI';
  additionalServices: AdditionalServiceDetail[] | null;
  bookingClassModels: null | any;
  showAvailabilityOnQuery: boolean;
}

export interface AdditionalServiceDetail {
  id: number;
  additionalServiceTypeId: number;
  name: string;
  description: string;
  code: string;
  active: boolean;
  freeForPermi: boolean;
  actAsGroup: boolean;
  basePrice: BasePrice[];
  pricingPeriods: null | any;
}

export interface BasePrice {
  id: number;
  additionalServiceId: number;
  type: string;
  priceAmount: number;
  priceCurrency: string;
  startDate: string;
  endDate: string;
}

export interface PricingItem {
  basePricingId: number;
  bookingClass: BookingClass;
  cabinClassId: number;
  basePricingType: string;
  fareBasis: FareBasis;
  basePrice: Price;
  crudePrice: Price;
  baseTransportationCost: Price;
  availability: number;
}

export interface BookingClass {
  id: number;
  code: string;
  name: string;
  cabinClass: CabinClass | null;
  fareFamily: FareFamily;
}

export interface FareBasis {
  code: string;
  factor: number;
  price: Price;
}

export interface FareFamily {
  id: number;
  name: string;
}

export interface AdditionalService {
  additionalService: AdditionalServiceDetail;
  priceAmount: number;
  currency: string;
}

export interface TrainSegment {
  departureStationId: number;
  arrivalStationId: number;
  departureTime: string;
  arrivalTime: string;
}

export interface AvailableFareInfo {
  fareFamily: FareFamily;
  cabinClasses: CabinClassInfo[];
}

export interface CabinClassInfo {
  cabinClass: CabinClass;
  availabilityCount: number;
  minPrice: number | null;
  bookingClassAvailabilities: BookingClassAvailability[];
}

export interface BookingClassAvailability {
  bookingClass: BookingClass;
  price: number;
  availability: number;
}

export interface CabinClassAvailability {
  //KEY CLASS TO BE USED IN THE API
  cabinClass: CabinClass;
  availabilityCount: number;
}

export interface TCDDData {
  trainLegs: TrainLeg[];
  legCount: number;
  roundTripDiscount: number;
  maxRegionalTrainsRoundTripDays: number;
}

export interface TrainLeg {
  trainAvailabilities: TrainAvailabilities[];
}

export const BookingClassIdMap = {
  '4': 'ECONOMY',
  '1': 'BUSINESS',
  '22': 'FIRST',
  '23': 'SECOND',
} as const;

export type BookingClassId = keyof typeof BookingClassIdMap;

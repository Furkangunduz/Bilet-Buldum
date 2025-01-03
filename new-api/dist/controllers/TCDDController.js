"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCDDController = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
const BaseController_1 = require("./BaseController");
class TCDDController extends BaseController_1.BaseController {
    constructor() {
        super(...arguments);
        this.API_BASE_URL = 'https://web-api-prod-ytp.tcddtasimacilik.gov.tr/tms';
        this.HEADERS = {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'tr',
            'Content-Type': 'application/json',
            'Origin': 'https://ebilet.tcddtasimacilik.gov.tr',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'unit-id': '3895'
        };
        this.AVAILABLE_CABIN_CLASSES = [
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
        this.searchTrains = async (req, res) => {
            var _a, _b;
            try {
                const { fromStationId, toStationId, date, passengerCount = 1, departureTimeRange = { start: "00:00", end: "23:59" }, preferredCabinClass = 'EKONOMİ', wantHighSpeedTrain = true } = req.body;
                if (!fromStationId || !toStationId || !date || !(departureTimeRange === null || departureTimeRange === void 0 ? void 0 : departureTimeRange.start) || !(departureTimeRange === null || departureTimeRange === void 0 ? void 0 : departureTimeRange.end)) {
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
                    this.sendError(res, new Error('Invalid time range. Cannot search between 01:00 - 05:00, and start time must be before end time'), 400);
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
                for (const [stationName, data] of Object.entries(stationsMap)) {
                    if (data.id === fromStationId) {
                        fromStationName = stationName;
                    }
                    if (data.id === toStationId) {
                        toStationName = stationName;
                    }
                    if (fromStationName && toStationName)
                        break;
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
                const response = await axios_1.default.post(`${this.API_BASE_URL}/train/train-availability?environment=dev&userId=1`, requestData, {
                    headers: Object.assign(Object.assign({}, this.HEADERS), { 'Authorization': env_1.env.TCDD_AUTH_TOKEN })
                });
                const data = response === null || response === void 0 ? void 0 : response.data;
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
                let filteredTrains = trains;
                if (wantHighSpeedTrain !== undefined) {
                    filteredTrains = filteredTrains.filter(train => train.isHighSpeed === wantHighSpeedTrain);
                }
                if (departureTimeRange) {
                    const [startHour, startMinute] = departureTimeRange.start.split(':').map(Number);
                    const [endHour, endMinute] = departureTimeRange.end.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMinute;
                    const endMinutes = endHour * 60 + endMinute;
                    filteredTrains = filteredTrains.filter(train => {
                        const departureDate = new Date(train.departureTime);
                        const localHours = (departureDate.getUTCHours() + 3) % 24;
                        const localMinutes = departureDate.getUTCMinutes();
                        const trainMinutes = localHours * 60 + localMinutes;
                        return trainMinutes >= startMinutes && trainMinutes <= endMinutes;
                    });
                }
                if (preferredCabinClass) {
                    filteredTrains = filteredTrains.filter(train => train.cabinClassAvailabilities.some(cabin => cabin.cabinClass.name === preferredCabinClass && cabin.availabilityCount > 1)).map(train => (Object.assign(Object.assign({}, train), { cabinClassAvailabilities: train.cabinClassAvailabilities.filter(cabin => cabin.cabinClass.name === preferredCabinClass) })));
                }
                this.sendSuccess(res, filteredTrains);
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    this.sendError(res, new Error(`TCDD API Error: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message}`));
                }
                else {
                    this.sendError(res, error);
                }
            }
        };
        this.searchTrainsDirectly = async (params) => {
            var _a;
            try {
                const { fromStationId, toStationId, date, departureTimeRange, preferredCabinClass, passengerCount = 1, wantHighSpeedTrain = true } = params;
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
                for (const [stationName, data] of Object.entries(stationsMap)) {
                    if (data.id === fromStationId)
                        fromStationName = stationName;
                    if (data.id === toStationId)
                        toStationName = stationName;
                    if (fromStationName && toStationName)
                        break;
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
                const response = await axios_1.default.post(`${this.API_BASE_URL}/train/train-availability?environment=dev&userId=1`, requestData, {
                    headers: Object.assign(Object.assign({}, this.HEADERS), { 'Authorization': env_1.env.TCDD_AUTH_TOKEN })
                });
                const data = response === null || response === void 0 ? void 0 : response.data;
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
                let filteredTrains = trains;
                if (wantHighSpeedTrain !== undefined) {
                    filteredTrains = filteredTrains.filter(train => train.isHighSpeed === wantHighSpeedTrain);
                }
                if (departureTimeRange) {
                    const [startHour, startMinute] = departureTimeRange.start.split(':').map(Number);
                    const [endHour, endMinute] = departureTimeRange.end.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMinute;
                    const endMinutes = endHour * 60 + endMinute;
                    filteredTrains = filteredTrains.filter(train => {
                        const departureDate = new Date(train.departureTime);
                        const localHours = (departureDate.getUTCHours() + 3) % 24;
                        const localMinutes = departureDate.getUTCMinutes();
                        const trainMinutes = localHours * 60 + localMinutes;
                        return trainMinutes >= startMinutes && trainMinutes <= endMinutes;
                    });
                }
                if (preferredCabinClass) {
                    filteredTrains = filteredTrains.filter(train => train.cabinClassAvailabilities.some(cabin => cabin.cabinClass.name === preferredCabinClass && cabin.availabilityCount > 1)).map(train => (Object.assign(Object.assign({}, train), { cabinClassAvailabilities: train.cabinClassAvailabilities.filter(cabin => cabin.cabinClass.name === preferredCabinClass) })));
                }
                return {
                    success: true,
                    data: filteredTrains
                };
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    return {
                        success: false,
                        data: [],
                        error: (_a = error.response) === null || _a === void 0 ? void 0 : _a.data
                    };
                }
                return {
                    success: false,
                    data: [],
                    error: error.message
                };
            }
        };
        this.getStationsMap = async (_req, res) => {
            try {
                const stationsMap = await this.loadStationsMap();
                this.sendSuccess(res, stationsMap);
            }
            catch (error) {
                this.sendError(res, error);
            }
        };
        this.getDepartureStations = async (_req, res) => {
            try {
                const stationsMap = await this.loadStationsMap();
                const departureStations = Object.entries(stationsMap).map(([stationName, data]) => ({
                    id: data.id,
                    name: stationName
                }));
                this.sendSuccess(res, departureStations);
            }
            catch (error) {
                this.sendError(res, error);
            }
        };
        this.getArrivalStations = async (req, res) => {
            try {
                const { departureStationId } = req.params;
                if (!departureStationId) {
                    this.sendError(res, new Error('Departure station ID is required'), 400);
                    return;
                }
                const stationsMap = await this.loadStationsMap();
                let departureStation = null;
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
                const arrivalStations = departureStation.destinations.map(dest => {
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
            }
            catch (error) {
                this.sendError(res, error);
            }
        };
        this.getCabinClasses = async (_req, res) => {
            try {
                this.sendSuccess(res, this.AVAILABLE_CABIN_CLASSES);
            }
            catch (error) {
                this.sendError(res, error);
            }
        };
    }
    isHighSpeedTrain(train) {
        var _a, _b;
        return !((_b = (_a = train === null || train === void 0 ? void 0 : train.commercialName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.includes('ekspres'));
    }
    formatTimestamp(timestamp) {
        return new Date(timestamp).toISOString();
    }
    knka(date) {
        const dateRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
        return dateRegex.test(date);
    }
    validateTimeFormat(time) {
        const timeFormatRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        return timeFormatRegex.test(time);
    }
    validateDateFormat(date) {
        const dateFormatRegex = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/;
        return dateFormatRegex.test(date);
    }
    validateTimeRange(start, end) {
        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        if ((startHour >= 1 && startHour < 5) || (endHour >= 1 && endHour < 5)) {
            return false;
        }
        return startMinutes < endMinutes;
    }
    async validateStationIds(fromStationId, toStationId) {
        const stationsMap = await this.loadStationsMap();
        let fromStationExists = false;
        let toStationExists = false;
        for (const [_, data] of Object.entries(stationsMap)) {
            if (data.id === fromStationId)
                fromStationExists = true;
            if (data.id === toStationId)
                toStationExists = true;
            if (fromStationExists && toStationExists)
                break;
        }
        return fromStationExists && toStationExists;
    }
    validateSearchDate(dateStr) {
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
    async loadStationsMap() {
        const filePath = path_1.default.join(process.cwd(), 'stations_map.json');
        if (fs_1.default.existsSync(filePath)) {
            const content = fs_1.default.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
        throw new Error('Stations map file not found');
    }
    formatTrainData(leg, trainAvailability, train) {
        // ... existing code
    }
    formatCabinData(cabin) {
        // ... existing code
    }
}
exports.TCDDController = TCDDController;

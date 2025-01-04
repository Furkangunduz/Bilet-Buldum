import { Request, Response } from 'express';
import SearchAlert from '../models/SearchAlert';
import SearchAlertService from '../services/SearchAlertService';

class SearchAlertController {
  constructor() {
    this.createSearchAlert = this.createSearchAlert.bind(this);
    this.deactivateSearchAlert = this.deactivateSearchAlert.bind(this);
    this.getUserSearchAlerts = this.getUserSearchAlerts.bind(this);
  }

  async createSearchAlert(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      } 

      const stationsMap: Record<string, { id: string; destinations: Array<{ id: string; text: string }> }> = require('../../stations_map.json');
      
      let fromStationName = req.body.fromStationId;
      let toStationName = req.body.toStationId;

      // Find station names from the map
      for (const [stationName, data] of Object.entries(stationsMap)) {
        if (data.id === req.body.fromStationId) {
          fromStationName = stationName;
        }
        if (data.id === req.body.toStationId) {
          toStationName = stationName;
        }
        if (fromStationName !== req.body.fromStationId && toStationName !== req.body.toStationId) break;
      }

      // Get cabin class name
      const cabinClassName = req.body.preferredCabinClass === '1' ? 'EKONOMİ' : 'BUSINESS';

      const searchAlert = await SearchAlertService.createSearchAlert(userId, {
        fromStationId: req.body.fromStationId,
        fromStationName,
        toStationId: req.body.toStationId,
        toStationName,
        date: req.body.date,
        cabinClass: req.body.preferredCabinClass,
        cabinClassName,
        departureTimeRange: req.body.departureTimeRange
      });

      res.status(201).json({
        message: 'Search alert created successfully',
        data: searchAlert
      });
    } catch (error) {
      console.error('Error creating search alert:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deactivateSearchAlert(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    

    
      const searchAlert = await SearchAlert.findOne({ 
        _id: req.params.alertId,
        userId 
      });

      if (!searchAlert) {
        return res.status(404).json({ message: 'Search alert not found' });
      }

      searchAlert.status = 'FAILED';
      searchAlert.isActive = false;
      searchAlert.statusReason = 'User declined the alert';
      await searchAlert.save();

      res.json({ message: 'Search alert deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating search alert:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getUserSearchAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const stationsMap: Record<string, { id: string; destinations: Array<{ id: string; text: string }> }> = require('../../stations_map.json');
      const searchAlerts = await SearchAlert.find({ userId, isActive: true })
        .sort({ createdAt: -1 })
        .lean();

      const alertsWithNames = searchAlerts.map(alert => {
        let fromStationName = alert.fromStationId;
        let toStationName = alert.toStationId;

        // Find station names from the map
        for (const [stationName, data] of Object.entries(stationsMap)) {
          if (data.id === alert.fromStationId) {
            fromStationName = stationName;
          }
          if (data.id === alert.toStationId) {
            toStationName = stationName;
          }
          if (fromStationName !== alert.fromStationId && toStationName !== alert.toStationId) break;
        }

        // Get cabin class name
        const cabinClassName = alert.cabinClass === '1' ? 'EKONOMİ' : 'BUSINESS';

        return {
          ...alert,
          fromStationName,
          toStationName,
          cabinClassName
        };
      });

      res.json({
        message: 'Search alerts retrieved successfully',
        data: alertsWithNames
      });
    } catch (error) {
      console.error('Error retrieving search alerts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new SearchAlertController(); 
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
      console.log('req.body', req.body);

      const searchAlert = await SearchAlertService.createSearchAlert(userId, {
        fromStationId: req.body.fromStationId,
        toStationId: req.body.toStationId,
        date: req.body.date,
        cabinClass: req.body.preferredCabinClass,
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

      await SearchAlertService.deactivateSearch(req.params.searchId);
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

      const searchAlerts = await SearchAlert.find({ userId, isActive: true })
        .sort({ createdAt: -1 });

      res.json({
        message: 'Search alerts retrieved successfully',
        data: searchAlerts
      });
    } catch (error) {
      console.error('Error retrieving search alerts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new SearchAlertController(); 
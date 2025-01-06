import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SearchAlert from '../models/SearchAlert';
import SearchAlertService from '../services/SearchAlertService';

class SearchAlertController {
  constructor() {
    this.createSearchAlert = this.createSearchAlert.bind(this);
    this.declineSearchAlert = this.declineSearchAlert.bind(this);
    this.deleteSearchAlert = this.deleteSearchAlert.bind(this);
    this.getUserSearchAlerts = this.getUserSearchAlerts.bind(this);
    this.bulkDeclineSearchAlerts = this.bulkDeclineSearchAlerts.bind(this);
    this.bulkDeleteSearchAlerts = this.bulkDeleteSearchAlerts.bind(this);
  }

  async createSearchAlert(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      } 

      const activeAlerts = await SearchAlert.find({ 
        userId,
        isActive: true,
        deletedAt: null
      });

      if (activeAlerts.length >= 2) {
        return res.status(400).json({ 
          message: 'You can only have 2 active alerts at a time. Please decline an existing alert to create a new one.' 
        });
      }

      const existingAlert = await SearchAlert.findOne({
        userId,
        fromStationId: req.body.fromStationId,
        toStationId: req.body.toStationId,
        isActive: true,
        deletedAt: null
      });

      if (existingAlert) {
        return res.status(400).json({ 
          message: 'You already have an active alert for this route' 
        });
      }

      const stationsMap: Record<string, { id: string; destinations: Array<{ id: string; text: string }> }> = require('../../stations_map.json');
      
      let fromStationName = req.body.fromStationId;
      let toStationName = req.body.toStationId;

      if(req.body.fromStationId === req.body.toStationId) {
        return res.status(400).json({ message: 'From and to station cannot be the same' });
      }

      for (const [stationName, data] of Object.entries(stationsMap)) {
        if (data.id === req.body.fromStationId) {
          fromStationName = stationName;
        }
        if (data.id === req.body.toStationId) {
          toStationName = stationName;
        }
        if (fromStationName !== req.body.fromStationId && toStationName !== req.body.toStationId) break;
      }


      console.log('[SearchAlertController] cabinClassName', {
        fromStationId: req.body.fromStationId,
        fromStationName,
        toStationId: req.body.toStationId,
        toStationName,
        date: req.body.date,
        cabinClass: req.body.preferredCabinClass,
        cabinClassName: req.body.preferredCabinClassName,
        departureTimeRange: req.body.departureTimeRange
      });

      const searchAlert = await SearchAlertService.createSearchAlert(userId, {
        fromStationId: req.body.fromStationId,
        fromStationName,
        toStationId: req.body.toStationId,
        toStationName,
        date: req.body.date,
        cabinClass: req.body.preferredCabinClass,
        cabinClassName: req.body.preferredCabinClassName,
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

  async declineSearchAlert(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { alertId } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({ message: 'Invalid alert ID format' });
      }

      const searchAlert = await SearchAlert.findOne({ 
        _id: alertId,
        userId,
        deletedAt: null
      });

      if (!searchAlert) {
        return res.status(404).json({ message: 'Search alert not found' });
      }

      if (searchAlert.status !== 'PENDING') {
        return res.status(400).json({ message: 'Only pending alerts can be declined' });
      }

      searchAlert.status = 'FAILED';
      searchAlert.isActive = false;
      searchAlert.statusReason = 'User declined the alert';
      await searchAlert.save();

      res.json({ 
        message: 'Search alert declined successfully',
        data: searchAlert
      });
    } catch (error) {
      console.error('Error declining search alert:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteSearchAlert(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { alertId } = req.params;
      
      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({ message: 'Invalid alert ID format' });
      }

      const searchAlert = await SearchAlert.findOne({ 
        _id: alertId,
        userId,
        deletedAt: null
      });

      if (!searchAlert) {
        return res.status(404).json({ message: 'Search alert not found' });
      }

      if (searchAlert.status === 'PENDING') {
        return res.status(400).json({ message: 'Cannot delete a pending alert. Please decline it first.' });
      }

      searchAlert.deletedAt = new Date();
      await searchAlert.save();

      res.json({ 
        message: 'Search alert deleted successfully',
        data: searchAlert
      });
    } catch (error) {
      console.error('Error deleting search alert:', error);
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
      const searchAlerts = await SearchAlert.find({ 
        userId,
        deletedAt: null
      })
        .sort({ createdAt: -1 })
        .lean();

      const alertsWithNames = searchAlerts.map(alert => {
        let fromStationName = alert.fromStationId;
        let toStationName = alert.toStationId;

        for (const [stationName, data] of Object.entries(stationsMap)) {
          if (data.id === alert.fromStationId) {
            fromStationName = stationName;
          }
          if (data.id === alert.toStationId) {
            toStationName = stationName;
          }
          if (fromStationName !== alert.fromStationId && toStationName !== alert.toStationId) break;
        }

        

        return {
          ...alert,
          fromStationName,
          toStationName,
          cabinClassName: alert.cabinClassName
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

  async bulkDeclineSearchAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status } = req.query;
      if (status !== 'PROCESSING') {
        return res.status(400).json({ message: 'Can only bulk decline processing alerts' });
      }

      const result = await SearchAlert.updateMany(
        { 
          userId,
          status: 'PROCESSING',
          deletedAt: null,
          isActive: true
        },
        {
          $set: {
            status: 'FAILED',
            isActive: false,
            statusReason: 'User declined the alert (bulk action)'
          }
        }
      );

      res.json({ 
        message: 'Search alerts declined successfully',
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (error) {
      console.error('Error declining search alerts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async bulkDeleteSearchAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { status } = req.query;
      if (!status || !['COMPLETED', 'FAILED'].includes(status as string)) {
        return res.status(400).json({ message: 'Can only bulk delete completed or failed alerts' });
      }

      const result = await SearchAlert.updateMany(
        { 
          userId,
          status,
          deletedAt: null
        },
        {
          $set: {
            deletedAt: new Date()
          }
        }
      );

      res.json({ 
        message: 'Search alerts deleted successfully',
        data: { modifiedCount: result.modifiedCount }
      });
    } catch (error) {
      console.error('Error deleting search alerts:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new SearchAlertController(); 
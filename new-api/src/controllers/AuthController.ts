import Expo from 'expo-server-sdk';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import NotificationService from '../services/NotificationService';

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateNotificationPreferences = this.updateNotificationPreferences.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updatePushToken = this.updatePushToken.bind(this);
    this.testNotification = this.testNotification.bind(this);
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password,name,lastName } = req.body;
      console.log(req.body)

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = new User({
        email,
        password,
        firstName:name,
        lastName:lastName
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          notificationPreferences: user.notificationPreferences,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({ error: 'Error creating user' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, pushToken } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (pushToken) {
        const existingUser = await User.findOne({ expoPushToken: pushToken }).lean();
        if (existingUser && existingUser._id && existingUser._id.toString() !== user.id) {
          await User.findByIdAndUpdate(existingUser._id, { $unset: { expoPushToken: 1 } });
        }
        
        await User.findByIdAndUpdate(user._id, { expoPushToken: pushToken });
      } else {
        await User.findByIdAndUpdate(user._id, { $unset: { expoPushToken: 1 } });
      }

      const token = jwt.sign(
        { userId: user._id },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          notificationPreferences: user.notificationPreferences,
        },
        token,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(400).json({ error: 'Error logging in' });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = req.user;
      res.json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        notificationPreferences: user.notificationPreferences,
      });
    } catch (error) {
      res.status(400).json({ error: 'Error fetching profile' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { firstName, lastName } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        notificationPreferences: user.notificationPreferences,
      });
    } catch (error) {
      res.status(400).json({ error: 'Error updating profile' });
    }
  }

  async updateNotificationPreferences(req: Request, res: Response) {
    try {
      const { email, push } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { 
          notificationPreferences: { email, push }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        notificationPreferences: user.notificationPreferences,
      });
    } catch (error) {
      res.status(400).json({ error: 'Error updating notification preferences' });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(400).json({ error: 'Error updating password' });
    }
  }

  async updatePushToken(req: Request, res: Response) {
    try {
      const { pushToken } = req.body;
      
      if (pushToken === '') {
        // If token is empty string, remove the token
        await User.findByIdAndUpdate(req.user._id, { $unset: { expoPushToken: 1 } });
        return res.json({ message: 'Push token removed successfully' });
      }

      if (!pushToken) {
        return res.status(400).json({ error: 'Push token is required' });
      }

      // Check if token is already in use by another user
      const existingUser = await User.findOne({ expoPushToken: pushToken }).lean();
      if (existingUser && existingUser._id && existingUser._id.toString() !== req.user._id.toString()) {
        // If token exists on another user, remove it from that user
        await User.findByIdAndUpdate(existingUser._id, { $unset: { expoPushToken: 1 } });
      }

      await NotificationService.updatePushToken(req.user._id, pushToken);

      res.json({ message: 'Push token updated successfully' });
    } catch (error) {
      console.error('Error updating push token:', error);
      res.status(400).json({ error: 'Error updating push token' });
    }
  }

  async testNotification(req: Request, res: Response) {
    try {
      const { expoPushToken } = req.body;
      
      if (!expoPushToken) {
        return res.status(400).json({ error: 'Push token is required' });
      }

      const expo = new Expo();
      
      if (!Expo.isExpoPushToken(expoPushToken)) {
        return res.status(400).json({ error: 'Invalid expo push token' });
      }

      const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Test Notification',
        body: 'This is a test notification from Bilet Buldum!',
        data: { type: 'TEST' },
      };

      try {
        const ticket = await expo.sendPushNotificationsAsync([message]);
        return res.json({ success: true, ticket });
      } catch (error) {
        console.error('Error sending test notification:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
      }
    } catch (error) {
      console.error('Error in test notification:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new AuthController(); 

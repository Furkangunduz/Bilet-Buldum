import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';

class AuthController {
  constructor() {
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.updateNotificationPreferences = this.updateNotificationPreferences.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
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
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      console.log(req.body)
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
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
}

export default new AuthController(); 

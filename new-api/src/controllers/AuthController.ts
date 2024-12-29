import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';

export class AuthController {
  static async register(req: Request, res: Response) {
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

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
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

  static async getProfile(req: Request, res: Response) {
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
} 
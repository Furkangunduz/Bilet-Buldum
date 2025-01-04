import { Request, Response } from 'express';
import { Contact } from '../models/Contact';
import { User } from '../models/User';

export class ContactController {
  static async createMessage(req: Request, res: Response) {
    try {
      const { subject, message, email } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const contact = new Contact({
        userId,
        email,
        subject,
        message,
        status: 'PENDING',
      });

      await contact.save();

      return res.status(201).json({
        success: true,
        data: contact,
        message: 'Message sent successfully',
      });
    } catch (error) {
      console.error('Error creating contact message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send message',
      });
    }
  }

  static async getMessages(req: Request, res: Response) {
    try {
      const messages = await Contact.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch messages',
      });
    }
  }

  static async updateMessageStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const message = await Contact.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update message status',
      });
    }
  }
} 
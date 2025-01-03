import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Types } from 'mongoose';
import { User } from '../models/User';

class NotificationService {
  private static instance: NotificationService;
  private expo: Expo;

  private constructor() {
    this.expo = new Expo();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private isValidExpoPushToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }

  public async sendPushNotification(
    userId: Types.ObjectId,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.expoPushToken || !user.notificationPreferences.push) {
        return;
      }

      if (!this.isValidExpoPushToken(user.expoPushToken)) {
        console.error(`Invalid Expo push token for user ${userId}`);
        return;
      }

      const message: ExpoPushMessage = {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
        data,
      };

      const chunks = this.expo.chunkPushNotifications([message]);

      for (const chunk of chunks) {
        try {
          await this.expo.sendPushNotificationsAsync(chunk);
        } catch (error) {
          console.error('Error sending push notification:', error);
        }
      }
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
    }
  }

  public async updatePushToken(userId: Types.ObjectId, token: string): Promise<void> {
    try {
      if (!this.isValidExpoPushToken(token)) {
        throw new Error('Invalid Expo push token');
      }

      await User.findByIdAndUpdate(userId, { expoPushToken: token });
    } catch (error) {
      console.error('Error updating push token:', error);
      throw error;
    }
  }
}

export default NotificationService.getInstance(); 
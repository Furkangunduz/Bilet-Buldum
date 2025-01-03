"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expo_server_sdk_1 = require("expo-server-sdk");
const User_1 = require("../models/User");
class NotificationService {
    constructor() {
        this.expo = new expo_server_sdk_1.Expo();
    }
    static getInstance() {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }
    isValidExpoPushToken(token) {
        return expo_server_sdk_1.Expo.isExpoPushToken(token);
    }
    async sendPushNotification(userId, title, body, data) {
        try {
            const user = await User_1.User.findById(userId);
            if (!user || !user.expoPushToken || !user.notificationPreferences.push) {
                return;
            }
            if (!this.isValidExpoPushToken(user.expoPushToken)) {
                console.error(`Invalid Expo push token for user ${userId}`);
                return;
            }
            const message = {
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
                }
                catch (error) {
                    console.error('Error sending push notification:', error);
                }
            }
        }
        catch (error) {
            console.error('Error in sendPushNotification:', error);
        }
    }
    async updatePushToken(userId, token) {
        try {
            if (!this.isValidExpoPushToken(token)) {
                throw new Error('Invalid Expo push token');
            }
            await User_1.User.findByIdAndUpdate(userId, { expoPushToken: token });
        }
        catch (error) {
            console.error('Error updating push token:', error);
            throw error;
        }
    }
}
exports.default = NotificationService.getInstance();

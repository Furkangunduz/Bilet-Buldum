"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const NotificationService_1 = __importDefault(require("../services/NotificationService"));
class AuthController {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.updateNotificationPreferences = this.updateNotificationPreferences.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.updatePushToken = this.updatePushToken.bind(this);
    }
    async register(req, res) {
        try {
            const { email, password, name, lastName } = req.body;
            console.log(req.body);
            const existingUser = await User_1.User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            const user = new User_1.User({
                email,
                password,
                firstName: name,
                lastName: lastName
            });
            await user.save();
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.env.JWT_SECRET, { expiresIn: '7d' });
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
        }
        catch (error) {
            res.status(400).json({ error: 'Error creating user' });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User_1.User.findOne({ email });
            console.log(req.body);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.env.JWT_SECRET, { expiresIn: '7d' });
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
        }
        catch (error) {
            res.status(400).json({ error: 'Error logging in' });
        }
    }
    async getProfile(req, res) {
        try {
            const user = req.user;
            res.json({
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                notificationPreferences: user.notificationPreferences,
            });
        }
        catch (error) {
            res.status(400).json({ error: 'Error fetching profile' });
        }
    }
    async updateProfile(req, res) {
        try {
            const { firstName, lastName } = req.body;
            const user = await User_1.User.findByIdAndUpdate(req.user._id, { firstName, lastName }, { new: true });
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
        }
        catch (error) {
            res.status(400).json({ error: 'Error updating profile' });
        }
    }
    async updateNotificationPreferences(req, res) {
        try {
            const { email, push } = req.body;
            const user = await User_1.User.findByIdAndUpdate(req.user._id, {
                notificationPreferences: { email, push }
            }, { new: true });
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
        }
        catch (error) {
            res.status(400).json({ error: 'Error updating notification preferences' });
        }
    }
    async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User_1.User.findById(req.user._id);
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
        }
        catch (error) {
            res.status(400).json({ error: 'Error updating password' });
        }
    }
    async updatePushToken(req, res) {
        try {
            const { pushToken } = req.body;
            if (!pushToken) {
                return res.status(400).json({ error: 'Push token is required' });
            }
            await NotificationService_1.default.updatePushToken(req.user._id, pushToken);
            res.json({ message: 'Push token updated successfully' });
        }
        catch (error) {
            console.error('Error updating push token:', error);
            res.status(400).json({ error: 'Error updating push token' });
        }
    }
}
exports.default = new AuthController();

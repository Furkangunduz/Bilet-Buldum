import express from 'express';
import authRoutes from './auth.routes';
import crawlerRoutes from './crawler.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/crawler', crawlerRoutes);

export default router; 
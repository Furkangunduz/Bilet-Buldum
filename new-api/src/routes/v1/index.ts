import express from 'express';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';
import crawlerRoutes from './crawler.routes';
import healthcheckRoutes from './healthcheck.routes';
import searchAlertRoutes from './search-alerts.routes';
import tcddRoutes from './tcdd.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/crawler', crawlerRoutes);
router.use('/search-alerts', searchAlertRoutes);
router.use('/tcdd', tcddRoutes);
router.use('/contact', contactRoutes);
router.use('/healthcheck', healthcheckRoutes);

export default router; 
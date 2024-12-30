import express from 'express';
import { CrawlerController } from '../../controllers/CrawlerController';
import { auth } from '../../middleware/auth';
import { CrawlerService } from '../../services/CrawlerService';

const router = express.Router();

// Initialize services
const crawlerService = new CrawlerService();

// Initialize controller
const crawlerController = new CrawlerController(crawlerService);

// Routes
router.post('/crawl', auth, crawlerController.crawl);
router.get('/history', auth, crawlerController.getSearchHistory);

export default router; 
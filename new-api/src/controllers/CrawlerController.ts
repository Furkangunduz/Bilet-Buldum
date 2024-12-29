import { Request, Response } from 'express';
import { CrawlerService } from '../services/CrawlerService';
import { SearchRequestService } from '../services/SearchRequestService';
import { BaseController } from './BaseController';

export class CrawlerController extends BaseController {
  constructor(
    private crawlerService: CrawlerService,
    private searchRequestService: SearchRequestService
  ) {
    super();
  }

  public crawl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
      const userId = req.user?.id;

      if (!url) {
        this.sendError(res, new Error('URL is required'), 400);
        return;
      }

      const searchRequest = await this.searchRequestService.create({
        userId,
        url,
        status: 'pending'
      });

      try {
        const result = await this.crawlerService.crawl(url);
        
        await this.searchRequestService.update(searchRequest.id, {
          status: 'completed',
          result
        });

        this.sendSuccess(res, result);
      } catch (error: any) {
        await this.searchRequestService.update(searchRequest.id, {
          status: 'failed',
          result: { error: error.message }
        });
        throw error;
      }
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getSearchHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const searchHistory = await this.searchRequestService.findByUserId(userId);
      this.sendSuccess(res, searchHistory);
    } catch (error: any) {
      this.sendError(res, error);
    }
  };
} 
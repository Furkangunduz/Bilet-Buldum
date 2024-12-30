import { Request, Response } from 'express';
import { CrawlerService } from '../services/CrawlerService';
import { BaseController } from './BaseController';

export class CrawlerController extends BaseController {
  constructor(
    private crawlerService: CrawlerService,
    
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

      

      try {
        const result = await this.crawlerService.crawl(url);
        
   

        this.sendSuccess(res, result);
      } catch (error: any) {
       
        throw error;
      }
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getSearchHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
    } catch (error: any) {
      this.sendError(res, error);
    }
  };

  public getAllStations = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.crawlerService.getAllStationsAndDestinations();
      this.sendSuccess(res, { message: 'Stations map has been generated successfully. Check stations_map.json file.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.sendError(res, error);
      } else {
        this.sendError(res, new Error('An unknown error occurred'));
      }
    }
  };
} 
import { Response } from 'express';

export class BaseController {
  protected sendSuccess(res: Response, data: any, status: number = 200): void {
    res.status(status).json({
      success: true,
      data
    });
  }

  protected sendError(res: Response, error: Error, status: number = 500): void {
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
} 
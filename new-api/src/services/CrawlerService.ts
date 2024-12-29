import playwright from 'playwright';

export class CrawlerService {
  async crawl(url: string): Promise<any> {
    const browser = await playwright.chromium.launch();
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle' });
      
      const data = await page.evaluate(() => {
        return {
          availableSeats: [],
          departureTime: '',
          arrivalTime: '',
          price: '',
        };
      });

      return data;
    } catch (error) {
      console.error('Crawling error:', error);
      throw error;
    } finally {
      await browser.close();
    }
  }
} 
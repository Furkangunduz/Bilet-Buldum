import { Browser, chromium } from 'playwright';

export class Crawler {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false,
        args: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox',
          '--no-zygote',
        ]
      });
    }
  }

  async crawl(url: string): Promise<any> {
    try {
      await this.initialize();
      
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      const page = await this.browser.newPage({
        viewport: { width: 800, height: 600 },
        deviceScaleFactor: 1
      });
      
      await page.setDefaultNavigationTimeout(30000);
      await page.setDefaultTimeout(30000);
      
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });

      await page.goto(url);

      const data = await page.evaluate(() => {
        return {
          title: document.title,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
          url: window.location.href,
        };
      });

      await page.close();
      return data;
    } catch (error) {
      console.error('Error during crawling:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
} 
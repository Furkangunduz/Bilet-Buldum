import fs from 'fs';
import path from 'path';
import playwright from 'playwright';

interface Station {
  id: string;
  text: string;
}

interface StationMap {
  [station: string]: {
    id: string;
    destinations: Station[];
  };
}

export class CrawlerService {
  private browser: playwright.Browser | null = null;
  private context: playwright.BrowserContext | null = null;

  private findBestMatch(searchTerm: string, stations: Array<{ id: string; text: string | undefined }>): string | null {
    let bestMatch = null;
    let bestScore = 0;

    
    const normalizedSearch = searchTerm
      .toUpperCase()
      .replace('I', 'İ')
      .replace('ISTANBUL', 'İSTANBUL')
      .replace('PENDIK', 'PENDİK');

    console.log('Normalized search term:', normalizedSearch);

    for (const station of stations) {
      if (!station.text) continue;
      
      const stationText = station.text;
      console.log('Comparing with:', stationText);

      if (stationText === normalizedSearch) {
        console.log('Found exact match:', stationText);
        return station.id;
      }

      if (stationText.includes(normalizedSearch) || normalizedSearch.includes(stationText)) {
        const score = Math.min(stationText.length, normalizedSearch.length) / 
                     Math.max(stationText.length, normalizedSearch.length);
        
        console.log(`Score for ${stationText}: ${score}`);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = station.id;
          console.log('New best match:', stationText, 'with score:', score);
        }
      }
    }

    return bestMatch;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await playwright.chromium.launch({
        headless: true
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 }
      });
    }
  }

  async crawl(url: string =  'https://ebilet.tcddtasimacilik.gov.tr/' ): Promise<any> {
    try {
      await this.initialize();
      if (!this.context) throw new Error('Browser context not initialized');

      const page = await this.context.newPage();

      console.log('Navigating to URL...');
      await page.goto(url, { waitUntil: 'networkidle' });
      console.log('Page loaded');

      
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(2000);

      
      console.log('Handling from station...');
      const fromInput = await page.waitForSelector('#fromTrainInput');
      if (!fromInput) throw new Error('From input not found');

      
      await fromInput.click();
      await fromInput.press('Control+A');
      await fromInput.press('Backspace');
      
      
      await fromInput.type('ANKARA');
      await page.waitForTimeout(2000);

      
      console.log('Checking available stations...');
      const stations = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button.dropdown-item.station');
        return Array.from(buttons).map(button => ({
          id: button.id,
          text: button.querySelector('.textLocation')?.textContent?.trim()
        }));
      });
      console.log('Available stations:', stations);

      
      const bestAnkaraMatch = this.findBestMatch('ANKARA GAR , ANKARA', stations);
      if (bestAnkaraMatch) {
        console.log('Found best matching station:', bestAnkaraMatch);
        const button = await page.waitForSelector(`#${bestAnkaraMatch}`);
        if (button) {
          await button.click();
          console.log('Clicked best matching station');
        }
      } else {
        console.log('No matching station found, trying first station...');
        const firstStation = await page.waitForSelector('button.dropdown-item.station');
        if (firstStation) {
          await firstStation.click();
        }
      }

      await page.waitForTimeout(2000);
      console.log('From station value:', await fromInput.inputValue());

      
      console.log('Handling to station...');
      const toInput = await page.waitForSelector('#toTrainInput');
      if (!toInput) throw new Error('To input not found');

      
      await toInput.click();
      await toInput.press('Control+A');
      await toInput.press('Backspace');
      
      
      await toInput.type('İSTANBUL');  
      await page.waitForTimeout(2000);

      
      const toStations = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button.dropdown-item.station');
        return Array.from(buttons).map(button => ({
          id: button.id,
          text: button.querySelector('.textLocation')?.textContent?.trim()
        }));
      });
      console.log('Available destination stations:', toStations);

      
      const bestPendikMatch = this.findBestMatch('İSTANBUL(PENDİK) , İSTANBUL', toStations);
      if (bestPendikMatch) {
        console.log('Found best matching destination:', bestPendikMatch);
        const button = await page.waitForSelector(`#${bestPendikMatch}`);
        if (button) {
          await button.click();
          console.log('Clicked best matching destination');
        }
      } else {
        console.log('No matching destination found, trying first station...');
        const firstStation = await page.waitForSelector('button.dropdown-item.station');
        if (firstStation) {
          await firstStation.click();
        }
      }

      await page.waitForTimeout(2000);
      console.log('To station value:', await toInput.inputValue());

      
      console.log('Handling date selection...');
      
      const datePickerInput = await page.waitForSelector('.datePickerInput.departureDate input');
      if (!datePickerInput) throw new Error('Date picker input not found');

      await datePickerInput.click();
      console.log('Clicked date picker input');
      await page.waitForTimeout(1000);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const day = tomorrow.getDate();
      const month = tomorrow.getMonth() + 1;
      const year = tomorrow.getFullYear();

      console.log(`Selecting date: ${day}/${month}/${year}`);

      const calendarDay = await page.waitForSelector(`td[data-date="${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}"]`);
      if (calendarDay) {
        await calendarDay.click();
        console.log('Selected date in calendar');
      } else {
        console.log('Could not find tomorrow in calendar, trying alternative method');
        const availableDate = await page.waitForSelector('td.day:not(.disabled)');
        if (availableDate) {
          await availableDate.click();
          console.log('Selected first available date');
        }
      }

      await page.waitForTimeout(1000);

      console.log('Clicking search button...');
      const searchButton = await page.waitForSelector('button[type="submit"]');
      if (searchButton) {
        await searchButton.click();
        console.log('Search button clicked');
      }

      
      try {
        await page.waitForSelector('.seferSonuc', { timeout: 30000 });
        console.log('Results found');
      } catch (error) {
        console.log('No results found:', error);
      }

      
      await page.waitForTimeout(10000);
      
      return [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Crawler error:', error.message);
      } else {
        console.error('Unknown crawler error');
      }
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }

  async getAllStationsAndDestinations(url: string = 'https://ebilet.tcddtasimacilik.gov.tr/'): Promise<void> {
    try {
      await this.initialize();
      if (!this.context) throw new Error('Browser context not initialized');

      const page = await this.context.newPage();
      console.log('Navigating to URL...');
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      console.log('Page loaded');

      const stationMap: StationMap = {};

      const fromInput = await page.waitForSelector('#fromTrainInput');
      if (!fromInput) throw new Error('From input not found');
      
      await fromInput.click();
      await page.waitForTimeout(500);

      const sourceStations = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button.dropdown-item.station');
        return Array.from(buttons).map(button => ({
          id: button.id,
          text: button.querySelector('.textLocation')?.textContent?.trim() || ''
        }));
      });

      const batchSize = 5; 
      for (let i = 0; i < sourceStations.length; i += batchSize) {
        const batch = sourceStations.slice(i, i + batchSize);
        const promises = batch.map(async (sourceStation) => {
          const context = await this.browser!.newContext();
          const newPage = await context.newPage();
          
          try {
            await newPage.goto(url, { waitUntil: 'domcontentloaded' });
            console.log(`Processing source station: ${sourceStation.text}`);
            
            const fromInput = await newPage.waitForSelector('#fromTrainInput');
            if (!fromInput) return;
            
            await fromInput.click();
            await fromInput.fill(sourceStation.text);
            await newPage.waitForTimeout(300);
            
            const sourceButton = await newPage.waitForSelector(`#${sourceStation.id}`);
            if (sourceButton) {
              await sourceButton.click();
              await newPage.waitForTimeout(300);

              const toInput = await newPage.waitForSelector('#toTrainInput');
              if (!toInput) return;

              await toInput.click();
              await newPage.waitForTimeout(300);

              const destinations = await newPage.evaluate(() => {
                const buttons = document.querySelectorAll('button.dropdown-item.station');
                return Array.from(buttons).map(button => ({
                  id: button.id,
                  text: button.querySelector('.textLocation')?.textContent?.trim() || ''
                }));
              });

              stationMap[sourceStation.text] = {
                id: sourceStation.id,
                destinations: destinations
              };
            }
          } catch (error) {
            console.error(`Error processing station ${sourceStation.text}:`, error);
          } finally {
            await context.close();
          }
        });

        await Promise.all(promises);
        console.log(`Completed batch ${i / batchSize + 1} of ${Math.ceil(sourceStations.length / batchSize)}`);
      }

      
      const jsonContent = JSON.stringify(stationMap, null, 2);
      const filePath = path.join(process.cwd(), 'stations_map.json');
      fs.writeFileSync(filePath, jsonContent, 'utf8');
      console.log(`Stations map has been saved to ${filePath}`);

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error collecting stations:', error.message);
      } else {
        console.error('Unknown error while collecting stations');
      }
      throw error;
    } finally {
      await this.close();
    }
  }
} 
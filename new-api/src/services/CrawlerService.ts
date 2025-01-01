import fs from 'fs';
import path from 'path';
import playwright from 'playwright';
import { env } from '../config/env';
import {
    CrawlParams,
    DEFAULT_PARAMS,
    SELECTORS,
    StationMap
} from '../types/crawler.types';

interface Route {
  fromStation: string;
  toStation: string;
  date?: Date;
}

interface Selectors {
  FROM_STATION_INPUT: string;
  TO_STATION_INPUT: string;
  STATION_BUTTONS: string;
  STATION_TEXT: string;
  // ... add other selector properties
}

interface SourceStation {
  id: string;
  text: string;
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
        headless: env.NODE_ENV !== 'development',
        args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        javaScriptEnabled: true,
        hasTouch: false,
        isMobile: false
      });
    }
  }

  async crawl(params: Partial<CrawlParams> = {}, url: string = 'https://ebilet.tcddtasimacilik.gov.tr/'): Promise<any> {
    try {
      const finalParams: CrawlParams = {
        ...DEFAULT_PARAMS,
        ...params
      };

      await this.initialize();
      if (!this.context) throw new Error('Browser context not initialized');

      const page = await this.context.newPage();

      // Set shorter timeouts
      page.setDefaultTimeout(15000);
      page.setDefaultNavigationTimeout(20000);

      // Block unnecessary resources but keep CSS for proper rendering
      await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2}', route => route.abort());
      
      await page.goto(url, { 
        waitUntil: 'networkidle',  // Changed back to networkidle to ensure everything loads
        timeout: 30000 
      });
      console.log('Page loaded');

      // Wait for the main container to be ready
      await page.waitForSelector('.container', { timeout: 2000 });
      
      // Wait for both inputs to be present in DOM
      await Promise.all([
        page.waitForSelector(SELECTORS.FROM_STATION_INPUT, { state: 'attached' }),
        page.waitForSelector(SELECTORS.TO_STATION_INPUT, { state: 'attached' })
      ]);

      // Additional wait for page to be fully interactive
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      console.log('Handling from station...');
      const fromInput = await page.waitForSelector(SELECTORS.FROM_STATION_INPUT, {
        state: 'visible',
        timeout: 20000
      });
      if (!fromInput) throw new Error('From input not found');

      await fromInput.click();
      await fromInput.press('Control+A');
      await fromInput.press('Backspace');
      
      await fromInput.type(finalParams.fromStation);
      await page.waitForTimeout(200);

      console.log('Checking available stations...');
      const stations = await page.evaluate((selectors) => {
        const buttons = document.querySelectorAll(selectors.STATION_BUTTONS);
        return Array.from(buttons).map(button => ({
          id: button.id,
          text: button.querySelector(selectors.STATION_TEXT)?.textContent?.trim()
        }));
      }, SELECTORS);

      const bestFromMatch = this.findBestMatch(finalParams.fromStation, stations);
      if (bestFromMatch) {
        console.log('Found best matching station:', bestFromMatch);
        const button = await page.waitForSelector(`#${bestFromMatch}`);
        if (button) {
          await button.click();
          console.log('Clicked best matching station');
        }
      } else {
        console.log('No matching station found, trying first station...');
        const firstStation = await page.waitForSelector(SELECTORS.STATION_BUTTONS);
        if (firstStation) {
          await firstStation.click();
        }
      }

      await page.waitForTimeout(500);
      console.log('From station value:', await fromInput.inputValue());

      console.log('Handling to station...');
      const toInput = await page.waitForSelector(SELECTORS.TO_STATION_INPUT);
      if (!toInput) throw new Error('To input not found');

      await toInput.click();
      await toInput.press('Control+A');
      await toInput.press('Backspace');
      
      await toInput.type(finalParams.toStation);
      await page.waitForTimeout(200);

      const toStations = await page.evaluate((selectors) => {
        const buttons = document.querySelectorAll(selectors.STATION_BUTTONS);
        return Array.from(buttons).map(button => ({
          id: button.id,
          text: button.querySelector(selectors.STATION_TEXT)?.textContent?.trim()
        }));
      }, SELECTORS);
      
      const bestToMatch = this.findBestMatch(finalParams.toStation, toStations);
      if (bestToMatch) {
        console.log('Found best matching destination:', bestToMatch);
        const button = await page.waitForSelector(`#${bestToMatch}`);
        if (button) {
          await button.click();
          console.log('Clicked best matching destination');
        }
      } else {
        console.log('No matching destination found, trying first station...');
        const firstStation = await page.waitForSelector(SELECTORS.STATION_BUTTONS);
        if (firstStation) {
          await firstStation.click();
        }
      }

      await page.waitForTimeout(200);

      // Date picker input
      const datePickerInput = await page.waitForSelector(SELECTORS.DATE_PICKER_INPUT, {
        timeout: 3000
      });
      
      if (!datePickerInput) throw new Error('Date picker input not found');

      await page.evaluate((element: HTMLInputElement) => {
        element.click();
        element.focus();
      }, datePickerInput as any);
      
      console.log('Clicked date picker input to open calendar');
      
      await page.waitForSelector(SELECTORS.CALENDAR_CONTAINER, { timeout: 3000 });
      console.log('Calendar appeared');

      await page.waitForTimeout(500);

      // Use provided date or tomorrow
      const targetDate = finalParams.date || (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      })();

      const selectedDate = await page.evaluate((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateFormatted = `${year}-${month}-${day}`;

        // Look for the target date
        const dateElement = document.querySelector(`td[data-date="${dateFormatted}"]`);
        if (dateElement && !dateElement.classList.contains('disabled')) {
          const span = dateElement.querySelector('span');
          if (span) {
            return {
              date: dateElement.getAttribute('data-date'),
              id: span.id
            };
          }
        }

        // If target date is not available, look for the next available date
        const allDates = document.querySelectorAll('td[data-date]');
        for (const element of allDates) {
          const elementDate = new Date(element.getAttribute('data-date') || '');
          if (elementDate >= date && 
              !element.classList.contains('disabled') && 
              !element.classList.contains('weekend') && 
              !element.classList.contains('off')) {
            const span = element.querySelector('span');
            if (span) {
              return {
                date: element.getAttribute('data-date'),
                id: span.id
              };
            }
          }
        }
        return null;
      }, targetDate);

      if (!selectedDate) {
        console.log('No available dates found');
        return [];
      }

      console.log('Found date:', selectedDate.date);

      await page.evaluate((dateId) => {
        const span = document.getElementById(dateId);
        if (span) {
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          span.dispatchEvent(clickEvent);

          const td = span.closest('td');
          if (td) {
            td.dispatchEvent(new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            }));
          }
        }
      }, selectedDate.id);
      
      console.log('Clicked date:', selectedDate.date);
      
      await page.waitForTimeout(500);
      
      const dateValue = await datePickerInput.inputValue();
      console.log('Selected date value:', dateValue);

      if (!dateValue) {
        console.log('Could not verify date was set');
        return [];
      }

      await page.waitForTimeout(200);

      // Handle passenger selection
      console.log('Handling passenger selection...');
      
      const passengerInput = await page.waitForSelector(SELECTORS.PASSENGER_INPUT);
      if (!passengerInput) throw new Error('Passenger input not found');
      
      await passengerInput.click();
      console.log('Clicked passenger dropdown');

      await page.waitForSelector(SELECTORS.PASSENGER_DROPDOWN, { timeout: 3000 });
      
      const currentPassengers = await page.evaluate((selectors) => {
        const input = document.querySelector(selectors.PASSENGER_COUNT_INPUT) as HTMLInputElement;
        return input ? parseInt(input.value) : 1;
      }, SELECTORS);

      const desiredPassengers = finalParams.passengerCount || 1;
      const clickCount = desiredPassengers - currentPassengers;

      if (clickCount > 0) {
        const addButton = await page.waitForSelector(SELECTORS.PASSENGER_ADD_BUTTON);
        if (addButton) {
          for (let i = 0; i < clickCount; i++) {
            await addButton.click();
            await page.waitForTimeout(200);
          }
        }
      } else if (clickCount < 0) {
        const removeButton = await page.waitForSelector(SELECTORS.PASSENGER_REMOVE_BUTTON);
        if (removeButton) {
          for (let i = 0; i < Math.abs(clickCount); i++) {
            await removeButton.click();
            await page.waitForTimeout(200);
          }
        }
      }

      const applyButton = await page.waitForSelector(SELECTORS.PASSENGER_APPLY_BUTTON);
      if (applyButton) {
        await applyButton.click();
        console.log('Applied passenger selection');
      }

      await page.waitForTimeout(200);

      console.log('Clicking search button...');
      const searchButton = await page.waitForSelector(SELECTORS.SEARCH_BUTTON);
      if (!searchButton) throw new Error('Search button not found');

      // Block CSS before clicking search button
      await page.route('**/*.css', route => route.abort());
      
      await searchButton.click();
      console.log('Clicked search button');

      try {
        await page.waitForSelector(SELECTORS.SEARCH_RESULTS, { timeout: 15000 });
        console.log('Search results loaded');

        // Get the results here
        const results = await page.evaluate(() => {
          // Add result extraction logic here
          return [];
        });

        return results;
      } catch (error) {
        console.log('No search results found or timeout occurred');
        return [];
      }

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

  private async processRoute(route: Route): Promise<void> {
    // ... existing code
  }

  private async handleSelectors(selectors: Selectors): Promise<void> {
    // ... existing code
  }
} 
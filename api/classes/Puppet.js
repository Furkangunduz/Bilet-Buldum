const chalk = require("chalk");

class Puppet {
  static allParanthesesRgx = /\([^()]+\)/g;
  static lastParanthesesRgx = /.*(([^)]+))/;
  static searchURL = "https://ebilet.tcddtasimacilik.gov.tr/view/eybis/tnmGenel/tcddWebContent.jsf";
  static activeUsers = [];

  constructor() {
    this.puppet = require("puppeteer-extra");
    this.puppet.use(require("puppeteer-extra-plugin-stealth")());
    this.browser = undefined;
    this.page = undefined;
    this.foundTickets = [];
    this.activeSearchData = {
      email: "",
      station_from: "",
      station_to: "",
      date: "",
      amount: "",
      time: "",
    };
  }

  async createBrowser() {
    try {
      if (this.browser !== undefined) {
        await this.browser.close();
        this.browser = undefined;
      }

      this.browser = await this.puppet.launch({
        headless: true,
        defaultViewport: null,
        args: ["--incognito", "--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch (error) {
      console.log("Error trying to create Browser => ", error);
    }
  }

  async createPage() {
    try {
      this.page = await this.browser.newPage();
      await this.page.setRequestInterception(true);

      this.page.on("request", (req) => {
        if (req.resourceType() === "image" || req.resourceType() === "stylesheet") req.abort();
        else req.continue();
      });
    } catch (error) {
      console.log("Error trying to create Page => ", error);
    }
  }

  async gotoSearchPage() {
    try {
      await this.page.goto(Puppet.searchURL, { waitUntil: "domcontentloaded" });
    } catch (error) {
      console.log("Error trying to goto search page => ", error);
      await this.closePage();
      await this.closeBrowser();
    }
  }

  async searchForTicket() {
    try {
      if (this.browser === undefined || this.page === undefined) {
        throw new Error("Browser or Page is not defined");
      }
      await this.#writeVariablesToThePageAndNavigate(
        this.activeSearchData.station_from,
        this.activeSearchData.station_to,
        this.activeSearchData.date
      );
      this.foundTickets = await this.#getAvaliableSeatInfo(this.activeSearchData.amount);
      this.foundTickets = this.#checkTicketTimes();
      this.#logIfFoundTickets();
      await this.#checkPageExpired();

      return this.foundTickets;
    } catch (error) {
      console.log("Error trying to search for ticket => ", error);
    }
  }

  async #writeVariablesToThePageAndNavigate() {
    try {
      console.log("Writing variables to the page and navigating");
      await this.page.type("#nereden", this.activeSearchData.station_from);
      await this.page.waitForTimeout(150);
      await this.page.type("#nereye", this.activeSearchData.station_to);
      await this.page.waitForTimeout(150);
      await this.page.$eval("#trCalGid_input", (el) => (el.value = ""));
      await this.page.waitForTimeout(300);
      await this.page.type("#trCalGid_input", this.activeSearchData.date);
      await this.page.waitForTimeout(100);
      await this.page.click("#btnSeferSorgula");
      await this.page.waitForNavigation();
    } catch (error) {
      console.log("Error trying to write variables to the page and navigate => ", error);
    }
  }

  async #getAvaliableSeatInfo(amount) {
    try {
      const trains = await this.#checkAllTrainsOnThePage();
      const foundTickets = [];

      trains.map((train) => ({
        ...train,
        trainSeatInfo:
          String(train.trainSeatInfo).includes("(") && String(train.trainSeatInfo).includes(")")
            ? String(train.trainSeatInfo).match(Puppet.lastParanthesesRgx)[1]
            : "0",
      }));

      trains.forEach((train) => {
        train.trainSeatInfo -= 2;
        train.trainSeatInfo = train.trainSeatInfo < 0 ? 0 : train.trainSeatInfo;
        if (train.trainSeatInfo >= amount) {
          foundTickets.push(train);
        }
      });
      return foundTickets;
    } catch (error) {
      console.log("Error trying to get avaliable seat info => ", error);
    }
  }

  async #checkAllTrainsOnThePage() {
    try {
      let wagon = undefined,
        index = 1,
        hour = undefined,
        trainSeatInfo = undefined,
        hourInfo = undefined,
        wagonDomElement = undefined,
        hourDomElement = undefined,
        checkedEveryTrainOnThePage = false,
        wagons = [];

      while (!checkedEveryTrainOnThePage) {
        wagon = await this.page.$x(
          `/html/body/div[3]/div[2]/div/div/div/div/form/div[1]/div/div[1]/div/div/div/div[1]/div/div/div/table/tbody/tr[${index}]/td[5]/div/label`
        );
        hour = await this.page.$x(
          `/html/body/div[3]/div[2]/div/div/div/div/form/div[1]/div/div[1]/div/div/div/div[1]/div/div/div/table/tbody/tr[${index}]/td[1]/span`
        );
        wagonDomElement = wagon[0];
        hourDomElement = hour[0];

        if (wagonDomElement) {
          trainSeatInfo = await this.page.evaluate((el) => el?.textContent, wagonDomElement);
          hourInfo = await this.page.evaluate((el) => el?.textContent, hourDomElement);

          let avaliableSeatAmount = String(trainSeatInfo).match(Puppet.allParanthesesRgx).at(-1).slice(1, -1).split(" ")[0];
          wagons.push({ trainSeatInfo: avaliableSeatAmount, hourInfo });

          index++;
        } else {
          checkedEveryTrainOnThePage = true;
        }
      }
      return wagons;
    } catch (error) {
      console.log("Error trying to check all trains on the page => ", error);
    }
  }

  async #checkPageExpired() {
    try {
      if (String(this.page.url()).split("?")[1] == "expired=true") {
        console.log(chalk.red("****\nPage expired\n****\n"));
        await this.closePage();
        return 0;
      }
    } catch (error) {
      console.log("Error trying to check page expired => ", error);
    }
  }

  async closeBrowser() {
    try {
      if (this.browser !== undefined) {
        await this.browser.close();
        this.browser = undefined;
      } else {
        console.log("Browser is already closed");
      }
    } catch (error) {
      console.log("Error trying to close browser => ", error);
    }
  }

  async closePage() {
    try {
      if (this.page !== undefined) {
        await this.page.close();
        this.page = undefined;
      } else {
        console.log("Page is already closed");
      }
    } catch (error) {
      console.log("Error trying to close page => ", error);
    }
  }

  #logIfFoundTickets() {
    try {
      if (this.foundTickets.length > 0) {
        console.log(chalk.red("******"));
        this.foundTickets.forEach(({ hourInfo }, _) => {
          console.log(chalk.green(`${hourInfo} saatinde Bilet Bulundu `));
        });
        console.log(chalk.red("******* "));
      } else {
        console.log(chalk.green("Yer bulamadım Bir daha deneyeceğim "));
      }
    } catch (error) {
      console.log("Error trying to log if found tickets => ", error);
    }
  }

  #checkTicketTimes() {
    try {
      const { time } = this.activeSearchData;
      if (!time) throw new Error("Time is not defined");

      const boundaryTime = time.split("-").map((time) => time.split(":"));

      const avaliableTicketsFitInTime = [];
      this.foundTickets.forEach((ticket) => {
        const ticketTime = ticket.hourInfo.split(":");
        const hour = Number(ticketTime[0]);
        const minute = Number(ticketTime[1]);

        if (hour >= Number(boundaryTime[0][0]))
          if (hour <= Number(boundaryTime[1][0])) {
            if (hour === Number(boundaryTime[1][0])) {
              if (minute <= Number(boundaryTime[1][1])) {
                avaliableTicketsFitInTime.push(ticket);
              }
            } else {
              avaliableTicketsFitInTime.push(ticket);
            }
          }
      });

      return avaliableTicketsFitInTime;
    } catch (error) {
      console.log("Error trying to find avaliable ticket times => ", error);
    }
  }

  setActiveSearchData({ email, station_from, station_to, date, amount, time, id }) {
    try {
      if (!email || !station_from || !station_to || !date || !amount || !time || !id)
        throw new Error("Missing arguments for setActiveSearchData");

      this.activeSearchData = {
        ...this.activeSearchData,
        email,
        station_from,
        station_to,
        date,
        amount,
        time,
        id,
      };
    } catch (error) {
      console.log("Error trying to set active search data => ", error);
    }
  }
}

async function example() {
  function minTwoDigits(n) {
    return (n < 10 ? "0" : "") + n;
  }
  const tenDayAfterToday = new Date(new Date().getTime() + 10 * 24 * 60 * 60 * 1000);
  const tenDayAfterTodayFormatted = `${tenDayAfterToday.getDate()}.${minTwoDigits(
    tenDayAfterToday.getMonth() + 1
  )}.${tenDayAfterToday.getFullYear()}`;

  const p = new Puppet();
  await p.createBrowser();
  await p.gotoSearchPage();
  await p.searchForTicket("İzmit YHT", "Ankara Gar", tenDayAfterTodayFormatted, "1");
}

module.exports = Puppet;

const chalk = require("chalk");
const schedule = require("node-schedule");
class Cron {
  static v4 = require("uuid").v4;
  static defaultFrequency = "*/45 * * * * *";

  constructor() {
    this.schedule = schedule;
    this.frequency = Cron.defaultFrequency;
    this.jobFunction = null;
    this.id = null;
  }

  startJob(jobFunction) {
    try {
      console.log("Job started with frequency: " + this.frequency);
      const id = Cron.v4();
      if (this.jobFunction) {
        this.schedule.scheduleJob(id, this.frequency, this.jobFunction);
      } else {
        this.schedule.scheduleJob(id, this.frequency, jobFunction);
        this.jobFunction = jobFunction;
      }
      this.id = id;
    } catch (error) {
      console.log("Error when create Job", error);
    }
  }

  stopJob() {
    this.finishJob();
    this.#setFrequencyOnceADay();
    this.startJob();
  }

  continueJob() {
    this.finishJob();
    this.#setFrequencyDefault();
    this.startJob();
  }

  finishJob() {
    try {
      console.log("Job finished", this.id);
      this.schedule.scheduledJobs[this.id].cancel();
    } catch (error) {
      console.log("Error when finish Job", error);
    }
  }

  #setFrequencyDefault() {
    this.frequency = Cron.defaultFrequency;
  }

  #setFrequencyOnceADay() {
    this.frequency = "0 0 * * *";
  }
}

module.exports = Cron;

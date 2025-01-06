import cron from 'node-cron';
import SearchAlert from '../models/SearchAlert';
import CronJobService from '../services/CronJobService';

// Default schedule (daily at midnight)
let currentSchedule = '0 0 * * *';
let searchAlertsCron: cron.ScheduledTask = cron.schedule(currentSchedule, () => {});
let isRunning = false;

async function updateSchedule() {
  try {
    const activeAlerts = await SearchAlert.find({
      isActive: true,
      status: 'PENDING',
      deletedAt: null,
    }).limit(1);
    const fiveSedondschedule = '*/5 * * * * *' // 5 seconds
    const dailySchedule = '0 0 * * *' // Daily at midnight
    
    const newSchedule = activeAlerts.length > 0 ? fiveSedondschedule : dailySchedule;
    
    console.log('[CronJob] activeAlerts length is ', activeAlerts.length == 0 ? '0' :activeAlerts.length , 'And new schedue is = ', newSchedule === dailySchedule ? 'daily' : '10 seconds');

    if (newSchedule !== currentSchedule) {
      console.log(`[CronJob] Updating schedule from ${currentSchedule} to ${newSchedule}`);
      currentSchedule = newSchedule;
      searchAlertsCron.stop();
      initCronJob();
    }
  } catch (error) {
    console.error('[CronJob] Error updating schedule:', error);
  }
}

function initCronJob() {
  searchAlertsCron = cron.schedule(currentSchedule, async () => {
    if (isRunning) {
      console.log('[CronJob] Previous job still running, skipping this iteration');
      return;
    }

    console.log('\n----------------------------------------');
    console.log('[CronJob] Starting search alerts job');
    console.log('[CronJob] Time:', new Date().toISOString());
    console.log('----------------------------------------\n');

    isRunning = true;

    try {
      const startTime = Date.now();
      await CronJobService.processSearchAlerts();
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log('\n----------------------------------------');
      console.log('[CronJob] Search alerts job completed');
      console.log(`[CronJob] Duration: ${duration.toFixed(2)} seconds`);
      console.log('[CronJob] Time:', new Date().toISOString());
      console.log('----------------------------------------\n');

      // Check if we need to update the schedule after processing
      await updateSchedule();
    } catch (error) {
      console.error('[CronJob] Fatal error in search alerts job:', error);
    } finally {
      isRunning = false;
    }
  });
}

// Initial setup
(async () => {
  await updateSchedule();
  initCronJob();
})();

cron.schedule('* * * * *', async () => {
  await updateSchedule();
});

export default searchAlertsCron; 
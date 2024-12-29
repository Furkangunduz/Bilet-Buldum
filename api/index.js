const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3004;
require("./config/env")();

const { Cron, Puppet, Mailer } = require("./classes/index.js");
const Sms = require("./services/sms.js");
const controllers = require("./controllers/index.js");
const initdb = require("./config/db.js");
const { logActiveUsers, removeUserFromUserList } = require("./utils/user");
const { deleteUserFromDb, getAllUsersFromDb } = require("./utils/db");
const { isPast } = require("./utils/helpers");

let activeUsers = [];
const db = initdb();

getAllUsersFromDb(db).then((response) => {
  if (response) {
    activeUsers = response;
    if (activeUsers && activeUsers.length == 0) {
      console.log("Veritabanında kayıtlı kullanıcı yok.");
    } else {
      console.log("Veritabanından kullanıcılar alındı. =>>");
      logActiveUsers(activeUsers);
    }
  }
});

const app = express();
const cron = new Cron();
const puppet = new Puppet();
const mailer = new Mailer();
const SmsService = new Sms();

cron.startJob(async () => {
  try {
    console.log("\nCron çalışıyor...\n");
    if (activeUsers.length === 0) {
      console.log("Aktif kullanıcı yok. Cron durduruluyor.");
      cron.stopJob();
      return;
    }

    for (let i = 0; i < activeUsers.length; i++) {
      if (isPast(activeUsers[i].date)) {
        console.log(`${activeUsers[i].email} için tarih geçmiş. Kullanıcı siliniyor.`);
        finishJobByMail(activeUsers[i].email, activeUsers, db);
      }

      await puppet.createBrowser();
      await puppet.createPage();

      const { email, station_from, station_to, date, amount, time, id } = activeUsers[i];
      puppet.setActiveSearchData({ email, station_from, station_to, date, amount, time, id });

      console.log(`\n${email} için arama yapılıyor...`);

      await puppet.gotoSearchPage();
      const tickets = await puppet.searchForTicket();
      console.log(tickets);

      if (tickets?.length === 0) {
        console.log(`${email} için bilet bulunamadı.`);
      } else {
        console.log(`${email} için bilet bulundu. Mail gönderiliyor...`);
        mailer.sendMail(email, mailer.createFoundMailText(tickets, date, amount));
        finishJobByMail(email, activeUsers, db);
        i -= 1;
      }

      await puppet.closePage();
      await puppet.closeBrowser();
    }
  } catch (error) {
    console.log("\nError Cron => ", error);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/", controllers.test);
app.post("/", setVariablesToReqBody, controllers.addNewSearch);
app.post("/is-active-search", setVariablesToReqBody, controllers.checkActiveSearch);
app.delete("/cancel-search/:email", setVariablesToReqBody, controllers.cancelSearch);

function setVariablesToReqBody(req, res, next) {
  req.activeUsers = activeUsers;
  req.db = db;
  req.cron = cron;
  req.mailer = mailer;
  next();
}

async function finishJobByMail(email, activeUsers, db) {
  try {
    console.log(`${email} için arama sonlandırılıyor...`);
    let removedUserId = removeUserFromUserList(activeUsers, email);
    if (removedUserId) {
      await deleteUserFromDb(db, removedUserId);
      console.log(`${email} için arama sonlandırıldı.`);
    }
  } catch (error) {
    console.log("Error finishJobByMail => ", error);
  }
}

app.listen(PORT, () => {
  console.log(`PORT:${PORT} dinleniyor.\n`);
});

const { randomUUID } = require("crypto");
const httpStatus = require("http-status");

const { removeUserFromUserList, logActiveUsers } = require("../utils/user");
const { saveUserToDb, deleteUserFromDb } = require("../utils/db");

const test = (req, res) => {
  res.send("hello");
};

const addNewSearch = async (req, res) => {
  try {
    console.log("addNewSearch => ", req.body);
    const { activeUsers, db, mailer, cron } = req;

    const { station_from, station_to, date, time, email, amount } = req.body;
    const id = randomUUID();

    const mailExist = activeUsers.some((user) => user.email === email);

    if (mailExist) {
      console.log(email, "en fazla 1 arama yapılabilir.");
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        text: "Bu mail adresi ile daha önce arama yapılmış. Lütfen yeni bir mail adresi ile tekrar deneyiniz.",
      });
    }

    activeUsers.push({ email, station_from, station_to, amount, date, id, time });
    logActiveUsers(activeUsers);

    await saveUserToDb(db, { email, station_from, station_to, amount, date, id, time });
    mailer.sendMail(email, mailer.createStartMailText(date, amount));
    cron.continueJob();

    return res.status(httpStatus.OK).send({
      status: "ok",
      text: "Bilet aramaya başladım. Bilet bulduğumda haber vereceğim.",
    });
  } catch (error) {
    console.log(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      text: "Bilet aramaya başlayamadım. Lütfen daha sonra tekrar deneyiniz.",
    });
  }
};

const cancelSearch = async (req, res) => {
  try {
    const email = req.params.email;
    const activeUsers = req.activeUsers;
    const db = req.db;
    console.log("cancelSearch => ", email);

    if (!email) {
      throw new Error("Email is required");
    }

    let removedUserId = removeUserFromUserList(activeUsers, email);
    if (removedUserId) {
      await deleteUserFromDb(db, removedUserId);
      console.log(email, " araması iptal edildi. DB den silindi.");
      return res.status(httpStatus.OK).send({
        status: "ok",
        text: "Bilet arama sonlandırıldı",
      });
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        status: "fail",
        text: "Bu mail adresi ile daha önce arama yapılmamış.",
        remove: true,
      });
    }
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      text: "Bilet arama sonlandırılamadı. Lütfen daha sonra tekrar deneyiniz.",
    });
  }
};

const checkActiveSearch = async (req, res) => {
  try {
    console.log("checkActiveSearch => ", req.body);
    const email = req.body.email || req.user.email;
    const activeUsers = req.activeUsers;

    const user = activeUsers.find((user) => user.email === email);

    if (user) {
      return res.status(httpStatus.OK).send({
        status: "ok",
        text: "Bilet arama devam ediyor.",
        isActive: true,
      });
    } else {
      return res.status(httpStatus.OK).send({
        status: "fail",
        text: "Bilet arama sonlandırılmış.",
        isActive: false,
      });
    }
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      status: "fail",
      text: "Bilet Kontrol edilemedi lütfen daha sonra tekrar deneyiniz.",
      isActive: null,
    });
  }
};

module.exports = {
  test,
  addNewSearch,
  cancelSearch,
  checkActiveSearch,
};

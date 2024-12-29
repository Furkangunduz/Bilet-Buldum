var admin = require("firebase-admin");
var serviceAccount = require("../../db_keys.json");

const initdb = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return admin.firestore();
  } catch (error) {
    console.log("Error trying to init db => ", error);
  }
};

module.exports = initdb;

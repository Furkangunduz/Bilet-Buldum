module.exports = function startEnv() {
  try {
    require("dotenv").config();
  } catch (error) {
    console.log("Error trying to start env => ", error);
  }
};

const saveUserToDb = async (db, { email, station_from, station_to, amount, date, id, time }) => {
  try {
    await db.collection("users").doc(id).set({ email, station_from, station_to, amount, date, id, time });
    console.log(`${email} başarıyla database'e kaydedildi.`, { email, station_from, station_to, amount, date, id, time });
  } catch (error) {
    console.log("kullanıcı db'ye kayıt edilirken sorun oluştu \n" + error);
    return 0;
  }
};

const getAllUsersFromDb = async (db) => {
  try {
    const response = await db.collection("users").get();
    const userList = [];
    response.forEach((doc) => userList.push(doc.data()));
    return userList;
  } catch (error) {
    console.log("Kullanıcılar Fetch edilirken bir sorun oluştu");
    console.log(error);
  }
};

const mapUserAndReturn = (users) => {
  return users.map(({ station_from, station_to, date, email, amount, id }) => {
    station_from, station_to, date, email, amount, id;
  });
};

const deleteUserFromDb = async (db, id) => {
  try {
    return await db.collection("users").doc(id).delete();
  } catch (error) {
    console.log("kullanıcıyı db'den silerken sorun oluştu ");
    console.log(error);
  }
};

module.exports = { saveUserToDb, getAllUsersFromDb, mapUserAndReturn, deleteUserFromDb };

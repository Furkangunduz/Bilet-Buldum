const removeUserFromUserList = (userList, userMail) => {
  try {
    for (let i = 0; i < userList.length; i++) {
      if (userMail.toLowerCase() == userList[i].email.toLowerCase()) {
        let id = userList[i].id;
        if (id) {
          userList.splice(i, 1);
          return id;
        }
      }
    }
    return null;
  } catch (error) {
    console.log("Error when removing user from user list", error);
  }
};
const logActiveUsers = (activeUsers) => {
  console.log("Yeni bir arama başlatıldı.");
  console.log("Active users :");
  activeUsers.forEach((user) => {
    console.log("---" + user?.email + ":", `${user?.station_from} ==> ${user?.station_to}` + `: ${user?.date} `, `time: ${user?.time}`);
  });
  console.log("\n");
};

module.exports = { removeUserFromUserList, logActiveUsers };

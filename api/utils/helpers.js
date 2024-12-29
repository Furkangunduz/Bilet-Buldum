function isPast(dateString) {
  var date = new Date(dateString.split(".").reverse().join("-"));
  if (
    date.getDate() === new Date().getDate() &&
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear()
  ) {
    return false;
  }
  return date.getTime() < new Date().getTime();
}

module.exports = { isPast };

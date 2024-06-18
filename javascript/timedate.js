function displayTime() {
  var d = new Date();
  var hour = d.getHours();
  var min = d.getMinutes();
  var sec = d.getSeconds();
  var amOrPm = "AM";
  if (hour >= 12) {
    amOrPm = "PM";
  }
  if (hour > 12) {
    hour = hour - 12;
  }
  if (hour < 10) hour = "0" + hour;
  if (min < 10) min = "0" + min;
  const timeString = hour + ":" + min + " " + amOrPm;
  document.getElementById("clock").innerHTML = timeString;
  if (window.innerWidth <= 1000) {
    document.getElementById("navbar-time").innerHTML = timeString;
  } else {
    document.getElementById("navbar-time").innerHTML = "";
  }
}
setInterval(displayTime, 1000);

function updateDate() {
  const dateInfoDiv = document.getElementById("date-info");
  const now = new Date();

  const year = now.getFullYear();
  const month = now.toLocaleString("default", { month: "long" });
  const date = now.getDate();
  const day = now.toLocaleString("default", { weekday: "long" });

  const dateString = `${date} ${month} ${year}`;
  dateInfoDiv.innerHTML = `<p>${dateString}</p>`;

  if (window.innerWidth <= 1000) {
    document.getElementById(
      "navbar-time"
    ).innerHTML += `, ${date} ${month} ${year}`;
  } else {
    document.getElementById("navbar-time").innerHTML = document
      .getElementById("navbar-time")
      .innerHTML.split(",")[0];
  }
}

setInterval(updateDate, 1000);

updateDate();
displayTime();

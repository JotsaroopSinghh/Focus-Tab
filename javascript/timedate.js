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
  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.innerHTML = timeString;
  if (window.innerWidth <= 1000) {
    document.getElementById("navbar-time").innerHTML = timeString;
  } else {
    const navEl = document.getElementById("navbar-time");
    if (navEl) navEl.innerHTML = "";
  }
}
setInterval(displayTime, 1000);

function updateDate() {
  const dateInfoDiv = document.getElementById("date-info");
  if (!dateInfoDiv) return;
  const now = new Date();

  const year = now.getFullYear();
  const month = now.toLocaleString("default", { month: "long" });
  const date = now.getDate();
  const day = now.toLocaleString("default", { weekday: "long" });

  const dateString = `${date} ${month} ${year}`;
  dateInfoDiv.innerHTML = `<p>${dateString}</p>`;

  if (window.innerWidth <= 1000) {
    const navEl2 = document.getElementById("navbar-time");
    if (navEl2) navEl2.innerHTML += `, ${date} ${month} ${year}`;
  } else {
    const navEl3 = document.getElementById("navbar-time");
    if (navEl3) navEl3.innerHTML = navEl3.innerHTML.split(",")[0];
  }
}

setInterval(updateDate, 1000);

updateDate();
displayTime();

// Re-init when widgets are re-rendered
window.addEventListener("ft:widgets-rendered", () => {
  try { updateDate(); } catch {}
  try { displayTime(); } catch {}
});

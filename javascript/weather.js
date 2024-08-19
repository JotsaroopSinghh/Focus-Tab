const apiKey = "b2555fafa1b34159865132010240908 ";
let intervalId;

document.getElementById("getWeather").addEventListener("click", () => {
  const city = document.getElementById("city").value;
  if (city) {
    fetchWeather(city);
    localStorage.setItem("city", city);
    clearInterval(intervalId);
    intervalId = setInterval(() => fetchWeather(city), 600000);
  }
});

document.getElementById("autoDetect").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherByCoords(lat, lon);
      clearInterval(intervalId);
      intervalId = setInterval(() => fetchWeatherByCoords(lat, lon), 600000);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const storedCity = localStorage.getItem("city");
  if (storedCity) {
    fetchWeather(storedCity);
    intervalId = setInterval(() => fetchWeather(storedCity), 600000);
  }
});

function fetchWeather(city) {
  fetch(
    `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`
  )
    .then((response) => response.json())
    .then((data) => displayWeather(data))
    .catch((error) => alert("Error fetching weather data: " + error));
}

function fetchWeatherByCoords(lat, lon) {
  fetch(
    `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`
  )
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data);
      localStorage.setItem("city", data.location.name);
    })
    .catch((error) => alert("Error fetching weather data: " + error));
}

function displayWeather(data) {
  if (data) {
    const weatherInfo = document.getElementById("weatherInfo");
    const widgetTitle = document.getElementById("widgetTitle");
    widgetTitle.style.display = "none";

    let weatherEmoji;
    const condition = data.current.condition.text.toLowerCase();
    if (condition.includes("clear")) {
      weatherEmoji = "☀️";
    } else if (condition.includes("cloud")) {
      weatherEmoji = "☁️";
    } else if (condition.includes("rain")) {
      weatherEmoji = "🌧️";
    } else if (condition.includes("snow")) {
      weatherEmoji = "❄️";
    } else {
      weatherEmoji = "🌤️";
    }

    weatherInfo.innerHTML = `
      <div class="city">
        <h3>${data.location.name}</h3><span id="editLocation">✏️</span>
      </div>
      <div class="weather-emoji">${weatherEmoji}</div>
      <div class="temperature">${data.current.temp_c}°C</div>
      <div class="details">
        <div>
          <div class="icon">🌡️</div>
          <p> ${data.current.feelslike_c}°C</p>
        </div>
        <div>
          <div class="icon">💧</div>
          <p> ${data.current.humidity}%</p>
        </div>
        <div>
          <div class="icon">🌬️</div>
          <p> ${data.current.wind_kph} kph</p>
        </div>
      </div>
    `;
    document.querySelector(".location-input").style.display = "none";
    document.getElementById("editLocation").addEventListener("click", () => {
      document.querySelector(".location-input").style.display = "block";
      document.getElementById("widgetTitle").style.display = "block";
      weatherInfo.innerHTML = "";
      localStorage.removeItem("city");
      clearInterval(intervalId);
    });

    updateNavbarWeather(data);
  } else {
    alert("City not found");
  }
}

function updateNavbarWeather(data) {
  const navbarTemperature = document.getElementById("navbar-temperature");
  if (window.innerWidth <= 1000) {
    let weatherEmoji;
    const condition = data.current.condition.text.toLowerCase();
    if (condition.includes("clear")) {
      weatherEmoji = "☀️";
    } else if (condition.includes("cloud")) {
      weatherEmoji = "☁️";
    } else if (condition.includes("rain")) {
      weatherEmoji = "🌧️";
    } else if (condition.includes("snow")) {
      weatherEmoji = "❄️";
    } else {
      weatherEmoji = "🌤️";
    }

    navbarTemperature.innerHTML = `${weatherEmoji} ${data.current.temp_c}°C`;
  } else {
    navbarTemperature.innerHTML = "";
  }
}

window.addEventListener("resize", () => {
  const storedCity = localStorage.getItem("city");
  if (storedCity) {
    fetchWeather(storedCity);
  }
});

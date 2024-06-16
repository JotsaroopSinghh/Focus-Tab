const apiKey = "5c4f40a3458f8908bee1d717b62fb8cf"; // Replace with your OpenWeatherMap API key
let intervalId;

document.getElementById("getWeather").addEventListener("click", () => {
  const city = document.getElementById("city").value;
  if (city) {
    fetchWeather(city);
    localStorage.setItem("city", city);
    clearInterval(intervalId);
    intervalId = setInterval(() => fetchWeather(city), 600000); // Update every 10 minutes
  }
});

document.getElementById("autoDetect").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherByCoords(lat, lon);
      clearInterval(intervalId);
      intervalId = setInterval(() => fetchWeatherByCoords(lat, lon), 600000); // Update every 10 minutes
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const storedCity = localStorage.getItem("city");
  if (storedCity) {
    fetchWeather(storedCity);
    intervalId = setInterval(() => fetchWeather(storedCity), 600000); // Update every 10 minutes
  }
});

function fetchWeather(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => displayWeather(data))
    .catch((error) => alert("Error fetching weather data: " + error));
}

function fetchWeatherByCoords(lat, lon) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  )
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data);
      localStorage.setItem("city", data.name);
    })
    .catch((error) => alert("Error fetching weather data: " + error));
}

function displayWeather(data) {
  if (data.cod === 200) {
    const weatherInfo = document.getElementById("weatherInfo");
    const widgetTitle = document.getElementById("widgetTitle");
    widgetTitle.style.display = "none";

    let weatherEmoji;
    const main = data.weather[0].main.toLowerCase();
    if (main.includes("clear")) {
      weatherEmoji = "☀️";
    } else if (main.includes("clouds")) {
      weatherEmoji = "☁️";
    } else if (main.includes("rain")) {
      weatherEmoji = "🌧️";
    } else if (main.includes("snow")) {
      weatherEmoji = "❄️";
    } else {
      weatherEmoji = "🌤️";
    }

    weatherInfo.innerHTML = `
                    <div class="city">
                        <h3>${data.name}</h3><span id="editLocation">✏️</span>
                    </div>
                    <div class="weather-emoji">${weatherEmoji}</div>
                    <div class="temperature">${data.main.temp}°C</div>
                    <div class="details">
                        <div>
                            <div class="icon">🌡️</div>
                            <p> ${data.main.feels_like}°C</p>
                        </div>
                        <div>
                            <div class="icon">💧</div>
                            <p> ${data.main.humidity}%</p>
                        </div>
                        <div>
                            <div class="icon">🌬️</div>
                            <p> ${data.wind.speed} m/s</p>
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
  } else {
    alert("City not found");
  }
}
  function checkWindowSize() {
        const closeButton = document.getElementById("close-btn");
        if (window.innerWidth <= 1000) {
          widget.style.display = "none";
          title.style.display = "block";
          closeButton.style.display = "block";
        } else {
          widget.style.display = "block";
          title.style.display = "none";
          closeButton.style.display = "none";
        }
      }

      function centerWidget() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const widgetWidth = widget.offsetWidth;
        const widgetHeight = widget.offsetHeight;
        const left = (windowWidth - widgetWidth) / 2;
        const top = (windowHeight - widgetHeight) / 2;

        widget.style.left = `${left}px`;
        widget.style.top = `${top}px`;
      }

      window.addEventListener("resize", checkWindowSize);
      window.addEventListener("load", checkWindowSize);

      title.addEventListener("click", () => {
        widget.style.display = "block";
        title.style.display = "none";
        centerWidget();
      });

      document.getElementById("close-btn").addEventListener("click", () => {
        widget.style.display = "none";
        title.style.display = "block";
      });

      window.addEventListener("load", centerWidget);
      window.addEventListener("resize", centerWidget);
let tasks = localStorage.getItem("tasks")
  ? JSON.parse(localStorage.getItem("tasks"))
  : [];

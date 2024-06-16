 let workMinutes = 25;
      let breakMinutes = 5;
      let isWorkTime = true;
      let timerInterval;
      let totalSeconds = workMinutes * 60;

      // Load saved presets and timer state from localStorage
      window.onload = function () {
        loadPresets();
        loadTimerState();
        updateTimerDisplay();
      };

      function savePresets() {
        const buttons = document.querySelectorAll(".preset-buttons button");
        const presets = Array.from(buttons).map((btn) => btn.textContent);
        localStorage.setItem("presets", JSON.stringify(presets));
      }

      function loadPresets() {
        const presets = JSON.parse(localStorage.getItem("presets"));
        if (presets) {
          document.getElementById("preset-buttons").innerHTML = "";
          presets.forEach((preset) => {
            const [work, breakTime] = preset.split("/").map(Number);
            const newButton = document.createElement("button");
            newButton.textContent = preset;
            newButton.onclick = () => setPreset(work, breakTime);
            document.getElementById("preset-buttons").appendChild(newButton);
          });
        }
      }

      function saveTimerState() {
        const timerState = {
          workMinutes,
          breakMinutes,
          isWorkTime,
          totalSeconds,
        };
        localStorage.setItem("timerState", JSON.stringify(timerState));
      }

      function loadTimerState() {
        const timerState = JSON.parse(localStorage.getItem("timerState"));
        if (timerState) {
          workMinutes = timerState.workMinutes;
          breakMinutes = timerState.breakMinutes;
          isWorkTime = timerState.isWorkTime;
          totalSeconds = timerState.totalSeconds;
          document.getElementById("status").textContent = isWorkTime
            ? "Work Time"
            : "Break Time";
        }
      }

      function setPreset(work, breakTime) {
        workMinutes = work;
        breakMinutes = breakTime;
        resetTimer();
      }

      function addPreset(event) {
        event.preventDefault();
        let work = parseInt(document.getElementById("work-time").value);
        let breakTime = parseInt(document.getElementById("break-time").value);
        if (isNaN(work) || isNaN(breakTime) || work <= 0 || breakTime <= 0) {
          alert("Invalid input");
          return;
        }
        const newButton = document.createElement("button");
        newButton.textContent = `${work}/${breakTime}`;
        newButton.onclick = () => setPreset(work, breakTime);
        document.getElementById("preset-buttons").appendChild(newButton);
        savePresets();
        document.getElementById("work-time").value = "";
        document.getElementById("break-time").value = "";
      }

      function startStopTimer() {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
          document.getElementById("start-stop-btn").textContent = "Start";
        } else {
          startTimer();
          document.getElementById("start-stop-btn").textContent = "Stop";
        }
      }

      function startTimer() {
        timerInterval = setInterval(() => {
          totalSeconds--;
          saveTimerState();
          if (totalSeconds < 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            playAlarm();
            if (isWorkTime) {
              isWorkTime = false;
              document.getElementById("status").textContent = "Break Time";
              totalSeconds = breakMinutes * 60;
              document.getElementById("start-break-btn").style.display =
                "inline";
              document.getElementById("start-stop-btn").style.display = "none";
            } else {
              isWorkTime = true;
              document.getElementById("status").textContent = "Work Time";
              totalSeconds = workMinutes * 60;
            }
            saveTimerState();
          }
          updateTimerDisplay();
        }, 1000);
      }

      function startBreak() {
        document.getElementById("start-break-btn").style.display = "none";
        document.getElementById("start-stop-btn").style.display = "inline";
        startTimer();
      }

      function updateTimerDisplay() {
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        document.getElementById("timer").textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }

      function resetTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
        isWorkTime = true;
        totalSeconds = workMinutes * 60;
        document.getElementById("status").textContent = "Work Time";
        document.getElementById("start-stop-btn").textContent = "Start";
        document.getElementById("start-stop-btn").style.display = "inline";
        document.getElementById("start-break-btn").style.display = "none";
        updateTimerDisplay();
        saveTimerState();
      }

      function playAlarm() {
        const alarmAudio = document.getElementById("alarm-audio");
        alarmAudio.play();
        setTimeout(stopAlarm, 3000); // Stop the alarm after 3 seconds
      }

      function stopAlarm() {
        const alarmAudio = document.getElementById("alarm-audio");
        alarmAudio.pause();
        alarmAudio.currentTime = 0; // Reset the audio to the beginning
      }
function checkPomodoroWindowSize() {
        const pomodoroWidget = document.getElementById("pomodoro-widget");
        const pomodoroTitle = document.getElementById("pomodoro-title");
        const closeButton = document.getElementById("pomodoro-close-btn");
        if (window.innerWidth <= 1000) {
          pomodoroWidget.style.display = "none";
          pomodoroTitle.style.display = "block";
          closeButton.style.display = "block";
        } else {
          pomodoroWidget.style.display = "block";
          pomodoroTitle.style.display = "none";
          closeButton.style.display = "none";
        }
      }

      function centerPomodoroWidget() {
        const pomodoroWidget = document.getElementById("pomodoro-widget");
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const widgetWidth = pomodoroWidget.offsetWidth;
        const widgetHeight = pomodoroWidget.offsetHeight;
        const left = (windowWidth - widgetWidth) / 2;
        const top = (windowHeight - widgetHeight) / 2;

        pomodoroWidget.style.left = `${left}px`;
        pomodoroWidget.style.top = `${top}px`;
      }

      window.addEventListener("resize", checkPomodoroWindowSize);
      window.addEventListener("load", checkPomodoroWindowSize);

      document
        .getElementById("pomodoro-title")
        .addEventListener("click", () => {
          const pomodoroWidget = document.getElementById("pomodoro-widget");
          const pomodoroTitle = document.getElementById("pomodoro-title");
          pomodoroWidget.style.display = "block";
          pomodoroTitle.style.display = "none";
          centerPomodoroWidget();
        });

      document
        .getElementById("pomodoro-close-btn")
        .addEventListener("click", () => {
          const pomodoroWidget = document.getElementById("pomodoro-widget");
          const pomodoroTitle = document.getElementById("pomodoro-title");
          pomodoroWidget.style.display = "none";
          pomodoroTitle.style.display = "block";
        });

      window.addEventListener("load", centerPomodoroWidget);
      window.addEventListener("resize", centerPomodoroWidget);

      updateTimerDisplay();
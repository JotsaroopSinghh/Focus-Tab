document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle");
  const audioElement = document.getElementById("audio");
  const trackList = document.querySelectorAll(".track-list li");
  const warningMessage = document.getElementById("warning");
  const coverArt = document.getElementById("cover-art");
  const coverArtText = document.querySelector(".cover-art-text");
  const navbarPlayButton = document.getElementById("navbar-play-button");

  let isPlaying = false;
  let currentAudio = null;

  const savedAudioSrc = localStorage.getItem("currentAudio");
  const savedCurrentTime = parseFloat(
    localStorage.getItem("currentTime") || "0"
  );

  if (savedAudioSrc) {
    audioElement.src = savedAudioSrc;
    currentAudio = savedAudioSrc;
    audioElement.currentTime = savedCurrentTime;

    trackList.forEach((track) => {
      if (track.getAttribute("data-audio") === savedAudioSrc) {
        track.classList.add("playing");

        const coverSrc = track.getAttribute("data-cover");
        coverArt.style.backgroundImage = `url('${coverSrc}')`;
        coverArt.textContent = "";
        coverArtText.style.display = "none";
      }
    });

    warningMessage.style.display = "none";
    toggleButton.disabled = false;
    toggleButton.textContent = "▶";
  }

  toggleButton.addEventListener("click", () => {
    if (isPlaying) {
      audioElement.pause();
      toggleButton.textContent = "▶";
      navbarPlayButton.textContent = "▶";
    } else {
      audioElement.play();
      toggleButton.textContent = "||";
      navbarPlayButton.textContent = "||";
    }
    isPlaying = !isPlaying;

    localStorage.setItem("isPlaying", isPlaying);
  });

  audioElement.addEventListener("timeupdate", () => {
    localStorage.setItem("currentTime", audioElement.currentTime);
  });

  trackList.forEach((track) => {
    track.addEventListener("click", () => {
      const audioSrc = track.getAttribute("data-audio");
      const coverSrc = track.getAttribute("data-cover");
      audioElement.src = audioSrc;
      currentAudio = audioSrc;
      audioElement.currentTime = 0;
      audioElement.play();
      isPlaying = true;
      toggleButton.textContent = "||";
      toggleButton.disabled = false;

      trackList.forEach((item) => {
        if (item === track) {
          item.classList.add("playing");
        } else {
          item.classList.remove("playing");
        }
      });

      warningMessage.style.display = "none";

      coverArt.style.backgroundImage = `url('${coverSrc}')`;
      coverArt.textContent = "";
      coverArtText.style.display = "none";

      localStorage.setItem("currentAudio", currentAudio);
      localStorage.setItem("currentTime", audioElement.currentTime);
    });
  });

  toggleButton.addEventListener("click", () => {
    if (!currentAudio) {
      coverArt.textContent = "🎵";
      coverArtText.style.display = "block";
    }
  });

  toggleButton.addEventListener("click", () => {
    if (!currentAudio) {
      warningMessage.style.display = "block";
    } else {
      warningMessage.style.display = "none";
    }
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle");
  const navbarPlayButton = document.getElementById("navbar-play-button");

  function updateNavbarPlayButton() {
    if (window.innerWidth <= 1000) {
      navbarPlayButton.style.display = "inline-block";
      toggleButton.style.display = "none";
    } else {
      navbarPlayButton.style.display = "none";
      toggleButton.style.display = "inline-block";
    }
  }

  updateNavbarPlayButton();

  window.addEventListener("resize", updateNavbarPlayButton);

  navbarPlayButton.addEventListener("click", () => {
    toggleButton.click();
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle");
  const audioElement = document.getElementById("audio");
  const trackList = document.querySelectorAll(".track-list li");
  const warningMessage = document.getElementById("warning");
  const coverArt = document.getElementById("cover-art");
  const coverArtText = document.querySelector(".cover-art-text");

  let isPlaying = false;
  let currentAudio = null;

  toggleButton.addEventListener("click", () => {
    if (isPlaying) {
      audioElement.pause();
      toggleButton.textContent = "▶"; // Show play icon
    } else {
      audioElement.play();
      toggleButton.textContent = "⏸"; // Show pause icon
    }
    isPlaying = !isPlaying;
  });

  trackList.forEach((track) => {
    track.addEventListener("click", () => {
      const audioSrc = track.getAttribute("data-audio");
      const coverSrc = track.getAttribute("data-cover");
      audioElement.src = audioSrc;
      currentAudio = audioSrc;
      audioElement.play();
      isPlaying = true;
      toggleButton.textContent = "⏸"; // Show pause icon
      toggleButton.disabled = false;

      // Highlight the currently playing track
      trackList.forEach((item) => {
        if (item === track) {
          item.classList.add("playing");
        } else {
          item.classList.remove("playing");
        }
      });

      // Show warning message if a track is selected
      warningMessage.style.display = "none";

      // Set cover art
      coverArt.style.backgroundImage = `url('${coverSrc}')`;
      coverArt.textContent = ""; // Clear default icon
      coverArtText.style.display = "none"; // Hide default text
    });
  });

  // Show default cover art when no track is selected
  toggleButton.addEventListener("click", () => {
    if (!currentAudio) {
      coverArt.textContent = "🎵"; // Show default icon
      coverArtText.style.display = "block"; // Show default text
    }
  });

  // Show warning message if no track is selected
  toggleButton.addEventListener("click", () => {
    if (!currentAudio) {
      warningMessage.style.display = "block";
    } else {
      warningMessage.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
            const toggleButton = document.getElementById("toggle");
            const audioElement = document.getElementById("audio");
            const trackList = document.querySelectorAll(".track-list li");
            const warningMessage = document.getElementById("warning");
            const coverArt = document.getElementById("cover-art");
            const coverArtText = document.querySelector(".cover-art-text");
            const musicWidget = document.getElementById("music-widget");
            const musicTitle = document.getElementById("music-title");
            const closeButton = document.getElementById("music-close-btn");

            let isPlaying = false;
            let currentAudio = null;

            const savedAudioSrc = localStorage.getItem("currentAudio");
            const savedCurrentTime = parseFloat(localStorage.getItem("currentTime") || "0");

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
                } else {
                    audioElement.play();
                    toggleButton.textContent = "||";
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

            function checkMusicWindowSize() {
                if (window.innerWidth <= 1000) {
                    musicWidget.style.display = 'none';
                    musicTitle.style.display = 'block';
                    closeButton.style.display = 'block';
                } else {
                    musicWidget.style.display = 'block';
                    musicTitle.style.display = 'none';
                    closeButton.style.display = 'none';
                }
            }

            function centerMusicWidget() {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const widgetWidth = musicWidget.offsetWidth;
                const widgetHeight = musicWidget.offsetHeight;
                const left = (windowWidth - widgetWidth) / 2;
                const top = (windowHeight - widgetHeight) / 2;

                musicWidget.style.left = `${left}px`;
                musicWidget.style.top = `${top}px`;
            }

            window.addEventListener('resize', checkMusicWindowSize);
            window.addEventListener('load', checkMusicWindowSize);

            musicTitle.addEventListener('click', () => {
                musicWidget.style.display = 'block';
                musicTitle.style.display = 'none';
                centerMusicWidget();
            });

            closeButton.addEventListener('click', () => {
                musicWidget.style.display = 'none';
                musicTitle.style.display = 'block';
            });

            window.addEventListener('load', centerMusicWidget);
            window.addEventListener('resize', centerMusicWidget);
        });
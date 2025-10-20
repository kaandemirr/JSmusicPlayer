const image = document.querySelector("#music-image");
const title = document.querySelector("#music-details .title");
const artist = document.querySelector("#music-details .artist");
const playPauseBtn = document.querySelector("#controls #play");
const prevBtn = document.querySelector("#controls #prev");
const nextBtn = document.querySelector("#controls #next");
const audio = document.querySelector("#audio");
const duration = document.querySelector("#duration");
const currentTime = document.querySelector("#current-time");
const progressBar = document.querySelector("#progress-bar");
const volumeBar = document.querySelector("#volume-bar");
const muteBtn = document.querySelector("#mute");
const playlistToggleBtn = document.querySelector("#playlist-toggle");
const playlistPanel = document.querySelector("#playlist-panel");
const playIcon = playPauseBtn ? playPauseBtn.querySelector("i") : null;
const muteIcon = muteBtn ? muteBtn.querySelector("i") : null;

const player = new MusicPlayer(musicList);
let lastVolume = 1;
let isSeeking = false;

window.addEventListener("load", () => {
    const currentMusic = player.getMusic();
    displayMusic(currentMusic);
    updatePlayButtonState(false);
    if (progressBar) {
        progressBar.value = 0;
    }
    renderPlaylist();
    updatePlaylistHighlight();
    if (volumeBar) {
        const initialVolume = parseFloat(volumeBar.value);
        audio.volume = isNaN(initialVolume) ? 1 : initialVolume;
        updateVolumeIcon();
    }
});

function updatePlayButtonState(isPlaying) {
    if (!playPauseBtn || !playIcon) {
        return;
    }
    playIcon.classList.remove("bi-play-fill", "bi-pause-fill");
    playIcon.classList.add(isPlaying ? "bi-pause-fill" : "bi-play-fill");
    playPauseBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
}

function displayMusic(music) {
    title.textContent = music.title;
    artist.textContent = music.artist;
    image.src = "img/" + music.img;
    audio.src = "mp3/" + music.src;
}

function playMusic() {
    audio.play();
    updatePlayButtonState(true);
}

function pauseMusic() {
    audio.pause();
    updatePlayButtonState(false);
}

function togglePlayback() {
    if (audio.paused) {
        playMusic();
    } else {
        pauseMusic();
    }
}

function setMusic(track) {
    displayMusic(track);
    audio.currentTime = 0;
    playMusic();
    updatePlaylistHighlight();
}

playPauseBtn?.addEventListener("click", togglePlayback);

function updateVolumeIcon() {
    if (!muteBtn || !muteIcon) {
        return;
    }
    const volumeLevel = audio.muted ? 0 : audio.volume;
    muteIcon.classList.remove("bi-volume-up-fill", "bi-volume-down-fill", "bi-volume-mute-fill");
    if (volumeLevel === 0) {
        muteIcon.classList.add("bi-volume-mute-fill");
    } else if (volumeLevel < 0.5) {
        muteIcon.classList.add("bi-volume-down-fill");
    } else {
        muteIcon.classList.add("bi-volume-up-fill");
    }
    muteBtn.setAttribute("aria-label", volumeLevel === 0 ? "Unmute Audio" : "Mute Audio");
}

function handleVolumeChange(event) {
    const value = parseFloat(event.target.value);
    if (isNaN(value)) {
        return;
    }
    audio.volume = value;
    audio.muted = value === 0;
    if (value > 0) {
        lastVolume = value;
    }
    updateVolumeIcon();
}

function toggleMute() {
    if (audio.muted || audio.volume === 0) {
        const restoreVolume = lastVolume > 0 ? lastVolume : 1;
        audio.volume = restoreVolume;
        audio.muted = false;
        if (volumeBar) {
            volumeBar.value = restoreVolume;
        }
    } else {
        lastVolume = audio.volume > 0 ? audio.volume : lastVolume;
        audio.volume = 0;
        audio.muted = true;
        if (volumeBar) {
            volumeBar.value = 0;
        }
    }
    updateVolumeIcon();
}

prevBtn.addEventListener("click", () => {
    const previous = player.prev();
    setMusic(previous);
});

nextBtn.addEventListener("click", () => {
    const next = player.next();
    setMusic(next);
});

audio.addEventListener("ended", () => {
    const next = player.next();
    setMusic(next);
});
const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
};

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = calculateTime(audio.duration);
    if (progressBar) {
        progressBar.max = Math.floor(audio.duration);
        progressBar.value = 0;
    }
    currentTime.textContent = calculateTime(0);
});

audio.addEventListener("timeupdate", () => {
    if (isSeeking) {
        return;
    }
    const currentSeconds = Math.floor(audio.currentTime);
    currentTime.textContent = calculateTime(currentSeconds);
    if (progressBar) {
        progressBar.value = currentSeconds;
    }
});

volumeBar?.addEventListener("input", handleVolumeChange);
muteBtn?.addEventListener("click", toggleMute);
playlistToggleBtn?.addEventListener("click", togglePlaylistPanel);
playlistPanel?.addEventListener("click", handlePlaylistClick);

function seekTo(value) {
    const seconds = Number(value);
    if (Number.isNaN(seconds)) {
        return;
    }
    audio.currentTime = seconds;
    if (!audio.paused) {
        playMusic();
    }
}

progressBar?.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
        return;
    }
    isSeeking = true;
    currentTime.textContent = calculateTime(value);
});

progressBar?.addEventListener("change", (event) => {
    const value = Number(event.target.value);
    if (Number.isNaN(value)) {
        isSeeking = false;
        return;
    }
    seekTo(value);
    isSeeking = false;
});

function togglePlaylistPanel() {
    if (!playlistPanel || !playlistToggleBtn) {
        return;
    }
    playlistPanel.classList.toggle("d-none");
    const expanded = !playlistPanel.classList.contains("d-none");
    playlistToggleBtn.setAttribute("aria-expanded", expanded.toString());
    playlistToggleBtn.setAttribute("aria-label", expanded ? "Hide Playlist" : "Show Playlist");
}

function renderPlaylist() {
    if (!playlistPanel) {
        return;
    }
    playlistPanel.innerHTML = "";
    const fragment = document.createDocumentFragment();
    musicList.forEach((music, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "list-group-item list-group-item-action playlist-item";
        item.dataset.index = index;
        item.innerHTML = `<span>${music.title}</span><span class="text-muted small ms-2">${music.artist}</span>`;
        fragment.appendChild(item);
    });
    playlistPanel.appendChild(fragment);
}

function updatePlaylistHighlight() {
    if (!playlistPanel) {
        return;
    }
    playlistPanel.querySelector(".playlist-item.active")?.classList.remove("active");
    const activeItem = playlistPanel.querySelector(
        `.playlist-item[data-index="${player.currentTrackIndex}"]`
    );
    if (activeItem) {
        activeItem.classList.add("active");
        activeItem.scrollIntoView({ block: "nearest" });
    }
}

function selectTrack(index) {
    const track = player.setTrack(index);
    setMusic(track);
}

function handlePlaylistClick(event) {
    const item = event.target.closest(".playlist-item");
    if (!item) {
        return;
    }
    const index = Number(item.dataset.index);
    if (Number.isNaN(index)) {
        return;
    }
    selectTrack(index);
}

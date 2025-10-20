const container = document.querySelector(".container");
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

const player = new MusicPlayer(musicList);
let lastVolume = 1;
let isSeeking = false;

window.addEventListener("load", () => {
    const currentMusic = player.getMusic();
    displayMusic(currentMusic);
    if (volumeBar) {
        const initialVolume = parseFloat(volumeBar.value);
        audio.volume = isNaN(initialVolume) ? 1 : initialVolume;
        updateVolumeIcon();
    }
});

function displayMusic(music) {
    title.textContent = music.title;
    artist.textContent = music.artist;
    image.src = "img/" + music.img;
    audio.src = "mp3/" + music.src;
}

function playMusic() {
    audio.play();
    playPauseBtn.classList.remove("fa-play");
    playPauseBtn.classList.add("fa-pause");
}

function pauseMusic() {
    audio.pause();
    playPauseBtn.classList.add("fa-play");
    playPauseBtn.classList.remove("fa-pause");
}

function togglePlayback() {
    const isPlaying = playPauseBtn.classList.contains("fa-pause");
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function setMusic(track) {
    displayMusic(track);
    audio.currentTime = 0;
    playMusic();
}

playPauseBtn.addEventListener("click", togglePlayback);

function updateVolumeIcon() {
    if (!muteBtn) {
        return;
    }
    muteBtn.classList.remove("fa-volume-high", "fa-volume-low", "fa-volume-xmark");
    const volumeLevel = audio.muted ? 0 : audio.volume;
    if (volumeLevel === 0) {
        muteBtn.classList.add("fa-volume-xmark");
    } else if (volumeLevel < 0.5) {
        muteBtn.classList.add("fa-volume-low");
    } else {
        muteBtn.classList.add("fa-volume-high");
    }
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

audio.addEventListener("timeupdate", () => {
    currentTime.textContent = calculateTime(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = calculateTime(audio.duration);
    progressBar.max = Math.floor(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    if (!isSeeking) {
        progressBar.value = Math.floor(audio.currentTime);
        currentTime.textContent = calculateTime(progressBar.value);
    }
});

if (volumeBar) {
    volumeBar.addEventListener("input", handleVolumeChange);
}

if (muteBtn) {
    muteBtn.addEventListener("click", toggleMute);
}

function seekTo(value) {
    audio.currentTime = value;
    if (!audio.paused) {
        playMusic();
    }
}

progressBar.addEventListener("input", (event) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value)) {
        return;
    }
    isSeeking = true;
    currentTime.textContent = calculateTime(value);
});

progressBar.addEventListener("change", (event) => {
    const value = parseFloat(event.target.value);
    if (isNaN(value)) {
        isSeeking = false;
        return;
    }
    seekTo(value);
    isSeeking = false;
});

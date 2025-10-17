const container = document.querySelector(".container");
const image = document.querySelector("#music-image");
const title = document.querySelector("#music-details .title");
const artist = document.querySelector("#music-details .artist");
const playPauseBtn = document.querySelector("#controls #play");
const prevBtn = document.querySelector("#controls #prev");
const nextBtn = document.querySelector("#controls #next");
const audio = document.querySelector("#audio");

const player = new MusicPlayer(musicList);

window.addEventListener("load", () => {
    const currentMusic = player.getMusic();
    displayMusic(currentMusic);
});

function displayMusic(music) {
    title.innerText = music.getName();
    artist.innerText = music.artist;
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
    playMusic();
}

playPauseBtn.addEventListener("click", togglePlayback);

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

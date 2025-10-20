class MusicPlayer {
    constructor(musicList) {
        this.musicList = musicList;
        this.currentTrackIndex = 0;
    }

    getMusic() {
        return this.musicList[this.currentTrackIndex];
    }

    next() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.musicList.length;
        return this.getMusic();
    }

    prev() {
        this.currentTrackIndex =
            (this.currentTrackIndex - 1 + this.musicList.length) % this.musicList.length;
        return this.getMusic();
    }

    setTrack(index) {
        if (index < 0 || index >= this.musicList.length) {
            return this.getMusic();
        }
        this.currentTrackIndex = index;
        return this.getMusic();
    }
}

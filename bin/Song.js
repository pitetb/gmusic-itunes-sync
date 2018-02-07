"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Song {
    constructor(id, title, artist, album, durationSeconds, rating) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.rating = rating;
        this.durationSeconds = durationSeconds;
    }
    toString() {
        return this.id + " - " + this.title + " - " + this.album + " - " + this.artist + " - " + this.durationSeconds + " - " + this.rating;
    }
}
exports.Song = Song;
class ITSong extends Song {
    constructor(id, title, artist, album, durationSeconds, rating) {
        super(id, title, artist, album, durationSeconds, rating);
        // On itunes, when a track has one star, the rating value is 20
        // 2 stars is 40, 3 stars is 60 etc..
        this.numberOfStars = this.rating / 20;
    }
}
exports.ITSong = ITSong;
class GSong extends Song {
    constructor(id, title, artist, album, durationSeconds, rating) {
        super(id, title, artist, album, durationSeconds, rating);
    }
    // On Google music, rating number is as follow:
    // 5 = thumb up, 1 = thumb down, 0 = no thumb (2, 3 seems to do nothing)
    get GTrackThumbs() {
        if (this.rating == 5) {
            return GTrackThumbs.Up;
        }
        else if (this.rating == 1) {
            return GTrackThumbs.Down;
        }
        else {
            return GTrackThumbs.Neutral;
        }
    }
    set GTrackThumbs(newThumb) {
        if (newThumb == GTrackThumbs.Up) {
            this.rating = 5;
        }
        else if (newThumb == GTrackThumbs.Down) {
            this.rating = 1;
        }
        else {
            this.rating = 0;
        }
    }
}
exports.GSong = GSong;
var GTrackThumbs;
(function (GTrackThumbs) {
    GTrackThumbs[GTrackThumbs["Up"] = 5] = "Up";
    GTrackThumbs[GTrackThumbs["Neutral"] = 0] = "Neutral";
    GTrackThumbs[GTrackThumbs["Down"] = 1] = "Down";
})(GTrackThumbs = exports.GTrackThumbs || (exports.GTrackThumbs = {}));
//# sourceMappingURL=Song.js.map
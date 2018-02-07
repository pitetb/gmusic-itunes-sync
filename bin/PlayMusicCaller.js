"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const playmusic = require("playmusic");
const Song_1 = require("./Song");
class PlayMusicCaller {
    constructor(syncMessageDispatcher, longTaskDispatcher) {
        this.pm = new playmusic();
        this._onSyncMessage = syncMessageDispatcher;
        this._onLongTaskProgress = longTaskDispatcher;
    }
    loadAllGMusicSongs(userSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield this.connectToGoogleMusic(userSettings);
            yield this.loadMusicLib();
        });
    }
    connectToGoogleMusic(userSettings) {
        var that = this;
        this._onSyncMessage.dispatch("Try to login");
        return new Promise((resolve, reject) => {
            this.pm.init({ email: userSettings.gLogin, password: userSettings.gPasswd }, function (error) {
                if (error) {
                    that._onSyncMessage.dispatch("Login error, check the login/password provided");
                    reject(new Error(error));
                    return;
                }
                that._onSyncMessage.dispatch("Login successfully");
                resolve(true);
            });
        });
    }
    loadMusicLib() {
        return __awaiter(this, void 0, void 0, function* () {
            this.allSongs = new Array();
            this.thumbsUpSongs = new Array();
            this.thumbsDownSongs = new Array();
            let options = {};
            let keepGoing = true;
            this._onSyncMessage.dispatch("Retrieving Google Music library...");
            while (keepGoing) {
                let rep = yield this.getGMTracks(options);
                if (rep.data) {
                    // Add page's results to returned hashmap
                    rep.data.forEach((element) => {
                        this.allSongs.push(element);
                        if (element.GTrackThumbs == Song_1.GTrackThumbs.Up) {
                            this.thumbsUpSongs.push(new Song_1.GSong(element.id, element.title, element.artist, element.album, element.durationSeconds, element.GTrackThumbs));
                        }
                        else if (element.GTrackThumbs == Song_1.GTrackThumbs.Down) {
                            this.thumbsDownSongs.push(new Song_1.GSong(element.id, element.title, element.artist, element.album, element.durationSeconds, element.GTrackThumbs));
                        }
                    });
                    this._onSyncMessage.dispatch(this.allSongs.length + " retrieved.");
                }
                if (rep.nextPageToken) {
                    keepGoing = true;
                    options['nextPageToken'] = rep.nextPageToken;
                    this._onSyncMessage.dispatch("Continue...");
                }
                else {
                    keepGoing = false;
                }
            }
        });
    }
    getGMTracks(options) {
        return new Promise((resolve, reject) => {
            // Returned dictionnary
            options['limit'] = 5000;
            var googleMusicSongs = new TracksRep();
            this.pm.getLibrary(options, function (error, response) {
                if (!error) {
                    googleMusicSongs.nextPageToken = response.nextPageToken;
                    // Create songs hasmaps                        
                    response.data.items.forEach(s => {
                        let oneSong = new Song_1.GSong(s.id, s.title, s.artist, s.album, Math.round(s.durationMillis / 1000), s.rating);
                        googleMusicSongs.data.push(oneSong);
                    });
                    resolve(googleMusicSongs);
                }
                else {
                    console.log(error);
                    reject(new Error(error));
                }
            });
        });
    }
    //let trackTen = res.get("81cd7fe2-997b-34ea-bc76-591d06f16960");
    updateSongRating(song) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                /* Change metadata of a track a library
                * Currently only support changing rating
                * You need to change a song object with a different rating value:
                * 5 = thumb up, 1 = thumb down, 0 = no thumb (2, 3 seems to do nothing)
                * @param song object - the track dictionnary. You can get from getAllAccessTrack or from getLibrary
                * @param callback function(err, success) - success callback
                */
                //  song.rating = rating;
                this.pm.changeTrackMetadata(song, function (error, success) {
                    if (error) {
                        console.log(error);
                        reject(new Error(error));
                        return;
                    }
                    resolve();
                });
            });
        });
    }
}
exports.PlayMusicCaller = PlayMusicCaller;
class TracksRep {
    constructor() {
        this.data = new Array();
    }
}
//# sourceMappingURL=PlayMusicCaller.js.map
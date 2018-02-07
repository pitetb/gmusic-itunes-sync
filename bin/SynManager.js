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
const SynFinalReport_1 = require("./SynFinalReport");
const Song_1 = require("./Song");
const PlayMusicCaller_1 = require("./PlayMusicCaller");
const ITLibParser_1 = require("./ITLibParser");
const strongly_typed_events_1 = require("strongly-typed-events");
const SynProgress_1 = require("./SynProgress");
const Loki = require("lokijs");
class SynManager {
    constructor(userSettings) {
        // Events about progression
        this._onSyncProgress = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onSyncMessage = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onLongTaskProgress = new strongly_typed_events_1.SimpleEventDispatcher();
        this._onSyncTerminated = new strongly_typed_events_1.SimpleEventDispatcher();
        this.synReport = new SynFinalReport_1.SynFinalReport();
        this.userSettings = userSettings;
    }
    //expose the events as properties:    
    get onSyncProgress() {
        return this._onSyncProgress.asEvent();
    }
    get onSyncMessage() {
        return this._onSyncMessage.asEvent();
    }
    get onLongTaskProgress() {
        return this._onLongTaskProgress.asEvent();
    }
    get onSyncTerminated() {
        return this._onSyncTerminated.asEvent();
    }
    prepareSynchronisation() {
        return __awaiter(this, void 0, void 0, function* () {
            /* let song1:ITSong = new ITSong("1", "Old Artist", "Archive", "Londinium", 5,  20);
            let song2:ITSong = new ITSong("2", "Darkroom", "Archive", "Londinium", 5, 20);
            let song3:ITSong = new ITSong("3", "Skyscrapper", "Archive", "Londinium", 5, 20);
            let song4:ITSong = new ITSong("4", "Creature Comfort", "Arcade Fire", "Everything now", 5, 20);
            let song5:ITSong = new ITSong("5", "Darkroom", "Archive", "Live", 5, 20);

            let gsong1:GSong = new GSong("5", "Darkroom", "Archive", "Live", 5, 0);
            let gsong2:GSong = new GSong("6", "Darkroom", "Archive", "Live", 5, 5);
            let gsong3:GSong = new GSong("7", "Darkroom", "Archive", "Live", 5, 2);
            let gsongs:Array<GSong> = [gsong1, gsong2, gsong3];
            
            let songToSearch1:ITSong = new ITSong("dsdqd", "darkroom", "Archive ", "Londinium", 5, 20);
            let songToSearch2:ITSong = new ITSong("dsdqd", "darkroom ", "Archive", "Londinium", 5, 20);
            let songToSearch3:ITSong = new ITSong("dsdqd", "darkroom", "Archive", "Londinium ", 5, 20);
            let songToSearch4:ITSong = new ITSong("dsdqd", "darkroom", "Archive ", "Londinium", 5, 20);

            // Test Lokijs
            let db:Loki = new Loki('sync1.db');
            let itsongs:Loki.Collection = db.addCollection('itsongs', { indices: ['title', 'artist' , 'album', 'durationSeconds'] });
            itsongs.insert(gsongs);
            let iuo:Array<GSong> = itsongs.find();
            let truc:GSong = itsongs.findOne();
            console.log(truc.GTrackThumbs);
            truc.GTrackThumbs = GTrackThumbs.Up;
            console.log(truc.GTrackThumbs); */
            // Prepare lokijs DB to store all lists of songs
            let lokidb = new Loki('sync.db');
            // Raise start event
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, "Starting synchronisation"));
            this.synReport.startDateTime = new Date();
            // Prepare data services
            this.playMusic = new PlayMusicCaller_1.PlayMusicCaller(this._onSyncMessage, this._onLongTaskProgress);
            let itunesParser = new ITLibParser_1.ITLibParser(this.userSettings.itLibraryPath, this._onSyncMessage, this._onLongTaskProgress);
            // Start XML parsing
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, "Retrieving rated songs in iTunes library..."));
            let itunesRatedSongs = yield itunesParser.readItunesFileAndGetRatedITSongsAsync(this.userSettings.itLibraryPath);
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, itunesRatedSongs.size + " rated songs find in itunes."));
            // Retrieve google music songs and store them on the loki database
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, "Retrieving Google Music library..."));
            yield this.playMusic.loadAllGMusicSongs(this.userSettings);
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, this.playMusic.allSongs.length + " songs founded in Google Music Library."));
            let googleMusicSongs = lokidb.addCollection('googlemusicsongs', { indices: ['title', 'artist', 'album', 'durationSeconds'] });
            googleMusicSongs.insert(this.playMusic.allSongs);
            let thumbedMusicSongs = lokidb.addCollection('thumbupgooglemusicsongs', { indices: ['title', 'artist', 'album', 'durationSeconds'] });
            thumbedMusicSongs.insert(this.playMusic.thumbsUpSongs);
            thumbedMusicSongs.insert(this.playMusic.thumbsDownSongs);
            // For each itunes rated songs, search the same song in Google Music songs
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, "Starting to compare..."));
            let alliTunesSongs = Array.from(itunesRatedSongs.values());
            let toThumbUp = new Array();
            let toThumbNeutral = new Array();
            let notFoundOnGMusic = new Array();
            for (let index = 0; index < alliTunesSongs.length; index++) {
                const oneITSong = alliTunesSongs[index];
                // Search on thumb up songs with lokijs
                let songMatch = this.searchSongMatching(oneITSong, thumbedMusicSongs);
                // If found, test if the thum is up, in case not, add it to the list, then remove it from the thumbed list and do nothing (song rated in GMusic and rated in iTunes)
                if (songMatch != null) {
                    if (songMatch.GTrackThumbs != Song_1.GTrackThumbs.Up) {
                        toThumbUp.push(songMatch);
                    }
                    thumbedMusicSongs.remove(songMatch);
                    //this._onSyncProgress.dispatch(new SynProgress(SynState.InProgress, "Already rated"));            
                    continue;
                }
                // If not found, search on all GMumic Library
                songMatch = this.searchSongMatching(oneITSong, googleMusicSongs);
                // If found on GMUsic, update the rating, then add to "thumb added" for final report
                if (songMatch != null) {
                    toThumbUp.push(songMatch);
                    //this._onSyncProgress.dispatch(new SynProgress(SynState.InProgress, "Need to be rated"));
                    continue;
                }
                // If not found, add to 'not found list"
                notFoundOnGMusic.push(oneITSong);
                //this._onSyncProgress.dispatch(new SynProgress(SynState.InProgress, "Treating : " + oneITSong.toString()));
                //this._onSyncProgress.dispatch(new SynProgress(SynState.InProgress, "Not found"));
            }
            // The remaining songs in the Google Thumb music list (up or down), are the songs rated in GMusic but not in iTunes
            // Should be set in neutral in GMusic to make both libraries sync
            toThumbNeutral = thumbedMusicSongs.find();
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ComparaisonInProgress, "Compare finished"));
            // Make the report
            this.synReport.songsThumbToAdd = toThumbUp;
            this.synReport.songsThumbToRemove = toThumbNeutral;
            this.synReport.songsNotFounded = notFoundOnGMusic;
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.ReadyToSyn, "Comparaison done. Ready to apply changes."));
            //trackTen.GTrackThumbs = GTrackThumbs.Up;
            //await playMusic.updateSongRating(trackTen);
            // TO DO IN PARRALLEL
            // PARSE ITUNES LIB
            // RETRIEVE GOOGLE MUSIC LIB
            //await Promise.all([ itunesParser.readItunesFileAndGetRatedITSongsAsync(userSettings.itLibraryPath), playMusic.getAllGMusicSongs(userSettings)  ]) ;
            //console.log("Both finished");
        });
    }
    applySynchronisation() {
        return __awaiter(this, void 0, void 0, function* () {
            // Raise start event
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.SynInProgress, "Starting applying synchronisation"));
            // Updating thumb up
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.SynInProgress, "Applying thumb up"));
            for (let index = 0; index < this.synReport.songsThumbToAdd.length; index++) {
                const oneSong = this.synReport.songsThumbToAdd[index];
                this._onLongTaskProgress.dispatch(new SynProgress_1.LongTaskProgress(index + 1, this.synReport.songsThumbToAdd.length, "Sync track : " + oneSong.toString()));
                oneSong.GTrackThumbs = Song_1.GTrackThumbs.Up;
                yield this.playMusic.updateSongRating(oneSong);
                this._onLongTaskProgress.dispatch(new SynProgress_1.LongTaskProgress(index + 1, this.synReport.songsThumbToAdd.length, "Done"));
            }
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.SynInProgress, "Applying thumb up finished"));
            // updating thum down
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.SynInProgress, "Applying thumb neutral"));
            for (let index = 0; index < this.synReport.songsThumbToRemove.length; index++) {
                const oneSong = this.synReport.songsThumbToRemove[index];
                this._onLongTaskProgress.dispatch(new SynProgress_1.LongTaskProgress(index + 1, this.synReport.songsThumbToRemove.length, "Sync track : " + oneSong.toString()));
                oneSong.GTrackThumbs = Song_1.GTrackThumbs.Neutral;
                this.playMusic.updateSongRating(oneSong);
                this._onLongTaskProgress.dispatch(new SynProgress_1.LongTaskProgress(index + 1, this.synReport.songsThumbToRemove.length, "Done"));
            }
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.SynInProgress, "Applying thumb neutral finished"));
            // Raise end event
            this.synReport.endDateTime = new Date();
            this._onSyncProgress.dispatch(new SynProgress_1.SynProgress(SynProgress_1.SynState.FinishedSucessfully, "Synchronisation finished"));
        });
    }
    escapeRegExp(str) {
        if (str)
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        else
            return str;
    }
    searchSongMatching(toSearch, collection) {
        let result = this.searchSongExactMatching(toSearch, collection);
        if (result) {
            return result;
        }
        result = this.searchSongTitleAlbumAndTimeMatching(toSearch, collection);
        if (result) {
            return result;
        }
        result = this.searchSongTitleArtistAndTimeMatching(toSearch, collection);
        if (result) {
            return result;
        }
        result = this.searchSongArtistAlbumAndTimeMatching(toSearch, collection);
        if (result) {
            return result;
        }
        result = this.searchTitleAndDurationAndNoAlbumOrArtistMatching(toSearch, collection);
        if (result) {
            return result;
        }
        return result;
    }
    /**
     * Helper method
     */
    searchSongMatchingText(title, artist, album, duration, rating, collection) {
        let aSong = new Song_1.Song("1", title, artist, album, duration, rating);
        return this.searchSongMatching(aSong, collection);
    }
    /**
     * First match test
     * @param toSearch
     * @param collection
     */
    searchSongExactMatching(toSearch, collection) {
        let result = collection.findOne({ '$and': [{ 'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] } },
                { 'artist': { '$regex': [this.escapeRegExp(toSearch.artist), 'i'] } },
                { 'album': { '$regex': [this.escapeRegExp(toSearch.album), 'i'] } }
            ] });
        return result;
    }
    /**
     * Second match test
     * @param toSearch
     * @param collection
     */
    searchSongTitleAlbumAndTimeMatching(toSearch, collection) {
        let result = collection.findOne({ '$and': [{ 'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] } },
                { 'durationSeconds': { '$eq': toSearch.durationSeconds } },
                { 'album': { '$regex': [this.escapeRegExp(toSearch.album), 'i'] } }
            ] });
        return result;
    }
    /**
     * Third match test
     * @param toSearch
     * @param collection
     */
    searchSongTitleArtistAndTimeMatching(toSearch, collection) {
        let result = collection.findOne({ '$and': [{ 'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] } },
                { 'artist': { '$regex': [this.escapeRegExp(toSearch.artist), 'i'] } },
                { 'durationSeconds': { '$eq': toSearch.durationSeconds } },
            ] });
        return result;
    }
    /**
     * Fourth match test
     * @param toSearch
     * @param collection
     */
    searchSongArtistAlbumAndTimeMatching(toSearch, collection) {
        let result = collection.findOne({ '$and': [{ 'durationSeconds': { '$eq': toSearch.durationSeconds } },
                { 'artist': { '$regex': [this.escapeRegExp(toSearch.artist), 'i'] } },
                { 'album': { '$regex': [this.escapeRegExp(toSearch.album), 'i'] } }
            ] });
        return result;
    }
    /**
     * Fifth match test
     * @param toSearch
     * @param collection
     */
    searchTitleAndDurationAndNoAlbumOrArtistMatching(toSearch, collection) {
        let result = collection.findOne({ '$and': [{ 'durationSeconds': { '$eq': toSearch.durationSeconds } },
                { 'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] } },
                { 'artist': { '$regex': ["", 'i'] } },
                { 'album': { '$regex': ["", 'i'] } }
            ] });
        return result;
    }
}
exports.SynManager = SynManager;
//# sourceMappingURL=SynManager.js.map
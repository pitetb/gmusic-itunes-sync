import { UserSettings } from "./UserSettings";
import * as playmusic from 'playmusic';
import { Song, GSong, GTrackThumbs } from "./Song";
import { SimpleEventDispatcher } from "strongly-typed-events";
import { LongTaskProgress } from "./SynProgress";


export class PlayMusicCaller {    

        private pm:playmusic;

        public allSongs:Array<GSong> ;
        public thumbsUpSongs:Array<GSong>;
        public thumbsDownSongs:Array<GSong>;


        // Event dispatcher
        protected _onSyncMessage:SimpleEventDispatcher<string>;
        protected _onLongTaskProgress:SimpleEventDispatcher<LongTaskProgress>;


        public constructor(syncMessageDispatcher:SimpleEventDispatcher<string>,
            longTaskDispatcher:SimpleEventDispatcher<LongTaskProgress>) {
            this.pm = new playmusic();
            this._onSyncMessage = syncMessageDispatcher;
            this._onLongTaskProgress = longTaskDispatcher;
        }


        public async loadAllGMusicSongs(userSettings: UserSettings) {            
            let res = await this.connectToGoogleMusic(userSettings);          
            await this.loadMusicLib();
        }
        
        protected connectToGoogleMusic(userSettings: UserSettings) {
            var that = this;
            this._onSyncMessage.dispatch("Try to login");
            return new Promise( (resolve, reject) => {
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
        
        protected async loadMusicLib() {
            
            this.allSongs = new Array<GSong>();
            this.thumbsUpSongs = new Array<GSong>();
            this.thumbsDownSongs = new Array<GSong>();

            let options:any = {};
            let keepGoing = true;
            this._onSyncMessage.dispatch("Retrieving Google Music library...");

            while (keepGoing) {
                let rep = await this.getGMTracks(options);
                if (rep.data) {
                    
                    // Add page's results to returned hashmap
                    rep.data.forEach((element: GSong) => {
                        this.allSongs.push(element); 
                        if (element.GTrackThumbs == GTrackThumbs.Up) {
                            this.thumbsUpSongs.push(new GSong(element.id, element.title, element.artist, element.album, element.durationSeconds, element.GTrackThumbs ));
                        } else if (element.GTrackThumbs == GTrackThumbs.Down) {
                            this.thumbsDownSongs.push(new GSong(element.id, element.title, element.artist, element.album, element.durationSeconds, element.GTrackThumbs ));
                        }
                    });
                    this._onSyncMessage.dispatch(this.allSongs.length + " retrieved.");
                }
                if (rep.nextPageToken) { // if set, this is the next URL to query
                    keepGoing = true;
                    options['nextPageToken'] = rep.nextPageToken;
                    this._onSyncMessage.dispatch("Continue...");
                } else {
                    keepGoing = false;
                }
            }
        }

        protected getGMTracks(options):Promise<TracksRep> {
            return new Promise( (resolve, reject) => {

                // Returned dictionnary
                options['limit'] = 5000;
                var googleMusicSongs:TracksRep = new TracksRep();
                this.pm.getLibrary(options, function (error, response) {
                    if (!error) {
                        googleMusicSongs.nextPageToken = response.nextPageToken;
                        // Create songs hasmaps                        
                        response.data.items.forEach(s => {
                            let oneSong:GSong = new GSong(s.id, s.title, s.artist, s.album, Math.round(s.durationMillis / 1000), s.rating);
                            googleMusicSongs.data.push(oneSong);
                        });
                        resolve(googleMusicSongs);
                    } else {
                        console.log(error);
                        reject(new Error(error));
                    }
                }
                );

            });
        }

         //let trackTen = res.get("81cd7fe2-997b-34ea-bc76-591d06f16960");
        public async updateSongRating(song:GSong) {
            
            return new Promise( (resolve, reject) => {
            
                /* Change metadata of a track a library
                * Currently only support changing rating
                * You need to change a song object with a different rating value:
                * 5 = thumb up, 1 = thumb down, 0 = no thumb (2, 3 seems to do nothing)
                * @param song object - the track dictionnary. You can get from getAllAccessTrack or from getLibrary
                * @param callback function(err, success) - success callback
                */
                
                //  song.rating = rating;
                this.pm.changeTrackMetadata(song, function(error, success) {
                    if (error) {
                        console.log(error);
                        reject(new Error(error));
                        return;
                    }
                    resolve();

                });

        });
    }
}

export class TracksRep {
    data:Array<GSong>;
    nextPageToken:string;
    constructor() {
        this.data = new Array<GSong>();
    }
}

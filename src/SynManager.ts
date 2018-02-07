import { SynFinalReport } from "./SynFinalReport";
import { UserSettings } from "./UserSettings";
import { Song, ITSong, GSong, GTrackThumbs } from "./Song";
import * as events from 'strongly-typed-events';
import { PlayMusicCaller } from "./PlayMusicCaller";
import { ITLibParser } from "./ITLibParser";
import { SimpleEventDispatcher, EventDispatcher, ISignal, ISimpleEvent } from "strongly-typed-events";
import { SynProgress, LongTaskProgress, SynState } from "./SynProgress";
import * as Loki from 'lokijs';

    
export class SynManager {    


        // Events about progression
        protected _onSyncProgress = new SimpleEventDispatcher<SynProgress>();
        protected _onSyncMessage = new SimpleEventDispatcher<string>();
        protected _onLongTaskProgress = new SimpleEventDispatcher<LongTaskProgress>();
        protected _onSyncTerminated = new SimpleEventDispatcher<SynFinalReport>();

        //expose the events as properties:    
        public get onSyncProgress(): ISimpleEvent<SynProgress> {
            return this._onSyncProgress.asEvent();
        }

        public get onSyncMessage(): ISimpleEvent<string> {
            return this._onSyncMessage.asEvent();
        }

        public get onLongTaskProgress(): ISimpleEvent<LongTaskProgress> {
            return this._onLongTaskProgress.asEvent();
        }

        public get onSyncTerminated() : ISimpleEvent<SynFinalReport>{
            return this._onSyncTerminated.asEvent();
        }

        
        //dispath the events (example)
        //this._onTick.dispatch();
        //this._onSequenceTick.dispatch(this._ticks);
        //this._onClockTick.dispatch(this, this._ticks);

        public userSettings:UserSettings;

        public synReport:SynFinalReport;

        protected playMusic:PlayMusicCaller;

        public constructor(userSettings: UserSettings) {
            this.synReport = new SynFinalReport();
            this.userSettings = userSettings;
        }

        public async prepareSynchronisation() {
            
            /* DATA FOR SOME TESTING */
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
            let lokidb:Loki = new Loki('sync.db');
            
            // Raise start event
            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, "Starting synchronisation"));
            this.synReport.startDateTime = new Date();

            // Prepare data services
            this.playMusic = new PlayMusicCaller(this._onSyncMessage, this._onLongTaskProgress);
            let itunesParser:ITLibParser = new ITLibParser(this.userSettings.itLibraryPath, this._onSyncMessage, this._onLongTaskProgress);

            // Start XML parsing
            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, "Retrieving rated songs in iTunes library..."));
            let itunesRatedSongs:Map<string,ITSong> = await itunesParser.readItunesFileAndGetRatedITSongsAsync(this.userSettings.itLibraryPath);
            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, itunesRatedSongs.size + " rated songs find in itunes."));
            
            // Retrieve google music songs and store them on the loki database
            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, "Retrieving Google Music library..."));
            await this.playMusic.loadAllGMusicSongs(this.userSettings);
            
           
            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, this.playMusic.allSongs.length + " songs founded in Google Music Library."));
            
            let googleMusicSongs:Loki.Collection<GSong> = lokidb.addCollection('googlemusicsongs' , { indices: ['title', 'artist' , 'album', 'durationSeconds'] } );
            googleMusicSongs.insert(this.playMusic.allSongs);

            let thumbedMusicSongs:Loki.Collection<GSong> = lokidb.addCollection('thumbupgooglemusicsongs'  , { indices: ['title', 'artist' , 'album', 'durationSeconds'] } );
            thumbedMusicSongs.insert(this.playMusic.thumbsUpSongs);
            thumbedMusicSongs.insert(this.playMusic.thumbsDownSongs);            

            // For each itunes rated songs, search the same song in Google Music songs
            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, "Starting to compare..."));
            let alliTunesSongs:Array<ITSong> = Array.from(itunesRatedSongs.values());

            let toThumbUp:Array<GSong> = new Array();
            let toThumbNeutral:Array<GSong> = new Array();
            let notFoundOnGMusic:Array<ITSong> = new Array();
            
            
            for (let index = 0; index < alliTunesSongs.length; index++) {
                const oneITSong:ITSong = alliTunesSongs[index];                    

                // Search on thumb up songs with lokijs
                let songMatch:GSong = this.searchSongMatching(oneITSong, thumbedMusicSongs);
                                
                // If found, test if the thum is up, in case not, add it to the list, then remove it from the thumbed list and do nothing (song rated in GMusic and rated in iTunes)
                if (songMatch != null) {
                    if (songMatch.GTrackThumbs != GTrackThumbs.Up)  
                    {    
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

            this._onSyncProgress.dispatch(new SynProgress(SynState.ComparaisonInProgress, "Compare finished"));

            // Make the report
            this.synReport.songsThumbToAdd = toThumbUp;
            this.synReport.songsThumbToRemove = toThumbNeutral;
            this.synReport.songsNotFounded = notFoundOnGMusic;
            
            this._onSyncProgress.dispatch(new SynProgress(SynState.ReadyToSyn, "Comparaison done. Ready to apply changes."));
                       
           
            
            //trackTen.GTrackThumbs = GTrackThumbs.Up;
            //await playMusic.updateSongRating(trackTen);
        }


        public async applySynchronisation() {
            
            // Raise start event
            this._onSyncProgress.dispatch(new SynProgress(SynState.SynInProgress, "Starting applying synchronisation"));
            
            // Updating thumb up
            this._onSyncProgress.dispatch(new SynProgress(SynState.SynInProgress, "Applying thumb up"));
            for (let index = 0; index < this.synReport.songsThumbToAdd.length; index++) {
                const oneSong = this.synReport.songsThumbToAdd[index];                
                this._onLongTaskProgress.dispatch(new LongTaskProgress(index + 1, this.synReport.songsThumbToAdd.length, "Sync track : " + oneSong.toString()));
                oneSong.GTrackThumbs = GTrackThumbs.Up;
                await this.playMusic.updateSongRating(oneSong);  
                this._onLongTaskProgress.dispatch(new LongTaskProgress(index + 1, this.synReport.songsThumbToAdd.length, "Done"));              
            }
            this._onSyncProgress.dispatch(new SynProgress(SynState.SynInProgress, "Applying thumb up finished"));
            

            // updating thum down
            this._onSyncProgress.dispatch(new SynProgress(SynState.SynInProgress, "Applying thumb neutral"));
            for (let index = 0; index < this.synReport.songsThumbToRemove.length; index++) {
                const oneSong = this.synReport.songsThumbToRemove[index];                
                this._onLongTaskProgress.dispatch(new LongTaskProgress(index + 1, this.synReport.songsThumbToRemove.length, "Sync track : " + oneSong.toString()));
                oneSong.GTrackThumbs = GTrackThumbs.Neutral;
                this.playMusic.updateSongRating(oneSong);  
                this._onLongTaskProgress.dispatch(new LongTaskProgress(index + 1, this.synReport.songsThumbToRemove.length, "Done"));              
            }
            this._onSyncProgress.dispatch(new SynProgress(SynState.SynInProgress, "Applying thumb neutral finished"));
            
            // Raise end event
            this.synReport.endDateTime = new Date();
            this._onSyncProgress.dispatch(new SynProgress(SynState.FinishedSucessfully, "Synchronisation finished"));
            
        }

        protected escapeRegExp(str:string):string {
            if (str)
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            else
                return str;
          }

        
        protected searchSongMatching<T extends Song>(toSearch:Song, collection:Loki.Collection) : T {

            let result:T = this.searchSongExactMatching(toSearch, collection);
            if (result) { return result;}

            result = this.searchSongTitleAlbumAndTimeMatching(toSearch, collection);
            if (result) { return result;}

            result = this.searchSongTitleArtistAndTimeMatching(toSearch, collection);
            if (result) { return result;}

            result = this.searchSongArtistAlbumAndTimeMatching(toSearch, collection);
            if (result) { return result;}

            result = this.searchTitleAndDurationAndNoAlbumOrArtistMatching(toSearch, collection);
            if (result) { return result;}
                                        
            return result;
        } 
        
        /**
         * Helper method (for testing purpose)
         */
        protected searchSongMatchingText<T extends Song & LokiObj>(title:string, artist:string, album:string, duration:number, rating:number, collection:Loki.Collection) : T {

            let aSong:Song = new Song("1", title, artist, album, duration, rating);                                        
            return this.searchSongMatching(aSong, collection);
        }


        /**
         * First match test
         * @param toSearch 
         * @param collection 
         */
        protected searchSongExactMatching<T extends Song>(toSearch:Song, collection:Loki.Collection) : T {

            let result:T = collection.findOne( 
                { '$and': [{'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] }},
                                             { 'artist' : { '$regex': [this.escapeRegExp(toSearch.artist), 'i'] } },
                                             { 'album' : { '$regex': [this.escapeRegExp(toSearch.album), 'i'] } }
                                            ]} );
                                        
            return result;
        }

        /**
         * Second match test
         * @param toSearch 
         * @param collection 
         */
        protected searchSongTitleAlbumAndTimeMatching<T extends Song>(toSearch:Song, collection:Loki.Collection) : T {
           
            let result:T = collection.findOne( 
                { '$and': [{'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] }},
                                             { 'durationSeconds' : { '$eq' : toSearch.durationSeconds } },
                                             { 'album' : { '$regex': [this.escapeRegExp(toSearch.album), 'i'] } }
                                            ]});
                                        
            return result;
        }

        /**
         * Third match test
         * @param toSearch 
         * @param collection 
         */
        protected searchSongTitleArtistAndTimeMatching<T extends Song>(toSearch:Song, collection:Loki.Collection) : T {

           
            let result:T = collection.findOne( 
                { '$and': [{'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] }},
                                             { 'artist' : { '$regex': [this.escapeRegExp(toSearch.artist), 'i'] } },
                                             { 'durationSeconds' : { '$eq' : toSearch.durationSeconds } },
                                            ]});
                                        
            return result;
        }

        /**
         * Fourth match test
         * @param toSearch 
         * @param collection 
         */
        protected searchSongArtistAlbumAndTimeMatching<T extends Song>(toSearch:Song, collection:Loki.Collection) : T {
           
            let result:T = collection.findOne( 
                { '$and': [{'durationSeconds' : { '$eq' : toSearch.durationSeconds } },
                                             { 'artist' : { '$regex': [this.escapeRegExp(toSearch.artist), 'i'] } },
                                             { 'album' : { '$regex': [this.escapeRegExp(toSearch.album), 'i'] } }
                                            ]});
                                        
            return result;
        }
        
        /**
         * Fifth match test
         * @param toSearch 
         * @param collection 
         */
        protected searchTitleAndDurationAndNoAlbumOrArtistMatching<T extends Song>(toSearch:Song, collection:Loki.Collection) : T {
           
            let result:T = collection.findOne( 
                { '$and': [{'durationSeconds' : { '$eq' : toSearch.durationSeconds } },
                                             {'title': { '$regex': [this.escapeRegExp(toSearch.title), 'i'] }},
                                             { 'artist' : { '$regex': ["", 'i'] } },
                                             { 'album' : { '$regex': ["", 'i'] } }
                                            ]});
                                        
            return result;
        }
}

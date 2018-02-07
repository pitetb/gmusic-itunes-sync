import { Song, GSong } from "./Song";

export class SynFinalReport {        

        public startDateTime: Date;

        public endDateTime: Date;

        public songsThumbToAdd: Array<GSong>;

        public songsThumbToRemove: Array<GSong>;

        public songsNotFounded: Array<Song>;

        public constructor( ) {
                this.songsThumbToAdd = new Array();
                this.songsNotFounded = new Array();
                this.songsThumbToRemove = new Array();
        }

        public toString():string {
                
                let ret:string = "";

                ret += "Songs to thumb up : " + this.songsThumbToAdd.length + "\n";  
                for (const oneSong of this.songsThumbToAdd) {
                        ret += oneSong.id + " - " + oneSong.title + " - " + oneSong.album + " - " + oneSong.artist + " - " + oneSong.durationSeconds + "\n";
                }
                ret += "\n";  

                ret += "Songs to thumb removed : " + this.songsThumbToRemove.length + "\n";   
                for (const oneSong of this.songsThumbToRemove) {
                        ret += oneSong.id + " - " + oneSong.title + " - " + oneSong.album + " - " + oneSong.artist + " - " + oneSong.durationSeconds + "\n";
                }
                ret += "\n"; 

                ret += "Songs not found on GMusic (no match) : " + this.songsNotFounded.length + "\n";  
                for (const oneSong of this.songsNotFounded) {
                        ret += oneSong.id + " - " + oneSong.title + " - " + oneSong.album + " - " + oneSong.artist + " - " + oneSong.durationSeconds + "\n";
                }
                ret += "\n"; 

                return ret;
        }
}

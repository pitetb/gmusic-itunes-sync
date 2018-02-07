import * as it from '@johnpaulvaughan/itunes-music-library-path';


export class UserSettings {
        public gLogin: string;
        public gPasswd: string;
        public itLibraryPath: string;
        public lastSyncDateTime: Date;

        public constructor() {
            this.gLogin = "";
            this.gPasswd = "";
        }

        public async autodetectITLibPath() {
            this.itLibraryPath = await it.getItunesPath();    
        }
        
}


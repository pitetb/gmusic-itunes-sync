import { Song, GSong } from "./Song";
export declare class SynFinalReport {
    startDateTime: Date;
    endDateTime: Date;
    songsThumbToAdd: Array<GSong>;
    songsThumbToRemove: Array<GSong>;
    songsNotFounded: Array<Song>;
    constructor();
    toString(): string;
}

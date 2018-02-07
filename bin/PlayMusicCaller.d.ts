import { UserSettings } from "./UserSettings";
import { GSong } from "./Song";
import { SimpleEventDispatcher } from "strongly-typed-events";
import { LongTaskProgress } from "./SynProgress";
export declare class PlayMusicCaller {
    private pm;
    allSongs: Array<GSong>;
    thumbsUpSongs: Array<GSong>;
    thumbsDownSongs: Array<GSong>;
    protected _onSyncMessage: SimpleEventDispatcher<string>;
    protected _onLongTaskProgress: SimpleEventDispatcher<LongTaskProgress>;
    constructor(syncMessageDispatcher: SimpleEventDispatcher<string>, longTaskDispatcher: SimpleEventDispatcher<LongTaskProgress>);
    loadAllGMusicSongs(userSettings: UserSettings): Promise<void>;
    protected connectToGoogleMusic(userSettings: UserSettings): Promise<{}>;
    protected loadMusicLib(): Promise<void>;
    protected getGMTracks(options: any): Promise<TracksRep>;
    updateSongRating(song: GSong): Promise<{}>;
}
export declare class TracksRep {
    data: Array<GSong>;
    nextPageToken: string;
    constructor();
}

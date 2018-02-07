/// <reference types="lokijs" />
import { SynFinalReport } from "./SynFinalReport";
import { UserSettings } from "./UserSettings";
import { Song } from "./Song";
import * as events from 'strongly-typed-events';
import { PlayMusicCaller } from "./PlayMusicCaller";
import { ISimpleEvent } from "strongly-typed-events";
import { SynProgress, LongTaskProgress } from "./SynProgress";
import * as Loki from 'lokijs';
export declare class SynManager {
    protected _onSyncProgress: events.SimpleEventDispatcher<SynProgress>;
    protected _onSyncMessage: events.SimpleEventDispatcher<string>;
    protected _onLongTaskProgress: events.SimpleEventDispatcher<LongTaskProgress>;
    protected _onSyncTerminated: events.SimpleEventDispatcher<SynFinalReport>;
    readonly onSyncProgress: ISimpleEvent<SynProgress>;
    readonly onSyncMessage: ISimpleEvent<string>;
    readonly onLongTaskProgress: ISimpleEvent<LongTaskProgress>;
    readonly onSyncTerminated: ISimpleEvent<SynFinalReport>;
    userSettings: UserSettings;
    synReport: SynFinalReport;
    protected playMusic: PlayMusicCaller;
    constructor(userSettings: UserSettings);
    prepareSynchronisation(): Promise<void>;
    applySynchronisation(): Promise<void>;
    protected escapeRegExp(str: string): string;
    protected searchSongMatching<T extends Song>(toSearch: Song, collection: Loki.Collection): T;
    /**
     * Helper method
     */
    protected searchSongMatchingText<T extends Song & LokiObj>(title: string, artist: string, album: string, duration: number, rating: number, collection: Loki.Collection): T;
    /**
     * First match test
     * @param toSearch
     * @param collection
     */
    protected searchSongExactMatching<T extends Song>(toSearch: Song, collection: Loki.Collection): T;
    /**
     * Second match test
     * @param toSearch
     * @param collection
     */
    protected searchSongTitleAlbumAndTimeMatching<T extends Song>(toSearch: Song, collection: Loki.Collection): T;
    /**
     * Third match test
     * @param toSearch
     * @param collection
     */
    protected searchSongTitleArtistAndTimeMatching<T extends Song>(toSearch: Song, collection: Loki.Collection): T;
    /**
     * Fourth match test
     * @param toSearch
     * @param collection
     */
    protected searchSongArtistAlbumAndTimeMatching<T extends Song>(toSearch: Song, collection: Loki.Collection): T;
    /**
     * Fifth match test
     * @param toSearch
     * @param collection
     */
    protected searchTitleAndDurationAndNoAlbumOrArtistMatching<T extends Song>(toSearch: Song, collection: Loki.Collection): T;
}

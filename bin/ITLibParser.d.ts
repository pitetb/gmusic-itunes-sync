import { ITSong } from "./Song";
import { SimpleEventDispatcher } from "strongly-typed-events";
import { LongTaskProgress } from "./SynProgress";
export declare class ITLibParser {
    private itunesXmlLibraryPath;
    protected _onSyncMessage: SimpleEventDispatcher<string>;
    protected _onLongTaskProgress: SimpleEventDispatcher<LongTaskProgress>;
    constructor(itunesXmlLibraryPath: string, syncMessageDispatcher: SimpleEventDispatcher<string>, longTaskDispatcher: SimpleEventDispatcher<LongTaskProgress>);
    /**
     * Read itunes file fully async and return the list of rated song
     * @param itunesXmlFilePath Path to the itunes library file
     */
    readItunesFileAndGetRatedITSongsAsync(itunesXmlFilePath: string): Promise<Map<string, ITSong>>;
    /**
     * Read itunes file fully async
     * @param itunesXmlFilePath
     */
    protected readItunesFileAsync(itunesXmlFilePath: string): Promise<string>;
    /**
     * Return an associative array with id as key and Song object as associated object
     */
    protected getRatedITSongs(itunesXMLLibrary: string): Map<string, ITSong>;
    protected parseItunesTrack(xmlBlock: any): any;
    /**
     * Creates a simple object with a key/value pair from the current XML line.
     *
     * @param  String
     * @return Object
     */
    protected buildiTunesSongProperty(line: any): {};
    protected isMusicTrack(kind: string): boolean;
}

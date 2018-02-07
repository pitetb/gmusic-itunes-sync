export declare class Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    durationSeconds: number;
    protected rating: number;
    constructor(id: string, title: string, artist: string, album: string, durationSeconds: number, rating: number);
    toString(): string;
}
export declare class ITSong extends Song {
    numberOfStars: number;
    constructor(id: string, title: string, artist: string, album: string, durationSeconds: number, rating: number);
}
export declare class GSong extends Song {
    constructor(id: string, title: string, artist: string, album: string, durationSeconds: number, rating: number);
    GTrackThumbs: GTrackThumbs;
}
export declare enum GTrackThumbs {
    Up = 5,
    Neutral = 0,
    Down = 1,
}

export class Song {
        
    public id: string;
    public title: string;
    public artist: string;
    public album: string;
    public durationSeconds:number;
    protected rating: number;
        
    public constructor(id: string, title: string, artist: string, album: string, durationSeconds:number, rating: number) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.rating = rating;            
        this.durationSeconds = durationSeconds;
    }


    public toString():string {                
        return this.id + " - " + this.title + " - " + this.album + " - " + this.artist + " - " + this.durationSeconds + " - " + this.rating;
    }

}    

export class ITSong extends Song {
        
    public numberOfStars: number;
        
    public constructor(id: string, title: string, artist: string, album: string, durationSeconds:number, rating: number) {
        super (id, title, artist, album, durationSeconds, rating);
        // On itunes, when a track has one star, the rating value is 20
        // 2 stars is 40, 3 stars is 60 etc..
        this.numberOfStars = this.rating / 20;
    }
    
}   


export class GSong extends Song {        
    
    public constructor(id: string, title: string, artist: string, album: string, durationSeconds:number, rating: number) {
        super (id, title, artist, album, durationSeconds, rating);        
    }

    // On Google music, rating number is as follow:
    // 5 = thumb up, 1 = thumb down, 0 = no thumb (2, 3 seems to do nothing)

    get GTrackThumbs(): GTrackThumbs {
        if (this.rating == 5) {
            return GTrackThumbs.Up;
        } else if (this.rating == 1) {
            return GTrackThumbs.Down;
        } else {
            return GTrackThumbs.Neutral;
        }
    }

    set GTrackThumbs(newThumb: GTrackThumbs) {
        if (newThumb == GTrackThumbs.Up) {
            this.rating = 5;
        } else if (newThumb == GTrackThumbs.Down) {
            this.rating = 1;
        } else {
            this.rating = 0;
        }
    }
    
}   


export enum GTrackThumbs {
    Up = 5,
    Neutral = 0,
    Down = 1,
}

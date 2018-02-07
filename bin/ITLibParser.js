"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Song_1 = require("./Song");
const fs = require("fs");
const xpath = require("xpath");
const dom = require("xmldom");
const SynProgress_1 = require("./SynProgress");
class ITLibParser {
    constructor(itunesXmlLibraryPath, syncMessageDispatcher, longTaskDispatcher) {
        this.itunesXmlLibraryPath = itunesXmlLibraryPath;
        this._onSyncMessage = syncMessageDispatcher;
        this._onLongTaskProgress = longTaskDispatcher;
    }
    /**
     * Read itunes file fully async and return the list of rated song
     * @param itunesXmlFilePath Path to the itunes library file
     */
    readItunesFileAndGetRatedITSongsAsync(itunesXmlFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this._onSyncMessage.dispatch("Opening itunes xml file...");
            let itunesXMLLibrary = yield this.readItunesFileAsync(itunesXmlFilePath);
            this._onSyncMessage.dispatch("File readed");
            this._onSyncMessage.dispatch("Start parsing");
            return new Promise((resolve, reject) => {
                let res = this.getRatedITSongs(itunesXMLLibrary);
                resolve(res);
            });
        });
    }
    /**
     * Read itunes file fully async
     * @param itunesXmlFilePath
     */
    readItunesFileAsync(itunesXmlFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(itunesXmlFilePath, 'utf8', (err, data) => {
                    if (err)
                        throw err;
                    resolve(data);
                });
            });
        });
    }
    /**
     * Return an associative array with id as key and Song object as associated object
     */
    getRatedITSongs(itunesXMLLibrary) {
        // Returned dictionnary
        var itunesRatedSongs = new Map();
        var doc = new dom.DOMParser().parseFromString(itunesXMLLibrary);
        this._onSyncMessage.dispatch("Parsing...");
        //var total = xpath.select("count(/plist/dict[key='Tracks']/dict/dict[key='Rating'])", doc);
        //console.log(total);
        var result = xpath.evaluate("/plist/dict[key='Tracks']/dict/dict[key='Rating']", // XPath query to select all song with some rating
        doc, // contextNode
        null, // namespaceResolver
        0, // resultType = 0 all
        null // result
        );
        // Counting number of items
        let nodes = [];
        var node = result.iterateNext();
        while (node) {
            nodes.push(node);
            var node = result.iterateNext();
        }
        this._onSyncMessage.dispatch("Retrieving tracks...");
        for (let index = 0; index < nodes.length; index++) {
            const track = this.parseItunesTrack(nodes[index].toString());
            this._onLongTaskProgress.dispatch(new SynProgress_1.LongTaskProgress(index + 1, nodes.length, "Track treated"));
            // Testing if it's a music track
            if (!this.isMusicTrack(track.Kind)) {
                node = result.iterateNext();
                continue;
            }
            // Check that the rating is not computed rating from other track in album
            if (track.RatingComputed) {
                node = result.iterateNext();
                continue;
            }
            // Create itunes song list
            // Rounds the track time to lower second
            let oneSong = new Song_1.ITSong(track.TrackID, track.Name, track.Artist, track.Album, Math.round(track.TotalTime / 1000), track.Rating);
            itunesRatedSongs.set(oneSong.id, oneSong);
        }
        this._onSyncMessage.dispatch("Tracks retrieved. " + itunesRatedSongs.size + " rated tracks founded");
        return itunesRatedSongs;
        /* XPATH WAY OLD PATH LOWEST PERFORMANCE
        let oneTrack = new dom.DOMParser().parseFromString(node.toString());
        let id = xpath.select("/dict/key[text()='Track ID']/following-sibling::*[1]/text()", oneTrack, true);
        let artist = xpath.select("/dict/key[text()='Artist']/following-sibling::*[1]/text()", oneTrack, true);
        let album = xpath.select("/dict/key[text()='Album']/following-sibling::*[1]/text()", oneTrack, true);
        let name = xpath.select("/dict/key[text()='Name']/following-sibling::*[1]/text()", oneTrack, true);
        let rating = xpath.select("/dict/key[text()='Rating']/following-sibling::*[1]/text()", oneTrack, true);
        let ratingComputedNode = xpath.select("/dict/key[text()='Rating Computed']/following-sibling::*[1]", oneTrack, true);
        let kind:string = <string> xpath.select("/dict/key[text()='Kind']/following-sibling::*[1]/text()", oneTrack, true);
        
        // Testing if it's a music track
        if (! this.isMusicTrack(kind)) {
            node = result.iterateNext();
            continue;
        }
        
        // Check that the rating is not computed rating from other track in album
        let isRatingComputed = false;
        if (ratingComputedNode) {
            let item: Node = <Node> ratingComputedNode;
            isRatingComputed = (item.localName == "true") ? true : false;
        }
        
        if (isRatingComputed) {
            node = result.iterateNext();
            continue;
        }

        //console.log(id + ";" + name + ";" + artist + ";" + album + ";" + rating);
        i++;
        
        //console.log("Node: " + node.toString());
        //node = result.iterateNext();
        END XPATH WAY */
    }
    parseItunesTrack(xmlBlock) {
        var char = '\n';
        let i, j = 0;
        var trackObj;
        while ((j = xmlBlock.indexOf(char, i)) !== -1) {
            var line = xmlBlock.substring(i, j);
            if (line.indexOf("<dict>") > -1) {
                // starting a track object
                trackObj = {};
            }
            else if (line.indexOf("<key>") > -1) {
                // parse track object
                Object.assign(trackObj, this.buildiTunesSongProperty(line));
            }
            i = j + 1;
        }
        return trackObj;
    }
    /**
     * Creates a simple object with a key/value pair from the current XML line.
     *
     * @param  String
     * @return Object
     */
    buildiTunesSongProperty(line) {
        var key = String(line).match("<key>(.*)</key>");
        var value = String(line).match("<integer>(.*)</integer>");
        var valueBool;
        if (!value)
            value = String(line).match("<date>(.*)</date>");
        if (!value)
            value = String(line).match("<string>(.*)</string>");
        if (!value) {
            value = String(line).match("<true/>");
            if (value != null && value.length > 0) {
                valueBool = true;
            }
            else {
                value = String(line).match("<false/>");
                if (value != null && value.length > 0) {
                    valueBool = false;
                }
            }
        }
        let k = '';
        if (key != null && key.length > 1)
            k = key[1].replace(/\s+/g, ''); // On keys replace space by ''
        let v = '';
        if (value != null && value.length > 1)
            v = value[1].replace("&amp;", "&").replace("\"", '"');
        if (valueBool)
            v = valueBool;
        let o = {};
        o[k] = v;
        return o;
    }
    isMusicTrack(kind) {
        if (kind == 'MPEG audio file' ||
            kind == 'Fichier audio MPEG' ||
            kind == 'AAC audio file' ||
            kind == 'Fichier audio AAC' ||
            kind == 'Matched AAC audio file' ||
            kind == 'Fichier audio AAC mis en correspondance' ||
            kind == 'Protected AAC audio file' ||
            kind == 'Fichier audio AAC protégé' ||
            kind == 'Purchased AAC audio file' ||
            kind == 'Fichier audio AAC acheté') {
            return true;
        }
        return false;
    }
}
exports.ITLibParser = ITLibParser;
//# sourceMappingURL=ITLibParser.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SynFinalReport {
    constructor() {
        this.songsThumbToAdd = new Array();
        this.songsNotFounded = new Array();
        this.songsThumbToRemove = new Array();
    }
    toString() {
        let ret = "";
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
exports.SynFinalReport = SynFinalReport;
//# sourceMappingURL=SynFinalReport.js.map
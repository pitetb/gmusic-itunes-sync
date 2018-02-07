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
const SynManager_1 = require("./SynManager");
class Main {
    static main(userSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (userSettings === null)
                throw new Error("No user settings provided (null)");
            try {
                // Complete user settings       
                userSettings.lastSyncDateTime = new Date();
                // Detect itunes library folder path
                if (!userSettings.itLibraryPath) {
                    console.log("Try autodetecting iTunes XML Library file path");
                    yield userSettings.autodetectITLibPath();
                }
                console.log("Using iTunes XML File : " + userSettings.itLibraryPath);
                // Parse Make synch
                let synManager = new SynManager_1.SynManager(userSettings);
                // Subscribe to events to report on console
                synManager.onSyncProgress.subscribe(Main.printSynProgress);
                synManager.onLongTaskProgress.subscribe(Main.printLongTaskProgress);
                synManager.onSyncMessage.subscribe(Main.printSynMessage);
                yield synManager.prepareSynchronisation();
                synManager.applySynchronisation();
            }
            catch (error) {
                console.log(`An error occurs in the process :( \n' - ${error}`);
                return;
            }
        });
    }
    static printSynProgress(synProgress) {
        console.log(synProgress.toString());
    }
    static printSynMessage(synProgress) {
        console.log(synProgress);
    }
    static printLongTaskProgress(longTaskProgress) {
        console.log(longTaskProgress.toString());
    }
}
exports.Main = Main;
//# sourceMappingURL=Main.js.map
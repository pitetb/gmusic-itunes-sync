import { UserSettings } from "./UserSettings";
import { SynManager } from "./SynManager";
import { SynProgress, LongTaskProgress } from "./SynProgress";

export class Main {

    public static async main(userSettings:UserSettings) {        
        
        if (userSettings === null)
            throw new Error("No user settings provided (null)");
        
        try
        {
            // Complete user settings       
            userSettings.lastSyncDateTime = new Date();

            // Detect itunes library folder path
            if (userSettings.itLibraryPath) {
                console.log("Try autodetecting iTunes XML Library file path");
                await userSettings.autodetectITLibPath();
            }        
            console.log("Using iTunes XML File : " + userSettings.itLibraryPath);

            // Parse Make synch
            let synManager:SynManager = new SynManager(userSettings);

            // Subscribe to events to report on console
            synManager.onSyncProgress.subscribe(Main.printSynProgress);
            synManager.onLongTaskProgress.subscribe(Main.printLongTaskProgress);
            synManager.onSyncMessage.subscribe(Main.printSynMessage);

            await synManager.prepareSynchronisation();

            synManager.applySynchronisation();
            
        } catch(error) {
            console.log(`An error occurs in the process :( \n' - ${error}`);
            return;
        }
    }

    
    protected static printSynProgress(synProgress:SynProgress) {
        console.log(synProgress.toString());
    }

    protected static printSynMessage(synProgress:string) {
        console.log(synProgress);
    }

    protected static printLongTaskProgress(longTaskProgress:LongTaskProgress) {
        console.log(longTaskProgress.toString());
    }
}

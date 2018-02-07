export declare class UserSettings {
    gLogin: string;
    gPasswd: string;
    itLibraryPath: string;
    lastSyncDateTime: Date;
    constructor();
    autodetectITLibPath(): Promise<void>;
}

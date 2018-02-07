import { UserSettings } from "./UserSettings";
import { SynProgress, LongTaskProgress } from "./SynProgress";
export declare class Main {
    static main(userSettings: UserSettings): Promise<void>;
    protected static printSynProgress(synProgress: SynProgress): void;
    protected static printSynMessage(synProgress: string): void;
    protected static printLongTaskProgress(longTaskProgress: LongTaskProgress): void;
}

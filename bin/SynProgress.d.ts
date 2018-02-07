export declare enum SynState {
    NotStarted = 1,
    ComparaisonInProgress = 2,
    ReadyToSyn = 3,
    SynInProgress = 4,
    FinishedSucessfully = 5,
    FinishedWithErrors = 6,
}
export declare class SynProgress {
    synState: SynState;
    currentStepMessage: string;
    constructor(synState: SynState, currentStepMessage: string);
    toString(): string;
}
export declare class LongTaskProgress {
    totalStep: number;
    currentStep: number;
    currentStepMessage: string;
    constructor(currentStep: number, totalStep: number, currentStepMessage: string);
    toString(): string;
}

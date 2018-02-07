
export enum SynState {
        NotStarted = 1,
        ComparaisonInProgress,
        ReadyToSyn,
        SynInProgress,
        FinishedSucessfully,
        FinishedWithErrors,
}


export class SynProgress {
        
        
        public synState: SynState;

        public currentStepMessage: string;
        
        public constructor(synState: SynState, currentStepMessage:string ) {
                this.synState = synState;
                this.currentStepMessage = currentStepMessage;
        }

        public toString():string {                
                return SynState[this.synState] + " - " + this.currentStepMessage;
        }
}

export class LongTaskProgress {
        
        public totalStep: number;
        
        public currentStep: number;

        public currentStepMessage: string;
        
        public constructor(currentStep:number, totalStep:number, currentStepMessage:string ) {
                this.totalStep = totalStep;
                this.currentStep = currentStep;
                this.currentStepMessage = currentStepMessage;
        }

        public toString():string {
                return this.currentStep + "/" + this.totalStep + " - " + this.currentStepMessage;
        }
}
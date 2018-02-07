"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SynState;
(function (SynState) {
    SynState[SynState["NotStarted"] = 1] = "NotStarted";
    SynState[SynState["ComparaisonInProgress"] = 2] = "ComparaisonInProgress";
    SynState[SynState["ReadyToSyn"] = 3] = "ReadyToSyn";
    SynState[SynState["SynInProgress"] = 4] = "SynInProgress";
    SynState[SynState["FinishedSucessfully"] = 5] = "FinishedSucessfully";
    SynState[SynState["FinishedWithErrors"] = 6] = "FinishedWithErrors";
})(SynState = exports.SynState || (exports.SynState = {}));
class SynProgress {
    constructor(synState, currentStepMessage) {
        this.synState = synState;
        this.currentStepMessage = currentStepMessage;
    }
    toString() {
        return SynState[this.synState] + " - " + this.currentStepMessage;
    }
}
exports.SynProgress = SynProgress;
class LongTaskProgress {
    constructor(currentStep, totalStep, currentStepMessage) {
        this.totalStep = totalStep;
        this.currentStep = currentStep;
        this.currentStepMessage = currentStepMessage;
    }
    toString() {
        return this.currentStep + "/" + this.totalStep + " - " + this.currentStepMessage;
    }
}
exports.LongTaskProgress = LongTaskProgress;
//# sourceMappingURL=SynProgress.js.map
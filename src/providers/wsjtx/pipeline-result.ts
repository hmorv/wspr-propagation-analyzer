import type { WsprCycle } from "../../core/models/wspr-cycle.js";
import type { CycleBuilderIssue } from "../../core/analysis/cycle-builder-result.js";
import type { ParseIssue } from "../common/parse-result.js";

export interface WsjtxPipelineResult {
  cycles: WsprCycle[];
  parseIssues: ParseIssue[];
  cycleIssues: CycleBuilderIssue[];

  statistics: {
    totalLines: number;
    blankLines: number;
    ignoredRecords: number;
    parsedRecords: number;
    transmissions: number;
    receptionSpots: number;
    txCycles: number;
    rxCycles: number;
  };
}
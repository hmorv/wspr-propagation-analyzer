import type { WsprCycle } from "../models/wspr-cycle.js";

export interface CycleBuilderIssue {
  timestamp?: Date;
  message: string;
}

export interface CycleBuilderResult {
  cycles: WsprCycle[];
  issues: CycleBuilderIssue[];
}
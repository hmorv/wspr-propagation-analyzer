import type { DigitalSpot } from "../models/digital-spot.js";
import type { DigitalTransmission } from "../models/digital-transmission.js";
import type { CycleBuilderOptions } from "./cycle-builder-options.js";
import type { CycleBuilderResult } from "./cycle-builder-result.js";

export interface CycleBuilderInput {
  transmissions: DigitalTransmission[];
  spots: DigitalSpot[];
}

export interface CycleBuilder {
  build(
    input: CycleBuilderInput,
    options: CycleBuilderOptions
  ): CycleBuilderResult;
}
import { DefaultCycleBuilder } from "../../core/analysis/default-cycle-builder.js";
import { DefaultWsjtxMapper } from "./mapper.js";
import { DefaultWsjtxParser } from "./default-wsjtx-parser.js";

import type { WsjtxPipeline } from "./pipeline.js";
import type { WsjtxPipelineOptions } from "./pipeline-options.js";
import type { WsjtxPipelineResult } from "./pipeline-result.js";

export class DefaultWsjtxPipeline implements WsjtxPipeline {
  constructor(
    private readonly parser = new DefaultWsjtxParser(),
    private readonly mapper = new DefaultWsjtxMapper(),
    private readonly cycleBuilder = new DefaultCycleBuilder()
  ) {}

  process(
    text: string,
    options: WsjtxPipelineOptions
  ): WsjtxPipelineResult {
    this.validateOptions(options);

    const parseResult = this.parser.parse(text);

    const mappingResult = this.mapper.map(
      parseResult.records,
      options.stationCallsign,
      options.stationLocator
    );

    const cycleResult = this.cycleBuilder.build(
      {
        transmissions: mappingResult.transmissions,
        spots: mappingResult.spots
      },
      {
        stationCallsign: options.stationCallsign,
        ...(options.stationLocator
          ? { stationLocator: options.stationLocator }
          : {}),
        cycleDurationSeconds:
          options.cycleDurationSeconds ?? 120,
        timestampToleranceSeconds:
          options.timestampToleranceSeconds ?? 30,
        reportMissingTransmissionSpots: false
      }
    );

    const txCycles = cycleResult.cycles.filter(
      (cycle) => cycle.direction === "tx"
    ).length;

    const rxCycles = cycleResult.cycles.filter(
      (cycle) => cycle.direction === "rx"
    ).length;

    return {
      cycles: cycleResult.cycles,
      parseIssues: parseResult.issues,
      cycleIssues: cycleResult.issues,
      statistics: {
        totalLines: parseResult.totalLines,
        blankLines: parseResult.blankLines,
        ignoredRecords: parseResult.ignoredRecords,
        parsedRecords: parseResult.records.length,
        transmissions: mappingResult.transmissions.length,
        receptionSpots: mappingResult.spots.length,
        txCycles,
        rxCycles
      }
    };
  }

  private validateOptions(
    options: WsjtxPipelineOptions
  ): void {
    if (!options.stationCallsign.trim()) {
      throw new Error(
        "stationCallsign must not be empty"
      );
    }
  }
}
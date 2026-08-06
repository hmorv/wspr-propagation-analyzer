import type { DigitalSpot } from "../models/digital-spot.js";
import type { DigitalTransmission } from "../models/digital-transmission.js";
import type {
  WsprCycle,
  WsprReceptionCycle,
  WsprTransmissionCycle
} from "../models/wspr-cycle.js";
import type {
  CycleBuilder,
  CycleBuilderInput
} from "./cycle-builder.js";
import type { CycleBuilderOptions } from "./cycle-builder-options.js";
import type {
  CycleBuilderIssue,
  CycleBuilderResult
} from "./cycle-builder-result.js";

export class DefaultCycleBuilder implements CycleBuilder {
  build(
    input: CycleBuilderInput,
    options: CycleBuilderOptions
  ): CycleBuilderResult {
    this.validateOptions(options);

    const issues: CycleBuilderIssue[] = [];
    const txCycles = this.buildTransmissionCycles(
      input.transmissions,
      input.spots,
      options,
      issues
    );

    const assignedTxSpots = new Set(
      txCycles.flatMap((cycle) => cycle.spots)
    );

    const remainingSpots = input.spots.filter(
      (spot) => !assignedTxSpots.has(spot)
    );

    const rxCycles = this.buildReceptionCycles(
      remainingSpots,
      options,
      issues
    );

    const cycles: WsprCycle[] = [
      ...txCycles,
      ...rxCycles
    ].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    return {
      cycles,
      issues
    };
  }

  private buildTransmissionCycles(
    transmissions: DigitalTransmission[],
    spots: DigitalSpot[],
    options: CycleBuilderOptions,
    issues: CycleBuilderIssue[]
  ): WsprTransmissionCycle[] {
    return transmissions
      .slice()
      .sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      )
      .map((transmission) => {
        const matchingSpots = spots.filter((spot) =>
          this.belongsToTransmission(
            spot,
            transmission,
            options.timestampToleranceSeconds
          )
        );

        if (matchingSpots.length === 0) {
          issues.push({
            timestamp: transmission.timestamp,
            message:
              `No reports found for transmission by ` +
              `${transmission.transmitterCallsign}`
          });
        }

        return this.createTransmissionCycle(
          transmission,
          matchingSpots
        );
      });
  }

  private buildReceptionCycles(
    spots: DigitalSpot[],
    options: CycleBuilderOptions,
    issues: CycleBuilderIssue[]
  ): WsprReceptionCycle[] {
    const localReceptionSpots = spots.filter((spot) => {
      const isLocalReception =
        this.normalizeCallsign(spot.receiverCallsign) ===
        this.normalizeCallsign(options.stationCallsign);

      if (!isLocalReception) {
        issues.push({
          timestamp: spot.timestamp,
          message:
            `Spot could not be assigned to a local RX cycle: ` +
            `${spot.transmitterCallsign}`
        });
      }

      return isLocalReception;
    });

    const grouped = new Map<number, DigitalSpot[]>();

    for (const spot of localReceptionSpots) {
      const cycleTimestamp = this.getCycleTimestamp(
        spot.timestamp,
        options.cycleDurationSeconds
      );

      const existing = grouped.get(cycleTimestamp) ?? [];
      existing.push(spot);
      grouped.set(cycleTimestamp, existing);
    }

    return Array.from(grouped.entries()).map(
      ([timestampMs, cycleSpots]) => {
        const firstSpot = cycleSpots[0];

        if (!firstSpot) {
          throw new Error("Unexpected empty RX cycle");
        }

        return {
          timestamp: new Date(timestampMs),
          direction: "rx",
          mode: firstSpot.mode,
          receiverCallsign: options.stationCallsign,
          ...(options.stationLocator
            ? { receiverLocator: options.stationLocator }
            : {}),
          spots: cycleSpots.sort(
            (a, b) => a.frequencyMHz - b.frequencyMHz
          )
        };
      }
    );
  }

  private createTransmissionCycle(
    transmission: DigitalTransmission,
    spots: DigitalSpot[]
  ): WsprTransmissionCycle {
    return {
      timestamp: transmission.timestamp,
      direction: "tx",
      mode: transmission.mode,
      transmitterCallsign:
        transmission.transmitterCallsign,
      ...(transmission.transmitterLocator
        ? {
            transmitterLocator:
              transmission.transmitterLocator
          }
        : {}),
      dialFrequencyMHz: transmission.dialFrequencyMHz,
      ...(transmission.audioFrequencyHz !== undefined
        ? {
            audioFrequencyHz:
              transmission.audioFrequencyHz
          }
        : {}),
      ...(transmission.transmittedPower
        ? {
            transmittedPower:
              transmission.transmittedPower
          }
        : {}),
      spots: spots.sort(
        (a, b) =>
          (a.receiverCallsign ?? "").localeCompare(
            b.receiverCallsign ?? ""
          )
      )
    };
  }

  private belongsToTransmission(
    spot: DigitalSpot,
    transmission: DigitalTransmission,
    toleranceSeconds: number
  ): boolean {
    const sameCallsign =
      this.normalizeCallsign(spot.transmitterCallsign) ===
      this.normalizeCallsign(
        transmission.transmitterCallsign
      );

    const sameMode = spot.mode === transmission.mode;

    const differenceSeconds =
      Math.abs(
        spot.timestamp.getTime() -
          transmission.timestamp.getTime()
      ) / 1000;

    return (
      sameCallsign &&
      sameMode &&
      differenceSeconds <= toleranceSeconds
    );
  }

  private getCycleTimestamp(
    timestamp: Date,
    cycleDurationSeconds: number
  ): number {
    const cycleDurationMs = cycleDurationSeconds * 1000;

    return (
      Math.floor(timestamp.getTime() / cycleDurationMs) *
      cycleDurationMs
    );
  }

  private normalizeCallsign(
    callsign: string | undefined
  ): string {
    return callsign?.trim().toUpperCase() ?? "";
  }

  private validateOptions(
    options: CycleBuilderOptions
  ): void {
    if (!options.stationCallsign.trim()) {
      throw new Error(
        "stationCallsign must not be empty"
      );
    }

    if (
      !Number.isFinite(options.cycleDurationSeconds) ||
      options.cycleDurationSeconds <= 0
    ) {
      throw new Error(
        "cycleDurationSeconds must be greater than zero"
      );
    }

    if (
      !Number.isFinite(
        options.timestampToleranceSeconds
      ) ||
      options.timestampToleranceSeconds < 0
    ) {
      throw new Error(
        "timestampToleranceSeconds must not be negative"
      );
    }
  }
}
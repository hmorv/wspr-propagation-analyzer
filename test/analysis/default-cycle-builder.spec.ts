import { describe, expect, it } from "vitest";

import { DefaultCycleBuilder } from "../../src/core/analysis/default-cycle-builder.js";
import { DataSource } from "../../src/core/models/digital-spot.js";
import type { DigitalSpot } from "../../src/core/models/digital-spot.js";
import type { DigitalTransmission } from "../../src/core/models/digital-transmission.js";

describe("DefaultCycleBuilder", () => {
  it("groups WSPRnet reports into a transmission cycle", () => {
    const builder = new DefaultCycleBuilder();

    const transmissions: DigitalTransmission[] = [
      {
        timestamp: new Date("2026-08-06T18:20:00Z"),
        transmitterCallsign: "EA6AJT",
        transmitterLocator: "JM19hn",
        dialFrequencyMHz: 7.039,
        audioFrequencyHz: 1444,
        transmittedPower: {
          value: 30,
          unit: "dBm"
        },
        mode: "WSPR"
      }
    ];

    const spots: DigitalSpot[] = [
      {
        timestamp: new Date("2026-08-06T18:20:00Z"),
        transmitterCallsign: "EA6AJT",
        transmitterLocator: "JM19hn",
        receiverCallsign: "F5VBD",
        receiverLocator: "JN25xo",
        frequencyMHz: 7.04008,
        snrDb: -6,
        transmittedPower: {
          value: 1,
          unit: "W"
        },
        distanceKm: 725,
        azimuthDegrees: 21,
        driftHzPerMinute: 0,
        mode: "WSPR",
        source: DataSource.Wsprnet,
        rawLine: "sample WSPRnet line"
      },
      {
        timestamp: new Date("2026-08-06T18:20:00Z"),
        transmitterCallsign: "EA6AJT",
        transmitterLocator: "JM19hn",
        receiverCallsign: "OE3GBB",
        receiverLocator: "JN87aq",
        frequencyMHz: 7.040042,
        snrDb: -4,
        transmittedPower: {
          value: 1,
          unit: "W"
        },
        distanceKm: 1405,
        azimuthDegrees: 46,
        driftHzPerMinute: 0,
        mode: "WSPR",
        source: DataSource.Wsprnet,
        rawLine: "sample WSPRnet line"
      }
    ];

    const result = builder.build(
      { transmissions, spots },
      {
        stationCallsign: "EA6AJT",
        stationLocator: "JM19hn",
        cycleDurationSeconds: 120,
        timestampToleranceSeconds: 30
      }
    );

    expect(result.issues).toHaveLength(0);
    expect(result.cycles).toHaveLength(1);

    const cycle = result.cycles[0];

    expect(cycle?.direction).toBe("tx");

    if (!cycle || cycle.direction !== "tx") {
      throw new Error("Expected a TX cycle");
    }

    expect(cycle.transmitterCallsign).toBe("EA6AJT");
    expect(cycle.spots).toHaveLength(2);
    expect(cycle.spots.map((spot) => spot.receiverCallsign)).toEqual([
      "F5VBD",
      "OE3GBB"
    ]);
  });

  it("groups local receptions by WSPR cycle", () => {
    const builder = new DefaultCycleBuilder();

    const spots: DigitalSpot[] = [
      {
        timestamp: new Date("2026-08-06T18:22:00Z"),
        transmitterCallsign: "SQ9RHX",
        transmitterLocator: "JO81",
        receiverCallsign: "EA6AJT",
        receiverLocator: "JM19hn",
        frequencyMHz: 7.0399954,
        snrDb: -20,
        transmittedPower: {
          value: 23,
          unit: "dBm"
        },
        timeOffsetSeconds: 4.93,
        mode: "WSPR",
        source: DataSource.Wsjtx,
        rawLine: "sample WSJT-X line"
      },
      {
        timestamp: new Date("2026-08-06T18:22:00Z"),
        transmitterCallsign: "9A3ZI",
        transmitterLocator: "JN86",
        receiverCallsign: "EA6AJT",
        receiverLocator: "JM19hn",
        frequencyMHz: 7.0400719,
        snrDb: -7,
        transmittedPower: {
          value: 3,
          unit: "dBm"
        },
        timeOffsetSeconds: 0.02,
        mode: "WSPR",
        source: DataSource.Wsjtx,
        rawLine: "sample WSJT-X line"
      }
    ];

    const result = builder.build(
      {
        transmissions: [],
        spots
      },
      {
        stationCallsign: "EA6AJT",
        stationLocator: "JM19hn",
        cycleDurationSeconds: 120,
        timestampToleranceSeconds: 30
      }
    );

    expect(result.issues).toHaveLength(0);
    expect(result.cycles).toHaveLength(1);

    const cycle = result.cycles[0];

    expect(cycle?.direction).toBe("rx");

    if (!cycle || cycle.direction !== "rx") {
      throw new Error("Expected an RX cycle");
    }

    expect(cycle.receiverCallsign).toBe("EA6AJT");
    expect(cycle.spots).toHaveLength(2);
    expect(cycle.spots.map((spot) => spot.transmitterCallsign)).toEqual([
      "SQ9RHX",
      "9A3ZI"
    ]);
  });
}); 
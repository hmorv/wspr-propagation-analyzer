import { describe, expect, it } from "vitest";

import {
  DataSource
} from "../../../src/core/models/digital-spot.js";

import {
  DefaultWsjtxMapper
} from "../../../src/providers/wsjtx/mapper.js";

import type {
  WsjtxRecord
} from "../../../src/providers/wsjtx/wsjtx-record.js";

describe("DefaultWsjtxMapper", () => {
  const mapper = new DefaultWsjtxMapper();

  it("maps transmission records to DigitalTransmission", () => {
    const records: WsjtxRecord[] = [
      {
        type: "transmission",
        timestamp: new Date("2026-08-06T18:24:00Z"),
        dialFrequencyMHz: 7.039,
        mode: "WSPR",
        audioFrequencyHz: 1444,
        transmitterCallsign: "EA6AJT",
        transmitterLocator: "JM19",
        powerDbm: 30,
        additionalFields: [0, 0],
        rawLine:
          "260806_182400 7.039 Tx WSPR 0 0.0 1444 EA6AJT JM19 30"
      }
    ];

    const result = mapper.map(records, "EA6AJT", "JM19hn");

    expect(result.spots).toHaveLength(0);
    expect(result.transmissions).toHaveLength(1);

    expect(result.transmissions[0]).toEqual({
      timestamp: new Date("2026-08-06T18:24:00Z"),
      transmitterCallsign: "EA6AJT",
      transmitterLocator: "JM19",
      dialFrequencyMHz: 7.039,
      audioFrequencyHz: 1444,
      transmittedPower: {
        value: 30,
        unit: "dBm"
      },
      mode: "WSPR"
    });
  });

  it("maps reception records to DigitalSpot", () => {
    const rawLine =
      "260806 1822 -20 4.93 7.0399954 SQ9RHX JO81 23";

    const records: WsjtxRecord[] = [
      {
        type: "reception",
        timestamp: new Date("2026-08-06T18:22:00Z"),
        snrDb: -20,
        timeOffsetSeconds: 4.93,
        frequencyMHz: 7.0399954,
        transmitterCallsign: "SQ9RHX",
        transmitterLocator: "JO81",
        powerDbm: 23,
        decoderFields: [],
        rawLine
      }
    ];

    const result = mapper.map(records, "EA6AJT", "JM19hn");

    expect(result.transmissions).toHaveLength(0);
    expect(result.spots).toHaveLength(1);

    expect(result.spots[0]).toEqual({
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
      rawLine
    });
  });

  it("omits unknown optional locators", () => {
    const records: WsjtxRecord[] = [
      {
        type: "reception",
        timestamp: new Date("2026-08-06T17:54:00Z"),
        snrDb: -21,
        timeOffsetSeconds: -0.87,
        frequencyMHz: 7.0399986,
        transmitterCallsign: "F/PE0FKO",
        transmitterLocator: null,
        powerDbm: 10,
        decoderFields: [],
        rawLine: "sample"
      }
    ];

    const result = mapper.map(records, "EA6AJT");

    expect(result.spots[0]).not.toHaveProperty(
      "transmitterLocator"
    );
    expect(result.spots[0]).not.toHaveProperty(
      "receiverLocator"
    );
  });

  it("rejects an empty receiver callsign", () => {
    expect(() => mapper.map([], "   ")).toThrow(
      "receiverCallsign must not be empty"
    );
  });
});
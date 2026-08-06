import { describe, expect, it } from "vitest";

import { DefaultWsjtxParser } from "../../../src/providers/wsjtx/default-wsjtx-parser.js";

describe("DefaultWsjtxParser", () => {
  const parser = new DefaultWsjtxParser();

  it("parses a WSPR transmission record", () => {
    const text =
      "260806_182400     7.039 Tx WSPR     0  0.0 1444 EA6AJT JM19 30";

    const result = parser.parse(text);

    expect(result.issues).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const record = result.records[0];

    expect(record?.type).toBe("transmission");

    if (!record || record.type !== "transmission") {
      throw new Error("Expected a transmission record");
    }

    expect(record.timestamp.toISOString()).toBe(
      "2026-08-06T18:24:00.000Z"
    );
    expect(record.dialFrequencyMHz).toBe(7.039);
    expect(record.mode).toBe("WSPR");
    expect(record.audioFrequencyHz).toBe(1444);
    expect(record.transmitterCallsign).toBe("EA6AJT");
    expect(record.transmitterLocator).toBe("JM19");
    expect(record.powerDbm).toBe(30);
    expect(record.additionalFields).toEqual([0, 0]);
    expect(record.rawLine).toBe(text);
  });

  it("parses a reception record with locator", () => {
    const text =
      "260806 1754 -23 -0.15 7.0400030 OE7XZB JN57 23 0 0.17 1 1 0 0 23 1 157";

    const result = parser.parse(text);

    expect(result.issues).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const record = result.records[0];

    expect(record?.type).toBe("reception");

    if (!record || record.type !== "reception") {
      throw new Error("Expected a reception record");
    }

    expect(record.timestamp.toISOString()).toBe(
      "2026-08-06T17:54:00.000Z"
    );
    expect(record.snrDb).toBe(-23);
    expect(record.timeOffsetSeconds).toBe(-0.15);
    expect(record.frequencyMHz).toBe(7.040003);
    expect(record.transmitterCallsign).toBe("OE7XZB");
    expect(record.transmitterLocator).toBe("JN57");
    expect(record.powerDbm).toBe(23);
    expect(record.decoderFields).toEqual([
      0,
      0.17,
      1,
      1,
      0,
      0,
      23,
      1,
      157
    ]);
  });

  it("parses a reception record without locator", () => {
    const text =
      "260806 1754 -21 -0.87 7.0399986 F/PE0FKO 10 0 0.31 1 1 0 0 14 1 331";

    const result = parser.parse(text);

    expect(result.issues).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const record = result.records[0];

    expect(record?.type).toBe("reception");

    if (!record || record.type !== "reception") {
      throw new Error("Expected a reception record");
    }

    expect(record.transmitterCallsign).toBe("F/PE0FKO");
    expect(record.transmitterLocator).toBeNull();
    expect(record.powerDbm).toBe(10);
    expect(record.decoderFields).toEqual([
      0,
      0.31,
      1,
      1,
      0,
      0,
      14,
      1,
      331
    ]);
  });

  it("preserves a hashed callsign enclosed in angle brackets", () => {
    const text =
      "260806 1754 -23 -0.15 7.0401461 <OE9PTI> JN47VL 23 0 0.17 1 1 0 0 26 11 31";

    const result = parser.parse(text);

    expect(result.issues).toHaveLength(0);
    expect(result.records).toHaveLength(1);

    const record = result.records[0];

    expect(record?.type).toBe("reception");

    if (!record || record.type !== "reception") {
      throw new Error("Expected a reception record");
    }

    expect(record.transmitterCallsign).toBe("<OE9PTI>");
    expect(record.transmitterLocator).toBe("JN47VL");
    expect(record.powerDbm).toBe(23);
  });

  it("reports malformed records without aborting the full parse", () => {
    const text = [
      "260806 1754 -23 -0.15 7.0400030 OE7XZB JN57 23 0 0.17 1",
      "this is not a WSJT-X record",
      "",
      "260806 1756 -5 -0.10 7.0400513 EA5UV IM99 23 0 0.69 1"
    ].join("\n");

    const result = parser.parse(text);

    expect(result.records).toHaveLength(2);
    expect(result.issues).toHaveLength(1);
    expect(result.ignoredLines).toBe(1);
    expect(result.totalLines).toBe(4);

    expect(result.issues[0]).toEqual({
      lineNumber: 2,
      line: "this is not a WSJT-X record",
      reason: "Unsupported WSJT-X record format"
    });
  });
});
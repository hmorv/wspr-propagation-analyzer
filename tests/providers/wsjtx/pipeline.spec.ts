import { describe, expect, it } from "vitest";

import { DefaultWsjtxPipeline } from "../../../src/providers/wsjtx/default-wsjtx-pipeline.js";

describe("DefaultWsjtxPipeline", () => {
  it("processes WSJT-X text into TX and RX cycles", () => {
    const text = [
      "260806_182000 7.039 Tx WSPR 0 0.0 1444 EA6AJT JM19 30",
      "260806 1822 -20 4.93 7.0399954 SQ9RHX JO81 23 0 0.26 1 1 0 0 16 3 186",
      "260806 1822 -7 0.02 7.0400719 9A3ZI JN86 3 0 0.38 1 1 0 0 7 1 466",
      "260806_182400 7.039 Tx WSPR 0 0.0 1444 EA6AJT JM19 30"
    ].join("\n");

    const pipeline = new DefaultWsjtxPipeline();

    const result = pipeline.process(text, {
      stationCallsign: "EA6AJT",
      stationLocator: "JM19hn"
    });

    expect(result.parseIssues).toHaveLength(0);
    expect(result.cycleIssues).toHaveLength(0);

    expect(result.statistics).toEqual({
      totalLines: 4,
      blankLines: 0,
      ignoredRecords: 0,
      parsedRecords: 4,
      transmissions: 2,
      receptionSpots: 2,
      txCycles: 2,
      rxCycles: 1
    });

    expect(result.cycles).toHaveLength(3);

    expect(
      result.cycles.map((cycle) => cycle.direction)
    ).toEqual(["tx", "rx", "tx"]);

    const rxCycle = result.cycles.find(
      (cycle) => cycle.direction === "rx"
    );

    expect(rxCycle?.spots).toHaveLength(2);
  });

  it("returns parse issues while processing valid records", () => {
    const text = [
      "invalid line",
      "260806 1822 -7 0.02 7.0400719 9A3ZI JN86 3 0 0.38 1"
    ].join("\n");

    const pipeline = new DefaultWsjtxPipeline();

    const result = pipeline.process(text, {
      stationCallsign: "EA6AJT"
    });

    expect(result.parseIssues).toHaveLength(1);
    expect(result.cycleIssues).toHaveLength(0);

    expect(result.statistics).toEqual({
      totalLines: 2,
      blankLines: 0,
      ignoredRecords: 0,
      parsedRecords: 1,
      transmissions: 0,
      receptionSpots: 1,
      txCycles: 0,
      rxCycles: 1
    });
  });
});
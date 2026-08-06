import type { WsjtxPipelineResult } from "../providers/wsjtx/pipeline-result.js";

export class ConsoleReporter {
  public print(result: WsjtxPipelineResult): void {
    this.printStatistics(result);
  }

  private printStatistics(result: WsjtxPipelineResult): void {
    console.log("Statistics");
    console.log("-------------------------");

    console.log(`Parsed records : ${result.statistics.parsedRecords}`);
    console.log(`Blank lines     : ${result.statistics.blankLines}`);
console.log(`Ignored records : ${result.statistics.ignoredRecords}`);
    console.log(`Transmissions  : ${result.statistics.transmissions}`);
    console.log(`RX spots       : ${result.statistics.receptionSpots}`);
    console.log(`TX cycles      : ${result.statistics.txCycles}`);
    console.log(`RX cycles      : ${result.statistics.rxCycles}`);
    console.log(`Parse issues   : ${result.parseIssues.length}`);
    console.log(`Cycle issues   : ${result.cycleIssues.length}`);
  }
}
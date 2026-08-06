export interface WsjtxPipelineOptions {
  stationCallsign: string;
  stationLocator?: string;

  cycleDurationSeconds?: number;
  timestampToleranceSeconds?: number;
}
export interface WsjtxTransmission {
  type: "transmission";
  timestamp: Date;
  dialFrequencyMHz: number;
  mode: "WSPR";
  audioFrequencyHz: number;
  callsign: string;
  locator: string;
  powerDbm: number;
  rawLine: string;
}

export interface WsjtxReception {
  type: "reception";
  timestamp: Date;
  snrDb: number;
  timeOffsetSeconds: number;
  frequencyMHz: number;
  callsign: string;
  locator: string | null;
  powerDbm: number;
  decoderFields: number[];
  rawLine: string;
}

export type WsjtxRecord = WsjtxTransmission | WsjtxReception;
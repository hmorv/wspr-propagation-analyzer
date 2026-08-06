export interface WsjtxTransmissionRecord {
  type: "transmission";
  timestamp: Date;
  dialFrequencyMHz: number;
  mode: string;
  audioFrequencyHz: number;
  callsign: string;
  locator: string;
  powerDbm: number;
  additionalFields: number[];
  rawLine: string;
}

export interface WsjtxReceptionRecord {
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

export type WsjtxRecord =
  | WsjtxTransmissionRecord
  | WsjtxReceptionRecord;
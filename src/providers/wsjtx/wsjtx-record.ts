export interface WsjtxTransmission {
  type: "transmission";

  timestamp: Date;
  dialFrequencyMHz: number;
  mode: "WSPR";
  audioFrequencyHz: number;

  transmitterCallsign: string;
  transmitterLocator: string;
  powerDbm: number;

  additionalFields: number[];

  rawLine: string;
}

export interface WsjtxReception {
  type: "reception";

  timestamp: Date;
  snrDb: number;
  timeOffsetSeconds: number;
  frequencyMHz: number;

  transmitterCallsign: string;
  transmitterLocator: string | null;
  powerDbm: number;

  decoderFields: number[];

  rawLine: string;
}

export type WsjtxRecord =
  | WsjtxTransmission
  | WsjtxReception;
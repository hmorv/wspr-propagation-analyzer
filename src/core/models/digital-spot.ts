import type { Power } from "./power.js";

export enum DataSource {
  Wsjtx = "wsjtx",
  Wsprnet = "wsprnet"
}

export type DigitalMode =
  | "WSPR"
  | "FST4W"
  | "FT8"
  | "FT4";

export interface DigitalSpot {
  timestamp: Date;

  transmitterCallsign: string;
  transmitterLocator?: string;

  receiverCallsign?: string;
  receiverLocator?: string;

  frequencyMHz: number;
  snrDb: number;

  transmittedPower?: Power;

  distanceKm?: number;
  azimuthDegrees?: number;

  driftHzPerMinute?: number;
  timeOffsetSeconds?: number;

  mode: DigitalMode;
  source: DataSource;

  rawLine: string;
}
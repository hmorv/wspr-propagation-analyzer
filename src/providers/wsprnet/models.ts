export interface WsprnetSpotRecord {
  timestamp: Date;
  transmitterCallsign: string;
  transmitterLocator: string;
  reporterCallsign: string;
  reporterLocator: string;
  frequencyMHz: number;
  snrDb: number;
  driftHzPerMinute: number;
  powerWatts: number;
  distanceKm: number;
  azimuthDegrees: number;
  mode: string;
  rawLine: string;
}
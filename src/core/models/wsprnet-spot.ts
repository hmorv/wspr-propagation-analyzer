export interface WsprnetSpot {
  timestamp: Date;
  callsign: string;
  frequencyMHz: number;
  snrDb: number;
  driftHzPerMinute: number;
  transmittingLocator: string;
  powerWatts: number;
  reporter: string;
  reporterLocator: string;
  distanceKm: number;
  azimuthDegrees: number;
  mode: string;
  rawLine: string;
}
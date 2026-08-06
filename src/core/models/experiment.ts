export type AmateurBand =
  | "160m"
  | "80m"
  | "60m"
  | "40m"
  | "30m"
  | "20m"
  | "17m"
  | "15m"
  | "12m"
  | "10m"
  | "6m"
  | "4m"
  | "2m"
  | "70cm"
  | "23cm";

export interface StationConfiguration {
  callsign: string;
  locator: string;
  antenna?: string;
  equipment?: string;
  notes?: string;
}

export interface SoftwareConfiguration {
  name: string;
  version?: string;
}

export interface Transmission {
  timestamp: Date;
  frequencyMHz: number;
  callsign: string;
  locator?: string;
  powerDbm: number;
  mode: string;
  source: string;
}

export interface Reception {
  timestamp: Date;
  receiverCallsign?: string;
  receivedCallsign: string;
  receivedLocator?: string;
  frequencyMHz: number;
  snrDb: number;
  powerDbm?: number;
  mode: string;
  source: string;
}

export interface ReceptionReport {
  timestamp: Date;
  transmitterCallsign: string;
  transmitterLocator?: string;
  reporterCallsign: string;
  reporterLocator?: string;
  frequencyMHz: number;
  snrDb: number;
  powerDbm?: number;
  distanceKm?: number;
  azimuthDegrees?: number;
  mode: string;
  source: string;
}

export interface Experiment {
  id: string;
  title: string;
  startUtc: Date;
  endUtc: Date;
  band: AmateurBand;
  powerWatts: number;
  software?: SoftwareConfiguration[];
  station: StationConfiguration;
  transmissions: Transmission[];
  receptions: Reception[];
  receptionReports: ReceptionReport[];
}
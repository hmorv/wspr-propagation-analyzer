import type { WsprCycle } from "./wspr-cycle.js";

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

export interface Experiment {
  id: string;
  title: string;
  startUtc: Date;
  endUtc: Date;
  band: AmateurBand;
  powerWatts: number;
  software?: SoftwareConfiguration[];
  station: StationConfiguration;
  cycles: WsprCycle[];
  notes?: string;
}
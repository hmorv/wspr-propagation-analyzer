import type { DigitalSpot } from "./digital-spot.js";

export type WsprCycleDirection = "tx" | "rx";

export interface WsprCycleBase {
  timestamp: Date;
  direction: WsprCycleDirection;
  frequencyMHz: number;
  observations: DigitalSpot[];
}

export interface WsprTransmissionCycle extends WsprCycleBase {
  direction: "tx";
  transmitterCallsign: string;
  transmitterLocator?: string;
  powerDbm: number;
}

export interface WsprReceptionCycle extends WsprCycleBase {
  direction: "rx";
  receiverCallsign: string;
  receiverLocator?: string;
}

export type WsprCycle =
  | WsprTransmissionCycle
  | WsprReceptionCycle;
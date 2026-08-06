import type { DigitalMode } from "./digital-spot.js";
import type { Power } from "./power.js";

export interface DigitalTransmission {
  timestamp: Date;

  transmitterCallsign: string;
  transmitterLocator?: string;

  dialFrequencyMHz: number;
  audioFrequencyHz?: number;

  transmittedPower?: Power;

  mode: DigitalMode;
}
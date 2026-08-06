import type { DigitalMode, DigitalSpot } from "./digital-spot.js";
import type { Power } from "./power.js";

export type WsprCycleDirection = "tx" | "rx";

export interface WsprCycleBase {
  timestamp: Date;
  direction: WsprCycleDirection;
  mode: DigitalMode;
  spots: DigitalSpot[];
}

export interface WsprTransmissionCycle extends WsprCycleBase {
  direction: "tx";

  transmitterCallsign: string;
  transmitterLocator?: string;

  dialFrequencyMHz: number;
  audioFrequencyHz?: number;
  transmittedPower?: Power;
}

export interface WsprReceptionCycle extends WsprCycleBase {
  direction: "rx";

  receiverCallsign: string;
  receiverLocator?: string;

  /**
   * Puede conocerse si el proveedor lo aporta o si se incluye
   * en la configuración de la sesión.
   */
  dialFrequencyMHz?: number;
}

export type WsprCycle =
  | WsprTransmissionCycle
  | WsprReceptionCycle;
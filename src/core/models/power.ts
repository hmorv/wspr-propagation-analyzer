export type PowerUnit = "W" | "dBm";

export interface Power {
  value: number;
  unit: PowerUnit;
}
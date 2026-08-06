export interface CycleBuilderOptions {
  stationCallsign: string;
  stationLocator?: string;

  /**
   * Duración nominal del ciclo.
   * WSPR usa normalmente 120 segundos.
   */
  cycleDurationSeconds: number;

  /**
   * Tolerancia para asociar spots con una transmisión.
   */
  timestampToleranceSeconds: number;
}
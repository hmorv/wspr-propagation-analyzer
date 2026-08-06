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

  /**
   * Genera una incidencia cuando una transmisión no tiene spots asociados.
   * Debe permanecer desactivado cuando solo se procesan datos locales
   * de WSJT-X, ya que esos logs no incluyen receptores remotos.
   */
  reportMissingTransmissionSpots?: boolean;
}
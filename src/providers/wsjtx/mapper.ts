import {
  DataSource
} from "../../core/models/digital-spot.js";

import type {
  DigitalSpot
} from "../../core/models/digital-spot.js";

import type {
  DigitalTransmission
} from "../../core/models/digital-transmission.js";

import type {
  WsjtxRecord
} from "./wsjtx-record.js";

export interface WsjtxMappingResult {
  transmissions: DigitalTransmission[];
  spots: DigitalSpot[];
}

export interface WsjtxMapper {
  map(records: WsjtxRecord[], receiverCallsign: string, receiverLocator?: string): WsjtxMappingResult;
}

export class DefaultWsjtxMapper implements WsjtxMapper {
  map(
    records: WsjtxRecord[],
    receiverCallsign: string,
    receiverLocator?: string
  ): WsjtxMappingResult {
    if (!receiverCallsign.trim()) {
      throw new Error("receiverCallsign must not be empty");
    }

    const transmissions: DigitalTransmission[] = [];
    const spots: DigitalSpot[] = [];

    for (const record of records) {
      if (record.type === "transmission") {
        transmissions.push({
          timestamp: record.timestamp,
          transmitterCallsign: record.transmitterCallsign,
          transmitterLocator: record.transmitterLocator,
          dialFrequencyMHz: record.dialFrequencyMHz,
          audioFrequencyHz: record.audioFrequencyHz,
          transmittedPower: {
            value: record.powerDbm,
            unit: "dBm"
          },
          mode: record.mode
        });

        continue;
      }

      spots.push({
        timestamp: record.timestamp,
        transmitterCallsign: record.transmitterCallsign,
        ...(record.transmitterLocator
          ? { transmitterLocator: record.transmitterLocator }
          : {}),
        receiverCallsign,
        ...(receiverLocator
          ? { receiverLocator }
          : {}),
        frequencyMHz: record.frequencyMHz,
        snrDb: record.snrDb,
        transmittedPower: {
          value: record.powerDbm,
          unit: "dBm"
        },
        timeOffsetSeconds: record.timeOffsetSeconds,
        mode: "WSPR",
        source: DataSource.Wsjtx,
        rawLine: record.rawLine
      });
    }

    return {
      transmissions,
      spots
    };
  }
}
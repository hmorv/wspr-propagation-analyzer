import type {
  ParseIssue,
  ParseResult
} from "../common/parse-result.js";
import type { WsjtxParser } from "./parser.js";
import type {
  WsjtxReception,
  WsjtxRecord,
  WsjtxTransmission
} from "./wsjtx-record.js";

const TX_RECORD_PATTERN =
  /^(\d{6})_(\d{6})\s+([+-]?\d+(?:\.\d+)?)\s+Tx\s+(\S+)\s+(.+)$/;

const RX_RECORD_PATTERN =
  /^(\d{6})\s+(\d{4})\s+([+-]?\d+)\s+([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\s+(.+)$/;

const LOCATOR_PATTERN = /^[A-R]{2}\d{2}(?:[A-X]{2})?$/i;
const INTEGER_PATTERN = /^[+-]?\d+$/;
const NUMBER_PATTERN = /^[+-]?\d+(?:\.\d+)?$/;

export class DefaultWsjtxParser implements WsjtxParser {
  parse(text: string): ParseResult<WsjtxRecord> {
    const records: WsjtxRecord[] = [];
    const issues: ParseIssue[] = [];

    const lines = text.split(/\r?\n/);
    let blankLines = 0;
    let ignoredRecords = 0;

    lines.forEach((line, index) => {
      const rawLine = line;
      const trimmedLine = line.trim();

      if (!trimmedLine || this.shouldIgnoreLine(trimmedLine)) {
        if (!trimmedLine) {
          blankLines += 1;
          return;
        }

        if (this.shouldIgnoreLine(trimmedLine)) {
          ignoredRecords += 1;
          return;
        }
      }

      try {
        const record = this.parseLine(trimmedLine, rawLine);

        if (record) {
          records.push(record);
        } else {
          issues.push({
            lineNumber: index + 1,
            line: rawLine,
            reason: "Unsupported WSJT-X record format"
          });
        }
      } catch (error: unknown) {
        issues.push({
          lineNumber: index + 1,
          line: rawLine,
          reason:
            error instanceof Error
              ? error.message
              : "Unknown parsing error"
        });
      }
    });

    return {
      records,
      issues,
      blankLines,
      ignoredRecords,
      totalLines: lines.length
    };
  }

  private shouldIgnoreLine(line: string): boolean {
    const isNonSpotRxRecord =
      /^\d{6}_\d{6}\s+\S+\s+Rx\s+WSPR\b/.test(line);

    const isTuneTransmission =
      /^\d{6}_\d{6}\s+\S+\s+Tx\s+WSPR\b.*\bTUNE\s*$/.test(line);

    return isNonSpotRxRecord || isTuneTransmission;
  }

  private parseLine(
    line: string,
    rawLine: string
  ): WsjtxRecord | null {
    if (line.includes(" Tx ")) {
      return this.parseTransmission(line, rawLine);
    }

    return this.parseReception(line, rawLine);
  }

  private parseTransmission(
    line: string,
    rawLine: string
  ): WsjtxTransmission | null {
    const match = TX_RECORD_PATTERN.exec(line);

    if (!match) {
      return null;
    }

    const [
      ,
      datePart,
      timePart,
      dialFrequencyText,
      mode,
      remainingText
    ] = match;

    if (
      !datePart ||
      !timePart ||
      !dialFrequencyText ||
      !mode ||
      !remainingText
    ) {
      return null;
    }

    const fields = remainingText.trim().split(/\s+/);

    if (fields.length < 6) {
      throw new Error(
        `Expected at least 6 TX fields after mode, found ${fields.length}`
      );
    }

    const powerText = fields.at(-1);
    const locator = fields.at(-2);
    const transmitterCallsign = fields.at(-3);
    const audioFrequencyText = fields.at(-4);

    if (
      !powerText ||
      !locator ||
      !transmitterCallsign ||
      !audioFrequencyText
    ) {
      throw new Error("Incomplete TX record");
    }

    if (!INTEGER_PATTERN.test(powerText)) {
      throw new Error(`Invalid TX power: ${powerText}`);
    }

    if (!NUMBER_PATTERN.test(audioFrequencyText)) {
      throw new Error(
        `Invalid TX audio frequency: ${audioFrequencyText}`
      );
    }

    const additionalFields = fields
      .slice(0, -4)
      .map((value) => {
        if (!NUMBER_PATTERN.test(value)) {
          throw new Error(
            `Invalid additional TX field: ${value}`
          );
        }

        return Number(value);
      });

    return {
      type: "transmission",
      timestamp: this.parseUtcTimestamp(datePart, timePart),
      dialFrequencyMHz: Number(dialFrequencyText),
      mode: this.parseTransmissionMode(mode),
      audioFrequencyHz: Number(audioFrequencyText),
      transmitterCallsign,
      transmitterLocator: locator,
      powerDbm: Number(powerText),
      additionalFields,
      rawLine
    };
  }

  private parseReception(
    line: string,
    rawLine: string
  ): WsjtxReception | null {
    const match = RX_RECORD_PATTERN.exec(line);

    if (!match) {
      return null;
    }

    const [
      ,
      datePart,
      timePart,
      snrText,
      timeOffsetText,
      frequencyText,
      remainingText
    ] = match;

    if (
      !datePart ||
      !timePart ||
      !snrText ||
      !timeOffsetText ||
      !frequencyText ||
      !remainingText
    ) {
      return null;
    }

    const fields = remainingText.trim().split(/\s+/);

    if (fields.length < 2) {
      throw new Error("Incomplete RX record");
    }

    const transmitterCallsign = fields[0];

    if (!transmitterCallsign) {
      throw new Error("Missing RX transmitter callsign");
    }

    const possibleLocator = fields[1];

    const hasLocator =
      possibleLocator !== undefined &&
      LOCATOR_PATTERN.test(possibleLocator);

    const powerIndex = hasLocator ? 2 : 1;
    const powerText = fields[powerIndex];

    if (!powerText || !INTEGER_PATTERN.test(powerText)) {
      throw new Error(
        `Invalid or missing RX power: ${powerText ?? "<missing>"}`
      );
    }

    const decoderFields = fields
      .slice(powerIndex + 1)
      .map((value) => {
        if (!NUMBER_PATTERN.test(value)) {
          throw new Error(
            `Invalid RX decoder field: ${value}`
          );
        }

        return Number(value);
      });

    return {
      type: "reception",
      timestamp: this.parseUtcTimestamp(datePart, `${timePart}00`),
      snrDb: Number(snrText),
      timeOffsetSeconds: Number(timeOffsetText),
      frequencyMHz: Number(frequencyText),
      transmitterCallsign,
      transmitterLocator: hasLocator
        ? possibleLocator ?? null
        : null,
      powerDbm: Number(powerText),
      decoderFields,
      rawLine
    };
  }

  private parseUtcTimestamp(
    datePart: string,
    timePart: string
  ): Date {
    const year = 2000 + Number(datePart.slice(0, 2));
    const month = Number(datePart.slice(2, 4));
    const day = Number(datePart.slice(4, 6));

    const hour = Number(timePart.slice(0, 2));
    const minute = Number(timePart.slice(2, 4));
    const second = Number(timePart.slice(4, 6) || "00");

    const timestamp = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second)
    );

    if (
      timestamp.getUTCFullYear() !== year ||
      timestamp.getUTCMonth() !== month - 1 ||
      timestamp.getUTCDate() !== day ||
      timestamp.getUTCHours() !== hour ||
      timestamp.getUTCMinutes() !== minute ||
      timestamp.getUTCSeconds() !== second
    ) {
      throw new Error(
        `Invalid UTC timestamp: ${datePart} ${timePart}`
      );
    }

    return timestamp;
  }

  private parseTransmissionMode(mode: string): "WSPR" {
    if (mode !== "WSPR") {
      throw new Error(`Unsupported TX mode: ${mode}`);
    }

    return mode;
  }
}
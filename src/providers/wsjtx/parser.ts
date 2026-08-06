import type { ParseResult } from "../common/parse-result.js";
import type { WsjtxRecord } from "./wsjtx-record.js";

export interface WsjtxParser {
  parse(text: string): ParseResult<WsjtxRecord>;
}
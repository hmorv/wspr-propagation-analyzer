import type { WsjtxPipelineOptions } from "./pipeline-options.js";
import type { WsjtxPipelineResult } from "./pipeline-result.js";

export interface WsjtxPipeline {
  process(
    text: string,
    options: WsjtxPipelineOptions
  ): WsjtxPipelineResult;
}
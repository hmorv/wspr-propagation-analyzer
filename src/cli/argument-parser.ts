import type { CliOptions } from "./cli-options.js";

export class ArgumentParser {
  public parse(argv: string[]): CliOptions {
    if (argv.length < 1) {
      throw new Error("Missing input file.");
    }

    return {
      inputFile: argv[0]!
    };
  }
}
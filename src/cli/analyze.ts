import { readFileSync } from "node:fs";

import { ArgumentParser } from "./argument-parser.js";
import { ConsoleReporter } from "./console-reporter.js";
import { printBanner } from "./banner.js";

import { DefaultWsjtxPipeline } from "../providers/wsjtx/default-wsjtx-pipeline.js";

function main(): void {

    printBanner();

    const options =
        new ArgumentParser().parse(process.argv.slice(2));

    const text =
        readFileSync(options.inputFile, "utf8");

    const pipeline =
        new DefaultWsjtxPipeline();

    const result =
        pipeline.process(text, {
            stationCallsign: "EA6AJT",
            stationLocator: "JM19hn"
        });

    new ConsoleReporter().print(result);
}

try {
    main();
}
catch (error) {

    console.error();

    if (error instanceof Error) {
        console.error(error.message);
    }
    else {
        console.error(error);
    }

    process.exit(1);
}
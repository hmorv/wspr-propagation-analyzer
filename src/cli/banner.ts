export const APP_INFO = {
  name: "WSPR Propagation Analyzer",
  version: "0.1.0"
};

export function printBanner(): void {
  console.log();
  console.log(`${APP_INFO.name} ${APP_INFO.version}`);
  console.log("=".repeat(40));
  console.log();
}
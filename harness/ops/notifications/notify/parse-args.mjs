// Generated from ../../../scripts/ops/notifications/notify.mjs:38

export function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const channelArg = args.find((a) => a.startsWith("--channel="));
  const channel = channelArg ? channelArg.split("=")[1] : "all";
  return { dryRun, channel };
}

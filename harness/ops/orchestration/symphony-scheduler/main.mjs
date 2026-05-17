  // Convert command line arguments to a Set for efficient lookup
  const args = new Set(process.argv.slice(2));
  const daemon = args.has("--daemon");
  const once = args.has("--once");
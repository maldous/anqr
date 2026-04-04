export const parseArgs = (argv) => {
  const options = {
    json: false,
    byFile: false,
    paths: [],
  };

  for (const arg of argv) {
    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--by-file") {
      options.byFile = true;
      continue;
    }

    options.paths.push(arg);
  }

  return options;
};

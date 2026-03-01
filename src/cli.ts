#!/usr/bin/env node

async function main(): Promise<void> {
  const subcommand = process.argv[2];

  if (subcommand === "init") {
    const { runInit } = await import("./init/index.js");
    await runInit(process.argv.slice(3));
  } else {
    await import("./index.js");
  }
}

main();

#!/usr/bin/env node

/**
 * Dump all ANQR systemd user services and timers to a tar.gz file.
 *
 * Usage:
 *   node scripts/ops/dump-systemd-services.mjs [--output anqr-systemd.tar.gz]
 *
 * Options:
 *   --output <path>  Output tar.gz file path (default: anqr-systemd.tar.gz)
 *   --prefix <name>  Service name prefix (default: anqr)
 *
 * Requires: systemctl and tar access. Run as the user who owns the services.
 *
 * Output: tar.gz file containing all unit files and status.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const HELP_TEXT = `Dump ANQR systemd services to tar.gz.

Usage:
  node scripts/ops/dump-systemd-services.mjs [options]

Options:
  --output <path>  Output tar.gz file path (default: anqr-systemd.tar.gz)
  --prefix <name>  Service name prefix (default: anqr)
  -h, --help       Show this help text
`;

function parseArgs(argv) {
  const args = { output: 'anqr-systemd.tar.gz', prefix: 'anqr' };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const value = argv[i + 1];
    switch (flag) {
      case '--output':
        args.output = value;
        i += 2;
        break;
      case '--prefix':
        args.prefix = value;
        i += 2;
        break;
      case '--help':
      case '-h':
        args.help = true;
        i += 1;
        break;
      default:
        console.error(`Unknown flag: ${flag}`);
        console.error('Use --help to view available options.');
        process.exit(1);
    }
  }
  return args;
}

/**
 * Get all user unit files matching the prefix.
 */
function getServiceNames(prefix) {
  const output = execSync(
    `systemctl -a --user list-units --all --type=service,timer --no-pager --no-legend`,
    {
      encoding: 'utf-8',
    }
  );

  const units = [];
  for (const line of output.split('\n')) {
    const match = line.trim().match(/^([a-z][a-z0-9-]*\.(?:service|timer))\s+/);
    if (match) {
      const name = match[1];
      if (name.startsWith(prefix) || name.startsWith('symphony-')) {
        units.push(name);
      }
    }
  }
  return units;
}

/**
 * Get the full unit file content.
 */
function getUnitFile(unitName) {
  try {
    return execSync(`systemctl cat --user ${unitName}`, { encoding: 'utf-8' });
  } catch (err) {
    console.error(`Warning: Could not get unit file for ${unitName}: ${err.message}`);
    return null;
  }
}

/**
 * Get unit status info.
 */
function getUnitStatus(unitName) {
  try {
    return execSync(`systemctl show --user ${unitName} --no-pager`, { encoding: 'utf-8' });
  } catch (err) {
    console.error(`Warning: Could not get status for ${unitName}: ${err.message}`);
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(HELP_TEXT);
    return;
  }

  console.error(`Finding ${args.prefix}* and symphony-* services...`);

  const units = getServiceNames(args.prefix);
  console.error(`Found ${units.length} units: ${units.join(', ')}`);

  // Also include symphony-anqr if present
  try {
    execSync('systemctl is-active --user symphony-anqr.service', { encoding: 'utf-8' });
    if (!units.includes('symphony-anqr.service')) {
      units.push('symphony-anqr.service');
    }
  } catch {
    // Not running, but still include if it exists
    try {
      execSync('systemctl list-unit-files --user symphony-anqr.service', { encoding: 'utf-8' });
      if (!units.includes('symphony-anqr.service')) {
        units.push('symphony-anqr.service');
      }
    } catch {
      // Doesn't exist
    }
  }

  // Create temp directory
  const tempDir = mkdtempSync(join(tmpdir(), 'anqr-systemd-'));
  mkdirSync(join(tempDir, 'units'), { recursive: true });
  mkdirSync(join(tempDir, 'status'), { recursive: true });

  try {
    // Capture each unit
    const manifest = {
      captured: new Date().toISOString(),
      units: [],
      host: process.env.HOSTNAME || 'unknown',
      user: process.env.USER || 'unknown',
    };

    for (const unitName of units) {
      console.error(`Capturing ${unitName}...`);

      const unitFile = getUnitFile(unitName);
      const status = getUnitStatus(unitName);

      manifest.units.push({
        name: unitName,
        hasUnitFile: !!unitFile,
        hasStatus: !!status,
      });

      if (unitFile) {
        writeFileSync(join(tempDir, 'units', unitName), unitFile);
      }
      if (status) {
        writeFileSync(join(tempDir, 'status', `${unitName}.status`), status);
      }
    }

    // Write manifest
    writeFileSync(join(tempDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // Write environment info
    const envInfo = {
      hostname: process.env.HOSTNAME || 'unknown',
      user: process.env.USER || 'unknown',
      home: process.env.HOME || 'unknown',
      path: process.env.PATH || '',
      nodeVersion: execSync('node --version', { encoding: 'utf-8' }).trim(),
      npmVersion: execSync('npm --version', { encoding: 'utf-8' }).trim(),
      capturedAt: new Date().toISOString(),
    };
    writeFileSync(join(tempDir, 'environment.json'), JSON.stringify(envInfo, null, 2));

    // Create tar.gz
    execSync(`tar -czf ${args.output} -C ${tempDir} .`, { encoding: 'utf-8' });
    console.error(`Wrote ${args.output} with ${units.length} units`);
  } finally {
    // Cleanup temp dir
    rmSync(tempDir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (err) {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
}

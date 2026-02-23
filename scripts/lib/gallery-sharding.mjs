/**
 * Shared sharding helpers for gallery generators.
 *
 * Supported env forms:
 * - GALLERY_SHARD="2/8"          (1-based shard selection)
 * - GALLERY_SHARD="2-of-8"       (1-based shard selection)
 * - GALLERY_SHARD_INDEX="1"      (0-based index; requires GALLERY_SHARD_TOTAL)
 *   GALLERY_SHARD_TOTAL="8"
 */

function parsePositiveInt(value, label) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

function parseNonNegativeInt(value, label) {
  const parsed = Number.parseInt(String(value ?? '').trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
}

function parseShardPair(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return null;

  const slashMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (slashMatch) {
    return {
      indexOneBased: parsePositiveInt(slashMatch[1], 'GALLERY_SHARD'),
      total: parsePositiveInt(slashMatch[2], 'GALLERY_SHARD'),
    };
  }

  const ofMatch = trimmed.match(/^(\d+)\s*(?:-of-|of)\s*(\d+)$/i);
  if (ofMatch) {
    return {
      indexOneBased: parsePositiveInt(ofMatch[1], 'GALLERY_SHARD'),
      total: parsePositiveInt(ofMatch[2], 'GALLERY_SHARD'),
    };
  }

  throw new Error(`Invalid GALLERY_SHARD format: ${trimmed}. Use "2/8" or "2-of-8".`);
}

export function resolveGalleryShard(env = process.env) {
  const explicitPair = parseShardPair(env.GALLERY_SHARD);
  if (explicitPair) {
    const { indexOneBased, total } = explicitPair;
    if (indexOneBased > total) {
      throw new Error(`Invalid GALLERY_SHARD "${env.GALLERY_SHARD}": shard index must be <= total`);
    }
    const index = indexOneBased - 1;
    return {
      total,
      index,
      isSharded: total > 1,
      suffix: `shard-${index + 1}-of-${total}`,
      label: `${index + 1}/${total}`,
    };
  }

  const totalRaw = env.GALLERY_SHARD_TOTAL;
  if (totalRaw === undefined || String(totalRaw).trim() === '') {
    return {
      total: 1,
      index: 0,
      isSharded: false,
      suffix: 'shard-1-of-1',
      label: 'all',
    };
  }

  const total = parsePositiveInt(totalRaw, 'GALLERY_SHARD_TOTAL');
  const index = parseNonNegativeInt(env.GALLERY_SHARD_INDEX ?? 0, 'GALLERY_SHARD_INDEX');
  if (index >= total) {
    throw new Error(
      `Invalid shard selection: GALLERY_SHARD_INDEX=${index} must be < GALLERY_SHARD_TOTAL=${total}`
    );
  }

  return {
    total,
    index,
    isSharded: total > 1,
    suffix: `shard-${index + 1}-of-${total}`,
    label: `${index + 1}/${total}`,
  };
}

export function applyGalleryShard(items, shard) {
  if (!shard?.isSharded) return items;
  return items.filter((_, idx) => idx % shard.total === shard.index);
}

export function shardOutputFilename(filename, shard) {
  if (!shard?.isSharded) return filename;
  const dot = filename.lastIndexOf('.');
  if (dot <= 0) {
    return `${filename}.${shard.suffix}`;
  }
  const base = filename.slice(0, dot);
  const ext = filename.slice(dot);
  return `${base}.${shard.suffix}${ext}`;
}

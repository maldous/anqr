import { QR_LOG_LEVEL, _qrLogLevelRank, nowMs } from './logging';

export class RunningStats {
  n = 0;
  mean = 0;
  m2 = 0;
  min = Number.POSITIVE_INFINITY;
  max = Number.NEGATIVE_INFINITY;

  push(x: number): void {
    this.n++;
    const delta = x - this.mean;
    this.mean += delta / this.n;
    const delta2 = x - this.mean;
    this.m2 += delta * delta2;
    if (x < this.min) this.min = x;
    if (x > this.max) this.max = x;
  }

  variance(): number {
    return this.n > 1 ? (this.m2 / (this.n - 1)) : 0;
  }

  stddev(): number {
    return Math.sqrt(this.variance());
  }
}

export class FixedHistogram {
  edges: number[];
  bins: Uint32Array;
  under = 0;
  over = 0;
  count = 0;

  constructor(edges: number[]) {
    this.edges = edges.slice();
    this.bins = new Uint32Array(edges.length + 1);
  }

  push(x: number): void {
    this.count++;
    if (x < this.edges[0]) {
      this.under++;
      return;
    }
    for (let i = 0; i < this.edges.length; i++) {
      if (x <= this.edges[i]) {
        this.bins[i]++;
        return;
      }
    }
    this.over++;
    this.bins[this.bins.length - 1]++;
  }

  percentile(p: number): number | null {
    if (this.count === 0) return null;
    const target = Math.max(1, Math.floor(this.count * p));
    let acc = this.under;
    if (acc >= target) return this.edges[0];
    for (let i = 0; i < this.bins.length; i++) {
      acc += this.bins[i];
      if (acc >= target) {
        if (i < this.edges.length) return this.edges[i];
        return this.edges[this.edges.length - 1];
      }
    }
    return this.edges[this.edges.length - 1];
  }
}

type TopKEntry = { score: number; meta: any };

export class TopK {
  k: number;
  entries: TopKEntry[] = [];

  constructor(k: number) {
    this.k = Math.max(1, k);
  }

  minScore(): number {
    if (this.entries.length < this.k) return Number.NEGATIVE_INFINITY;
    let m = this.entries[0].score;
    for (let i = 1; i < this.entries.length; i++) if (this.entries[i].score < m) m = this.entries[i].score;
    return m;
  }

  offer(score: number, metaFactory: () => any): void {
    if (this.entries.length >= this.k && score <= this.minScore()) return;
    const meta = metaFactory();
    this.entries.push({ score, meta });
    this.entries.sort((a, b) => b.score - a.score);
    if (this.entries.length > this.k) this.entries.length = this.k;
  }
}

export class StatsCollector {
  counters = new Map<string, number>();
  gauges = new Map<string, any>();
  stats = new Map<string, RunningStats>();
  hists = new Map<string, FixedHistogram>();
  topks = new Map<string, TopK>();

  inc(name: string, delta = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + delta);
  }

  gauge(name: string, value: any): void {
    this.gauges.set(name, value);
  }

  observe(name: string, value: number): void {
    let s = this.stats.get(name);
    if (!s) {
      s = new RunningStats();
      this.stats.set(name, s);
    }
    s.push(value);
  }

  histogram(name: string, value: number, edges: number[]): void {
    let h = this.hists.get(name);
    if (!h) {
      h = new FixedHistogram(edges);
      this.hists.set(name, h);
    }
    h.push(value);
  }

  topkOffer(name: string, score: number, metaFactory: () => any, k = 3): void {
    let t = this.topks.get(name);
    if (!t) {
      t = new TopK(k);
      this.topks.set(name, t);
    }
    t.offer(score, metaFactory);
  }

  getCounter(name: string): number | null {
    const v = this.counters.get(name);
    return typeof v === 'number' ? v : null;
  }

  getGaugeNumber(name: string): number | null {
    const v = this.gauges.get(name);
    return typeof v === 'number' ? v : null;
  }

  getGaugeAny(name: string): any {
    return this.gauges.get(name);
  }

  getTopK(name: string): TopKEntry[] {
    const t = this.topks.get(name);
    return t ? t.entries.slice() : [];
  }
}

let ACTIVE_STATS: StatsCollector | null = null;

function estimateForegroundRatio(binary: boolean[], stride = 64): number {
  let on = 0;
  let total = 0;
  for (let i = 0; i < binary.length; i += stride) {
    if (binary[i]) on++;
    total++;
  }
  return total > 0 ? (on / total) : 0;
}

export function emitSummaryLine(args: {
  ok: boolean;
  stage: QRStage;
  reason?: QRFailureReason | null;
  startedMs: number;
  width: number;
  height: number;
  scale: number;
  stats: StatsCollector;
}): void {
  if (_qrLogLevelRank(QR_LOG_LEVEL) < _qrLogLevelRank('summary')) return;

  const ms = Math.max(0, nowMs() - args.startedMs);
  const threshSel = args.stats.getGaugeNumber('threshold.selected');
  const threshN = args.stats.getCounter('thresholds.tried');
  const fg = args.stats.getGaugeNumber('binarization.fgRatio');
  const contrast = args.stats.getGaugeNumber('input.contrast');
  const finders = args.stats.getGaugeNumber('finders.count');
  const cand = args.stats.getGaugeNumber('candidates.count');
  const best = args.stats.getGaugeNumber('candidates.bestScore');

  const parts: string[] = [];
  parts.push(`ok=${args.ok ? 1 : 0}`);
  parts.push(`stage=${args.stage}`);
  if (!args.ok) parts.push(`reason=${args.reason ?? 'unknown'}`);
  parts.push(`ms=${ms}`);
  parts.push(`w=${args.width}`);
  parts.push(`h=${args.height}`);
  parts.push(`scale=${args.scale}`);

  if (typeof threshSel === 'number') parts.push(`thresh_sel=${Math.round(threshSel)}`);
  if (typeof threshN === 'number') parts.push(`thresh_n=${threshN}`);
  if (typeof fg === 'number') parts.push(`fg=${fg.toFixed(3)}`);
  if (typeof contrast === 'number') parts.push(`contrast=${contrast.toFixed(2)}`);
  if (typeof finders === 'number') parts.push(`finders=${Math.round(finders)}`);
  if (typeof cand === 'number') parts.push(`cand=${Math.round(cand)}`);
  if (typeof best === 'number') parts.push(`best=${best.toFixed(3)}`);

  qrLogLazy('summary', () => parts.join(' '));

  if (_qrLogLevelRank(QR_LOG_LEVEL) >= _qrLogLevelRank('event')) {
    const top = args.stats.getTopK('candidates.top');
    if (top.length > 0) {
      qrLogLazy('event', () => {
        const fmt = (t: TopKEntry): string => {
          const m = (t.meta ?? {}) as any;
          const thr = typeof m.threshold === 'number' ? Math.round(m.threshold) : 'na';
          const dx = typeof m.dx === 'number' ? m.dx.toFixed(3) : 'na';
          const dy = typeof m.dy === 'number' ? m.dy.toFixed(3) : 'na';
          const inv = m.inverted ? 1 : 0;
          return `${t.score.toFixed(3)}@thr=${thr},dx=${dx},dy=${dy},inv=${inv}`;
        };
        return `top_candidates=${top.map(fmt).join(' | ')}`;
      });
    }
  }
}

// ============================================
// TYPES// ============================================
// TYPES
// ============================================

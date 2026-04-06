#!/usr/bin/env python3

import argparse
import json
import sys
import urllib.error
import urllib.request


TOKEN = "local-symphony"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Show Symphony provider metrics")
    parser.add_argument(
        "-w",
        "--worktree",
        type=int,
        default=1,
        choices=range(1, 9),
        help="Worktree number (1-8, default: 1)",
    )
    return parser.parse_args()


def fetch_stats(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        return json.load(response)


def sort_key(name: str, rank_map: dict) -> tuple:
    rank = rank_map.get(name, 999)
    return (rank if isinstance(rank, int) else 999, name)


def main() -> int:
    args = parse_args()
    url = f"http://127.0.0.1:432{args.worktree}/v1/stats"

    try:
        data = fetch_stats(url)
    except urllib.error.URLError:
        print(f"\n❌ Symphony bridge not reachable at {url}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"\n❌ Failed to fetch stats: {exc}", file=sys.stderr)
        return 1

    ranked = data.get("rankedProviders", [])
    stats = data.get("providerStats", {})

    if not stats:
        print("No provider stats available.")
        return 0

    print()
    print(
        "\033[1m"
        + "  {:3s}  {:<30s} {:<14s} {:>5s} {:>5s} {:>5s} {:>8s} {:>8s} {:>7s} {:>5s} {:>5s} {:>5s}".format(
            "#",
            "PROVIDER",
            "TIER",
            "SEL",
            "OK",
            "FAIL",
            "RATE",
            "AVG MS",
            "SCORE",
            "pSEL",
            "pOK",
            "pFAIL",
        )
        + "\033[0m"
    )
    print("  " + "-" * 120)

    rank_map = {r["name"]: r.get("rank", "-") for r in ranked}

    for name in sorted(stats, key=lambda n: sort_key(n, rank_map)):
        s = stats[name]
        rank = rank_map.get(name, "-")
        score = s.get("score", "pending")
        score_str = f"{score:.2f}" if isinstance(score, (int, float)) else str(score)

        avg_ms = s.get("avgDurationMs")
        avg_ms_str = f"{avg_ms}ms" if avg_ms is not None else "N/A"

        print(
            "  {:>3s}  {:<30s} {:<14s} {:>5d} {:>5d} {:>5d} {:>8s} {:>8s} {:>7s} {:>5d} {:>5d} {:>5d}".format(
                str(rank),
                name[:30],
                str(s.get("tier", "?"))[:14],
                int(s.get("selections", 0) or 0),
                int(s.get("successes", 0) or 0),
                int(s.get("failures", 0) or 0),
                str(s.get("successRate", "N/A")),
                avg_ms_str,
                score_str,
                int(s.get("probeSelections", 0) or 0),
                int(s.get("probeSuccesses", 0) or 0),
                int(s.get("probeFailures", 0) or 0),
            )
        )

    print()

    total_sel = sum(int(s.get("selections", 0) or 0) for s in stats.values())
    total_ok = sum(int(s.get("successes", 0) or 0) for s in stats.values())
    total_fail = sum(int(s.get("failures", 0) or 0) for s in stats.values())
    ranked_count = sum(1 for r in ranked if r.get("score") not in (None, "pending"))

    print(
        f"  Totals: {total_sel} selections, {total_ok} successes, {total_fail} failures | {ranked_count} providers ranked"
    )
    print()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

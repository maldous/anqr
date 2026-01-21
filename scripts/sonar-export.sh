#!/usr/bin/env bash
set -euo pipefail

HOST="${SONAR_HOST_URL:?SONAR_HOST_URL missing}"
TOKEN="${SONAR_TOKEN:?SONAR_TOKEN missing}"
PROJECT="anqr"
PS=500

TMP=".sonar_tmp"
OUT="sonar-report.json"

rm -rf "$TMP"
mkdir -p "$TMP"

req() {
  curl -sS -u "$TOKEN:" "$HOST$1"
}

paginate_issues() {
  local query="$1"
  local out="$2"

  : > "$out"
  p=1
  while true; do
    json="$(req "/api/issues/search?componentKeys=$PROJECT&ps=$PS&p=$p&additionalFields=_all&$query")"
    n="$(echo "$json" | jq '.issues | length // 0')"
    echo "$json" | jq -c '.issues[]?' >> "$out"
    [ "$n" -lt "$PS" ] && break
    p=$((p+1))
  done
}

paginate_hotspots() {
  local out="$1"
  : > "$out"
  p=1
  while true; do
    json="$(req "/api/hotspots/search?projectKey=$PROJECT&ps=$PS&p=$p")"
    n="$(echo "$json" | jq '.hotspots | length // 0')"
    echo "$json" | jq -c '.hotspots[]?' >> "$out"
    [ "$n" -lt "$PS" ] && break
    p=$((p+1))
  done
}

echo "Exporting SonarQube data for $PROJECT"

paginate_issues ""                         "$TMP/issues_all.jsonl"
paginate_issues "softwareQualities=RELIABILITY"      "$TMP/issues_reliability.jsonl"
paginate_issues "softwareQualities=SECURITY"         "$TMP/issues_security.jsonl"
paginate_issues "softwareQualities=MAINTAINABILITY"  "$TMP/issues_maintainability.jsonl"
paginate_issues "inNewCodePeriod=true"               "$TMP/issues_new_code.jsonl"
paginate_hotspots "$TMP/hotspots.jsonl"

req "/api/measures/component?component=$PROJECT&metricKeys=bugs,vulnerabilities,code_smells,security_hotspots,ncloc,coverage,duplicated_lines_density,reliability_rating,security_rating,sqale_rating" \
  > "$TMP/measures.json"

# ---- assemble WITHOUT arg explosion
jq -n \
  --slurpfile all "$TMP/issues_all.jsonl" \
  --slurpfile rel "$TMP/issues_reliability.jsonl" \
  --slurpfile sec "$TMP/issues_security.jsonl" \
  --slurpfile main "$TMP/issues_maintainability.jsonl" \
  --slurpfile new "$TMP/issues_new_code.jsonl" \
  --slurpfile hot "$TMP/hotspots.jsonl" \
  --slurpfile measures "$TMP/measures.json" \
  --arg project "$PROJECT" \
  --arg generated "$(date -Iseconds)" \
  '{
    project: $project,
    generated: $generated,
    summary: $measures[0].component.measures,
    totals: {
      all: ($all | length),
      reliability: ($rel | length),
      security: ($sec | length),
      maintainability: ($main | length),
      new_code: ($new | length),
      hotspots: ($hot | length)
    },
    issues: {
      all: $all,
      reliability: $rel,
      security: $sec,
      maintainability: $main,
      new_code: $new
    },
    hotspots: $hot
  }' > "$OUT"

rm -rf "$TMP"
echo "Written $OUT"


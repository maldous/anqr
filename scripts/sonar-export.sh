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
  local filter_base="resolved=false"
  local filter

  : > "$out"
  p=1
  while true; do
    filter="$filter_base"
    if [ -n "$query" ]; then
      filter="$filter&$query"
    fi
    json="$(req "/api/issues/search?componentKeys=$PROJECT&ps=$PS&p=$p&additionalFields=_all&$filter")"
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

fetch_hotspot_details() {
  local in_jsonl="$1"
  local out="$2"
  : > "$out"
  while IFS= read -r hotspot; do
    [ -z "$hotspot" ] && continue
    key="$(echo "$hotspot" | jq -r '.key // empty')"
    [ -z "$key" ] && continue
    req "/api/hotspots/show?hotspot=$key" | jq -c '.' >> "$out"
  done < "$in_jsonl"
}

paginate_duplication_files() {
  local out="$1"
  : > "$out"
  p=1
  while true; do
    json="$(req "/api/measures/component_tree?component=$PROJECT&metricKeys=duplicated_lines,duplicated_blocks,duplicated_lines_density&qualifiers=FIL&ps=$PS&p=$p")"
    n="$(echo "$json" | jq '.components | length // 0')"
    echo "$json" | jq -c '.components[]? | select(.measures != null and (.measures | length) > 0)' >> "$out"
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
fetch_hotspot_details "$TMP/hotspots.jsonl" "$TMP/hotspot_details.jsonl"
paginate_duplication_files "$TMP/duplication_files.jsonl"

req "/api/measures/component?component=$PROJECT&metricKeys=bugs,vulnerabilities,code_smells,security_hotspots,ncloc,coverage,duplicated_lines,duplicated_blocks,duplicated_lines_density,reliability_rating,security_rating,sqale_rating" \
  > "$TMP/measures.json"

# ---- assemble WITHOUT arg explosion
jq -n \
  --slurpfile all "$TMP/issues_all.jsonl" \
  --slurpfile rel "$TMP/issues_reliability.jsonl" \
  --slurpfile sec "$TMP/issues_security.jsonl" \
  --slurpfile main "$TMP/issues_maintainability.jsonl" \
  --slurpfile new "$TMP/issues_new_code.jsonl" \
  --slurpfile hot "$TMP/hotspots.jsonl" \
  --slurpfile hotDetails "$TMP/hotspot_details.jsonl" \
  --slurpfile dupFiles "$TMP/duplication_files.jsonl" \
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
    hotspots: {
      total: ($hot | length),
      list: $hot,
      details: $hotDetails
    },
    duplication: {
      summary: ($measures[0].component.measures | map(select(.metric | startswith("duplicated_")))),
      files: $dupFiles
    }
  }' > "$OUT"

rm -rf "$TMP"
echo "Written $OUT"

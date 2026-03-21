#!/bin/bash
# freebuff-pty.sh - Run freebuff in PTY mode with input from file
# Usage: freebuff-pty.sh <input-file> <output-file> <project-dir>

INPUT_FILE="$1"
OUTPUT_FILE="$2"
PROJECT_DIR="$3"

script -q -c "freebuff --cwd \"$PROJECT_DIR\"" "$OUTPUT_FILE" < "$INPUT_FILE"
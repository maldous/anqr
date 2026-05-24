#!/usr/bin/env python3
"""
Upload a signed AAB to a Google Play Console track.

Usage:
  python3 tools/android/upload-to-play.py <track> [<aab_path>]

Tracks: internal | alpha | beta | production

Reads the service-account credentials from play-store-key.json at the repo
root. Bumps no version: assumes versionCode in the .aab is already incremented
past the current Play release on that track (Play rejects duplicates).
"""
import argparse
import json
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_AAB = REPO_ROOT / "android/app/build/outputs/bundle/release/app-release.aab"
PACKAGE_NAME = "link.anqr.app"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]


def main() -> int:
    parser = argparse.ArgumentParser(description="Upload AAB to Google Play")
    parser.add_argument("track", choices=["internal", "alpha", "beta", "production"])
    parser.add_argument("aab", nargs="?", default=str(DEFAULT_AAB))
    parser.add_argument(
        "--key",
        default=str(REPO_ROOT / "play-store-key.json"),
        help="Path to service-account JSON",
    )
    parser.add_argument(
        "--release-name",
        default=None,
        help="Human-readable release name (defaults to versionName from Play)",
    )
    parser.add_argument(
        "--notes",
        default="Bug fixes and improvements.",
        help="What's-new text, en-US default locale",
    )
    args = parser.parse_args()

    aab_path = Path(args.aab)
    if not aab_path.exists():
        print(f"AAB not found: {aab_path}", file=sys.stderr)
        return 1

    creds = service_account.Credentials.from_service_account_file(args.key, scopes=SCOPES)
    service = build("androidpublisher", "v3", credentials=creds)
    edits = service.edits()
    edit = edits.insert(packageName=PACKAGE_NAME, body={}).execute()
    edit_id = edit["id"]

    try:
        print(f"[upload] uploading {aab_path.name} ({aab_path.stat().st_size:,} bytes)…")
        media = MediaFileUpload(
            str(aab_path),
            mimetype="application/octet-stream",
            resumable=True,
        )
        bundle = edits.bundles().upload(
            packageName=PACKAGE_NAME, editId=edit_id, media_body=media
        ).execute()
        version_code = bundle["versionCode"]
        print(f"[upload] uploaded versionCode={version_code}")

        release = {
            "name": args.release_name or f"v{version_code}",
            "versionCodes": [str(version_code)],
            "status": "completed",
            "releaseNotes": [{"language": "en-US", "text": args.notes}],
        }
        edits.tracks().update(
            packageName=PACKAGE_NAME,
            editId=edit_id,
            track=args.track,
            body={"releases": [release]},
        ).execute()
        print(f"[upload] assigned to track={args.track}")

        commit = edits.commit(packageName=PACKAGE_NAME, editId=edit_id).execute()
        print(f"[upload] commit: id={commit.get('id')}")
        print(json.dumps(commit, indent=2))
        return 0
    except Exception:
        print("[upload] rolling back edit…", file=sys.stderr)
        try:
            edits.delete(packageName=PACKAGE_NAME, editId=edit_id).execute()
        except Exception:
            pass
        raise


if __name__ == "__main__":
    sys.exit(main())

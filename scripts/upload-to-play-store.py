#!/usr/bin/env python3
"""
Upload Android App Bundle to Google Play Store Internal Testing Track

Requirements:
    pip install google-api-python-client oauth2client

Setup:
    1. Go to Google Play Console > Setup > API access
    2. Create or link a Google Cloud project
    3. Create a service account with "Release manager" permissions
    4. Download the JSON key and save as play-store-key.json in project root
"""

import os
import sys
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from oauth2client.service_account import ServiceAccountCredentials

# Configuration
PACKAGE_NAME = 'link.anqr.app'
AAB_FILE = 'android/app/build/outputs/bundle/release/app-release.aab'
KEY_FILE = 'play-store-key.json'
TRACK = 'internal'  # Options: internal, alpha, beta, production

def main():
    # Check if AAB file exists
    if not os.path.exists(AAB_FILE):
        print(f"Error: AAB file not found at {AAB_FILE}")
        print("Run 'make android:release' first to build the AAB.")
        sys.exit(1)
    
    # Check if key file exists
    if not os.path.exists(KEY_FILE):
        print(f"Error: Service account key not found at {KEY_FILE}")
        print("\nTo set up API access:")
        print("1. Go to Google Play Console > Setup > API access")
        print("2. Create or link a Google Cloud project")
        print("3. Create a service account with 'Release manager' permissions")
        print("4. Download the JSON key and save as play-store-key.json")
        sys.exit(1)
    
    print(f"Uploading {AAB_FILE} to {TRACK} track...")
    
    # Authenticate
    credentials = ServiceAccountCredentials.from_json_keyfile_name(
        KEY_FILE,
        scopes=['https://www.googleapis.com/auth/androidpublisher']
    )
    
    # Build the API client
    service = build('androidpublisher', 'v3', credentials=credentials)
    
    try:
        # Create an edit
        edit_request = service.edits().insert(body={}, packageName=PACKAGE_NAME)
        edit = edit_request.execute()
        edit_id = edit['id']
        print(f"Created edit: {edit_id}")
        
        # Upload the AAB
        print("Uploading AAB file...")
        media = MediaFileUpload(AAB_FILE, mimetype='application/octet-stream')
        bundle_response = service.edits().bundles().upload(
            packageName=PACKAGE_NAME,
            editId=edit_id,
            media_body=media
        ).execute()
        
        version_code = bundle_response['versionCode']
        print(f"Uploaded bundle with version code: {version_code}")
        
        # Assign to track
        print(f"Assigning to {TRACK} track...")
        track_response = service.edits().tracks().update(
            packageName=PACKAGE_NAME,
            editId=edit_id,
            track=TRACK,
            body={
                'track': TRACK,
                'releases': [{
                    'versionCodes': [version_code],
                    'status': 'completed'
                }]
            }
        ).execute()
        
        print(f"Track {TRACK} updated")
        
        # Commit the edit
        print("Committing changes...")
        commit_response = service.edits().commit(
            packageName=PACKAGE_NAME,
            editId=edit_id
        ).execute()
        
        print(f"\n✅ Successfully uploaded version {version_code} to {TRACK} track!")
        print(f"View in Play Console: https://play.google.com/console/developers/app/{PACKAGE_NAME}/tracks/{TRACK}")
        
    except Exception as e:
        print(f"\n❌ Error uploading to Play Store: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()

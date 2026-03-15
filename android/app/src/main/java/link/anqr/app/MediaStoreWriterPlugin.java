package link.anqr.app;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(
  name = "MediaStoreWriter",
  permissions = {
    @Permission(
      alias = "storage",
      strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE }
    )
  }
)
public class MediaStoreWriterPlugin extends Plugin {
  private static final String MEDIASTORE_EXTERNAL_PRIMARY = "external_primary";

  @PluginMethod
  public void saveToDocuments(PluginCall call) {
    saveToDocumentsInternal(call, false);
  }

  @PermissionCallback
  private void storagePermissionCallback(PluginCall call) {
    saveToDocumentsInternal(call, true);
  }

  private void saveToDocumentsInternal(PluginCall call, boolean fromPermissionCallback) {
    String filename = call.getString("filename");
    String mimeType = call.getString("mimeType", "application/octet-stream");
    String data = call.getString("data");
    String subdir = call.getString("subdir", "ANQR");

    if (filename == null || filename.trim().isEmpty()) {
      call.reject("filename is required");
      return;
    }
    if (data == null || data.trim().isEmpty()) {
      call.reject("data is required (base64 or data URL)");
      return;
    }

    byte[] bytes;
    try {
      bytes = decodeBase64(data);
    } catch (Exception e) {
      call.reject("Failed to decode base64 data: " + e.getMessage());
      return;
    }

    try {
      JSObject result;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        result = saveViaMediaStore(filename, mimeType, bytes, subdir);
      } else {
        PermissionState storagePermission = getPermissionState("storage");
        if (storagePermission != PermissionState.GRANTED) {
          if (fromPermissionCallback) {
            call.reject("Storage permission denied");
            return;
          }
          requestPermissionForAlias("storage", call, "storagePermissionCallback");
          return;
        }
        result = saveLegacy(filename, bytes, subdir);
      }
      call.resolve(result);
    } catch (Exception e) {
      call.reject("Failed to write file: " + e.getMessage(), e);
    }
  }

  private JSObject saveViaMediaStore(String filename, String mimeType, byte[] bytes, String subdir) throws Exception {
    ContentResolver resolver = getContext().getContentResolver();

    ContentValues values = new ContentValues();
    values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
    values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOCUMENTS + File.separator + subdir);
    values.put(MediaStore.MediaColumns.IS_PENDING, 1);

    Uri collection = MediaStore.Files.getContentUri(MEDIASTORE_EXTERNAL_PRIMARY);
    Uri item = resolver.insert(collection, values);
    if (item == null) {
      throw new IllegalStateException("MediaStore insert returned null");
    }

    OutputStream os = resolver.openOutputStream(item);
    if (os == null) {
      throw new IllegalStateException("Failed to open output stream");
    }
    try {
      os.write(bytes);
      os.flush();
    } finally {
      os.close();
    }

    ContentValues done = new ContentValues();
    done.put(MediaStore.MediaColumns.IS_PENDING, 0);
    resolver.update(item, done, null, null);

    JSObject result = new JSObject();
    result.put("uri", item.toString());
    result.put("displayName", filename);
    return result;
  }

  private JSObject saveLegacy(String filename, byte[] bytes, String subdir) throws Exception {
    File docs = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
    File dir = new File(docs, subdir);
    if (!dir.exists() && !dir.mkdirs()) {
      throw new IllegalStateException("Failed to create directory: " + dir.getAbsolutePath());
    }

    File out = new File(dir, filename);
    FileOutputStream fos = new FileOutputStream(out);
    try {
      fos.write(bytes);
      fos.flush();
    } finally {
      fos.close();
    }

    JSObject result = new JSObject();
    result.put("path", out.getAbsolutePath());
    result.put("displayName", filename);
    return result;
  }

  private static byte[] decodeBase64(String input) {
    String payload = input;
    int comma = input.indexOf(',');
    if (input.startsWith("data:") && comma >= 0) {
      payload = input.substring(comma + 1);
    }
    return Base64.decode(payload, Base64.DEFAULT);
  }
}

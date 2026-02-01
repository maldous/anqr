package link.anqr.app;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.util.Log;
import android.view.Window;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

import io.sentry.Sentry;
import io.sentry.android.core.SentryAndroid;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

public class MainActivity extends BridgeActivity {

  private static boolean activityCallbacksRegistered = false;
  private static boolean cmpInitialized = false;
  private static boolean sentryInitialized = false;

  private static final String TAG = "ANQR";
  
  // Sentry DSN for native Android crash reporting
  private static final String SENTRY_DSN = "https://e21ce35eef457e8b07408316ee9cb262@o4510808522489856.ingest.us.sentry.io/4510808544247808";
  
  // iubenda CMP configuration
  private static final String IUBENDA_WIDGET_ID = "28e23ca9-eb78-41ab-ac5e-46b90c7791c7";
  private static final String IUBENDA_DOMAIN = "cdn.iubenda.com";
  private static final String APP_NAME = "ANQR";
  
  // Languages supported by both ANQR and iubenda CMP
  // iubenda supports: BG, CS, DA, DE, EL, EN, ES, ET, FI, FR, HR, HU, IT, JA, LT, LV, NL, NO, PL, PT, RO, RU, SK, SL, SV, ZH
  private static final Set<String> IUBENDA_SUPPORTED_LANGUAGES = new HashSet<>(Arrays.asList(
      "BG", "CS", "DA", "DE", "EL", "EN", "ES", "ET", "FI", "FR", "HR", "HU", 
      "IT", "JA", "LT", "LV", "NL", "NO", "PL", "PT", "RO", "RU", "SK", "SL", "SV", "ZH"
  ));

  @Override
  public void onCreate(Bundle savedInstanceState) {
    // Use Log.e instead of Log.d because ProGuard strips debug logs in release builds
    Log.e(TAG, "MainActivity.onCreate starting");
    
    // Register local Capacitor plugins BEFORE super.onCreate()
    // This is required for Capacitor to properly initialize the plugin
    registerPlugin(MediaStoreWriterPlugin.class);
    Log.e(TAG, "MediaStoreWriterPlugin registered");
    
    super.onCreate(savedInstanceState);
    Log.e(TAG, "Capacitor bridge initialized");
    
    // Initialize Sentry for crash reporting (must be before other initializations)
    initializeSentry();
    
    // Initialize iubenda CMP SDK for consent management
    initializeConsentManager();
    
    // Enable WebView debugging to see console.log in logcat (even in release builds)
    // This helps diagnose AdMob and other JavaScript issues
    try {
      WebView.setWebContentsDebuggingEnabled(true);
      Log.e(TAG, "WebView debugging enabled");
    } catch (Exception e) {
      Log.e(TAG, "Failed to enable WebView debugging", e);
    }

    // Ensure AdMob's AdActivity has sane insets handling so the close button
    // is visible/clickable on newer Android versions.
    if (!activityCallbacksRegistered) {
      activityCallbacksRegistered = true;
      getApplication().registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
        @Override
        public void onActivityCreated(Activity activity, Bundle bundle) {
          if (!"com.google.android.gms.ads.AdActivity".equals(activity.getClass().getName())) {
            return;
          }
          Window window = activity.getWindow();
          if (window != null) {
            WindowCompat.setDecorFitsSystemWindows(window, true);
          }
        }

        @Override public void onActivityStarted(Activity activity) {}
        @Override public void onActivityResumed(Activity activity) {}
        @Override public void onActivityPaused(Activity activity) {}
        @Override public void onActivityStopped(Activity activity) {}
        @Override public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}
        @Override public void onActivityDestroyed(Activity activity) {}
      });
    }
  }
  
  /**
   * Initialize Sentry for native Android crash reporting and error tracking
   * This captures native crashes that occur outside the WebView
   */
  private void initializeSentry() {
    if (sentryInitialized) {
      Log.e(TAG, "Sentry already initialized, skipping");
      return;
    }
    
    try {
      Log.e(TAG, "Initializing Sentry SDK");
      
      SentryAndroid.init(this, options -> {
        options.setDsn(SENTRY_DSN);
        options.setSendDefaultPii(true);
        // Set sample rates for performance monitoring
        options.setTracesSampleRate(0.1); // 10% of transactions
        // Set app name for easier identification in Sentry dashboard
        options.setRelease("link.anqr.app@" + BuildConfig.VERSION_NAME);
        options.setEnvironment(BuildConfig.DEBUG ? "development" : "production");
      });
      
      // Add breadcrumb to indicate successful initialization
      Sentry.addBreadcrumb("Sentry SDK initialized successfully");
      
      sentryInitialized = true;
      Log.e(TAG, "Sentry SDK initialized successfully");
      
    } catch (Exception e) {
      Log.e(TAG, "Failed to initialize Sentry SDK", e);
    }
  }
  
  /**
   * Get the device language code in uppercase (e.g., "EN", "DE", "ES")
   * Falls back to English if the device language is not supported by iubenda
   */
  private String getConsentLanguage() {
    String deviceLanguage = Locale.getDefault().getLanguage().toUpperCase(Locale.ROOT);
    
    // Check if the device language is supported by iubenda
    if (IUBENDA_SUPPORTED_LANGUAGES.contains(deviceLanguage)) {
      Log.e(TAG, "Using device language for CMP: " + deviceLanguage);
      return deviceLanguage;
    }
    
    // Fall back to English for unsupported languages
    Log.e(TAG, "Device language " + deviceLanguage + " not supported by iubenda, falling back to EN");
    return "EN";
  }
  
  /**
   * Initialize the iubenda CMP SDK for GDPR/CCPA consent management
   * This will automatically show the consent banner if consent hasn't been collected
   * 
   * Note: The SDK initialization uses reflection to handle API differences between versions.
   * The iubenda CMP SDK (consentmanager) is added via build.gradle dependency.
   */
  private void initializeConsentManager() {
    if (cmpInitialized) {
      Log.e(TAG, "CMP already initialized, skipping");
      return;
    }
    
    try {
      Log.e(TAG, "Initializing iubenda CMP SDK");
      
      // Get the appropriate language for the consent banner
      String language = getConsentLanguage();
      
      // Use reflection to initialize CMP SDK to handle API version differences
      // This allows the app to compile even if the SDK classes aren't available at compile time
      Class<?> urlConfigClass = Class.forName("net.consentmanager.cm_sdk_android_v3.UrlConfig");
      Class<?> uiConfigClass = Class.forName("net.consentmanager.cm_sdk_android_v3.ConsentLayerUIConfig");
      Class<?> cmpManagerClass = Class.forName("net.consentmanager.cm_sdk_android_v3.CMPManager");
      
      // Create UrlConfig - try 4-param constructor first, then 6-param if that fails
      Object urlConfig;
      try {
        // Try 4-parameter constructor: (id, domain, language, appName)
        java.lang.reflect.Constructor<?> urlConfigCtor = urlConfigClass.getConstructor(
            String.class, String.class, String.class, String.class
        );
        urlConfig = urlConfigCtor.newInstance(IUBENDA_WIDGET_ID, IUBENDA_DOMAIN, language, APP_NAME);
      } catch (NoSuchMethodException e) {
        // Try 6-parameter constructor: (id, domain, language, appName, extra, flag)
        java.lang.reflect.Constructor<?> urlConfigCtor = urlConfigClass.getConstructor(
            String.class, String.class, String.class, String.class, String.class, boolean.class
        );
        urlConfig = urlConfigCtor.newInstance(IUBENDA_WIDGET_ID, IUBENDA_DOMAIN, language, APP_NAME, "", true);
      }
      
      // Create ConsentLayerUIConfig with default constructor
      Object uiConfig = uiConfigClass.getDeclaredConstructor().newInstance();
      
      // Get CMPManager instance - try different getInstance signatures
      Object cmpManager;
      try {
        // Try getInstance(context, urlConfig, uiConfig, delegate)
        java.lang.reflect.Method getInstanceMethod = cmpManagerClass.getMethod(
            "getInstance", android.content.Context.class, urlConfigClass, uiConfigClass, 
            Class.forName("net.consentmanager.cm_sdk_android_v3.CMPManagerDelegate")
        );
        cmpManager = getInstanceMethod.invoke(null, this, urlConfig, uiConfig, null);
      } catch (NoSuchMethodException e) {
        // Try getInstance(context)
        java.lang.reflect.Method getInstanceMethod = cmpManagerClass.getMethod(
            "getInstance", android.content.Context.class
        );
        cmpManager = getInstanceMethod.invoke(null, this);
        
        // Set configuration via setters if available
        try {
          cmpManagerClass.getMethod("setUrlConfig", urlConfigClass).invoke(cmpManager, urlConfig);
          cmpManagerClass.getMethod("setConsentLayerUIConfig", uiConfigClass).invoke(cmpManager, uiConfig);
        } catch (NoSuchMethodException ignored) {
          // Setters not available, configuration may have been set via getInstance
        }
      }
      
      // Set activity
      try {
        cmpManagerClass.getMethod("setActivity", android.app.Activity.class).invoke(cmpManager, this);
      } catch (NoSuchMethodException ignored) {
        // setActivity not available in this version
      }
      
      // Call checkAndOpen to show consent if needed
      try {
        // Try checkAndOpen(boolean, callback) first
        cmpManagerClass.getMethod("checkAndOpen", boolean.class, Object.class)
            .invoke(cmpManager, false, null);
      } catch (NoSuchMethodException e) {
        try {
          // Try checkAndOpen(context, callback)
          cmpManagerClass.getMethod("checkAndOpen", android.content.Context.class, Object.class)
              .invoke(cmpManager, this, null);
        } catch (NoSuchMethodException e2) {
          // Try checkAndOpen() with no params
          cmpManagerClass.getMethod("checkAndOpen").invoke(cmpManager);
        }
      }
      
      cmpInitialized = true;
      Log.e(TAG, "iubenda CMP SDK initialized successfully with language: " + language);
      
    } catch (ClassNotFoundException e) {
      Log.e(TAG, "iubenda CMP SDK not found - consent management disabled", e);
    } catch (Exception e) {
      Log.e(TAG, "Failed to initialize iubenda CMP SDK", e);
    }
  }
}

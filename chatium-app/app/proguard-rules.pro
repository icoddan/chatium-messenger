# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep ChatiumBridge
-keep class com.chatium.messenger.MainActivity$Companion { *; }
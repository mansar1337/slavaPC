package ru.kumanpc.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.res.AssetManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Куманцов ПК .ru — нативная оболочка.
 * Интерфейс приложения — локальные ассеты, отдаваемые через виртуальный
 * https-хост app.kumanpc.ru (без внешних зависимостей и без AndroidX).
 */
public class MainActivity extends Activity {

    private static final String HOST = "kumanpc.ru";
    private static final String BASE = "https://" + HOST + "/index.html";

    private WebView web;

    private static final Map<String, String> MIME = new HashMap<String, String>();
    static {
        MIME.put("html", "text/html");
        MIME.put("css", "text/css");
        MIME.put("js", "application/javascript");
        MIME.put("json", "application/json");
        MIME.put("png", "image/png");
        MIME.put("jpg", "image/jpeg");
        MIME.put("svg", "image/svg+xml");
        MIME.put("woff2", "font/woff2");
        MIME.put("ico", "image/x-icon");
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);

        Window w = getWindow();
        w.setBackgroundDrawableResource(R.color.bg);
        try {
            w.setStatusBarColor(Color.parseColor("#07080d"));
            if (Build.VERSION.SDK_INT >= 21) {
                w.getDecorView().setSystemUiVisibility(0);
            }
        } catch (Throwable ignored) { }

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#07080d"));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadsImagesAutomatically(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowContentAccess(false);
        s.setAllowFileAccess(false);
        s.setAllowFileAccessFromFileURLs(false);
        s.setAllowUniversalAccessFromFileURLs(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        if (Build.VERSION.SDK_INT >= 21) {
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }
        if (Build.VERSION.SDK_INT >= 26) {
            s.setSafeBrowsingEnabled(false);
        }
        web.setVerticalScrollBarEnabled(false);
        web.setHorizontalScrollBarEnabled(false);

        web.setWebViewClient(new LocalAssets());
        web.addJavascriptInterface(new Host(), "AndroidHost");

        if (saved != null) {
            web.restoreState(saved);
        } else {
            web.loadUrl(BASE);
        }
    }

    /* ---------------- ассеты вместо сети ---------------- */
    private class LocalAssets extends WebViewClient {

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (u == null || HOST == null || !HOST.equals(u.getHost())) {
                return notFound();
            }
            String path = u.getPath();
            if (path == null || path.equals("/") || path.equals("")) path = "/index.html";
            if (path.contains("..")) return notFound();
            try {
                byte[] data = readAsset(path.substring(1));
                if (data == null) return notFound();

                String mime = mimeOf(path);
                // charset задаём ТОЛЬКО для текста: с кодировкой у бинарных
                // ответов часть версий WebView ломает декодирование картинок
                String enc = isText(mime) ? "utf-8" : null;

                WebResourceResponse r = new WebResourceResponse(mime, enc,
                        new ByteArrayInputStream(data));
                r.setStatusCodeAndReasonPhrase(200, "OK");

                Map<String, String> h = new HashMap<String, String>();
                h.put("Cache-Control", "no-cache, no-store, must-revalidate");
                h.put("Content-Type", enc == null ? mime : mime + "; charset=" + enc);
                r.setResponseHeaders(h);
                return r;
            } catch (Throwable t) {
                return notFound();
            }
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri u = req.getUrl();
            if (u == null) return true;
            if (HOST.equals(u.getHost())) return false;   // внутренняя навигация
            openExternal(u.toString());
            return true;
        }

        @Deprecated
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            Uri u = Uri.parse(url);
            if (HOST.equals(u.getHost())) return false;
            openExternal(url);
            return true;
        }
    }

    private WebResourceResponse notFound() {
        WebResourceResponse r = new WebResourceResponse("text/plain", "utf-8",
                new ByteArrayInputStream("404".getBytes()));
        try { r.setStatusCodeAndReasonPhrase(404, "Not Found"); } catch (Throwable ignored) { }
        return r;
    }

    private static boolean isText(String mime) {
        return mime.startsWith("text/")
                || mime.equals("application/javascript")
                || mime.equals("application/json")
                || mime.equals("image/svg+xml");
    }

    private static String mimeOf(String path) {
        int dot = path.lastIndexOf('.');
        if (dot < 0) return "application/octet-stream";
        String ext = path.substring(dot + 1).toLowerCase();
        String m = MIME.get(ext);
        return m == null ? "application/octet-stream" : m;
    }

    private byte[] readAsset(String name) throws IOException {
        AssetManager am = getAssets();
        InputStream in = am.open(name);
        try {
            int len = 0, size = 32 * 1024;
            byte[] buf = new byte[size];
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            while ((len = in.read(buf, 0, size)) > 0) out.write(buf, 0, len);
            return out.toByteArray();
        } finally {
            try { in.close(); } catch (IOException ignored) { }
        }
    }

    private void toast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
    }

    /* ---------------- внешние приложения ---------------- */
    private void openExternal(String url) {
        Uri u = Uri.parse(url);
        String sch = u.getScheme();
        if (sch == null) return;

        Intent i;
        if ("tel".equals(sch)) {
            i = new Intent(Intent.ACTION_DIAL, u);
        } else if ("mailto".equals(sch)) {
            i = new Intent(Intent.ACTION_SENDTO, u);
        } else if (sch.startsWith("tg") || sch.startsWith("intent")) {
            i = new Intent(Intent.ACTION_VIEW, u);
        } else {
            i = new Intent(Intent.ACTION_VIEW, u);
        }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(i);
        } catch (Throwable t) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://kumanpc.ru"))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (Throwable t2) {
                toast("Не найдено приложение для этого действия");
            }
        }
    }

    /* ---------------- мост для веб-части ---------------- */
    public class Host {

        @JavascriptInterface
        public void vibrate(final int ms) {
            runOnUiThread(new Runnable() {
                public void run() {
                    try {
                        Vibrator v = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                        if (v == null || !v.hasVibrator()) return;
                        if (Build.VERSION.SDK_INT >= 26) {
                            v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                        } else {
                            v.vibrate(ms);
                        }
                    } catch (Throwable ignored) { }
                }
            });
        }

        @JavascriptInterface
        public void toast(final String msg) {
            runOnUiThread(new Runnable() {
                public void run() {
                    Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void share(final String text) {
            runOnUiThread(new Runnable() {
                public void run() {
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("text/plain");
                    i.putExtra(Intent.EXTRA_TEXT, text);
                    i.putExtra(Intent.EXTRA_SUBJECT, "Заявка с приложения " + getString(R.string.app_name));
                    startActivity(Intent.createChooser(i, getString(R.string.app_name)));
                }
            });
        }

        @JavascriptInterface
        public void call(final String number) {
            runOnUiThread(new Runnable() {
                public void run() { openExternal("tel:" + number); }
            });
        }

        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(new Runnable() {
                public void run() { finish(); }
            });
        }
    }

    /* ---------------- жизненный цикл ---------------- */
    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        if (web != null) web.saveState(out);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        if (web.canGoBack()) { web.goBack(); return; }
        web.evaluateJavascript("location.hash", new ValueCallback<String>() {
            public void onReceiveValue(String value) {
                String h = value == null ? "" : value.replace("\"", "");
                if (h.equals("") || h.equals("#/home")) {
                    finish();
                } else {
                    web.loadUrl(BASE + "#/home");
                }
            }
        });
    }

    @Override
    protected void onPause() {
        if (web != null) web.onPause();
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.loadUrl("about:blank");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
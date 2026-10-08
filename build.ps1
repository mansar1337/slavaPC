<#
  Сборка APK «Куманцов ПК .ru» — без Android Studio и Gradle.
  Нужны: aapt2, javac, d8, zipalign, apksigner (Android SDK build-tools) + JDK 17.

  Запуск:
    powershell -ExecutionPolicy Bypass -File .\build.ps1
#>
param(
  [string]$Toolchain  = "C:\Users\Mother Hacker\AppData\Local\Temp\opencode\build\toolchain",
  [string]$BuildTools = "34.0.0",
  [string]$Platform   = "android-34",
  [int]$MinSdk        = 26,
  [int]$TargetSdk     = 34,
  [string]$VersionCode = "1",
  [string]$VersionName = "1.0.0"
)

$ErrorActionPreference = 'Continue'
$ProgressPreference    = 'SilentlyContinue'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

function Step($m) { Write-Host "== $m" -ForegroundColor Cyan }
function Ok($m)   { Write-Host "   ok: $m" -ForegroundColor Green }
function Die($m)  { Write-Host "   FAIL: $m" -ForegroundColor Red; exit 1 }

function Run($exe, [string[]]$argv, [string]$what) {
  & $exe @argv 2>&1 | ForEach-Object { if ($_ -is [string]) { Write-Host "      $_" } }
  if ($LASTEXITCODE -ne 0) { Die "$what (код $LASTEXITCODE)" }
}

$Root    = $PSScriptRoot
$SrcApp  = Join-Path $Root "app\src\main"
$Dist    = Join-Path $Root "dist"

# aapt2 не понимает кириллицу в путях -> собираем во временной ASCII-папке
$Stage   = Join-Path $env:LOCALAPPDATA "Temp\kumanpc-build"
$App     = Join-Path $Stage "app"
$Build   = Join-Path $Stage "build"

$Jdk        = Join-Path $Toolchain "jdk"
$Bt         = Join-Path $Toolchain "sdk\build-tools\$BuildTools"
$AndroidJar = Join-Path $Toolchain "sdk\platforms\$Platform\android.jar"

foreach ($p in @($Jdk, $Bt, $AndroidJar, $SrcApp)) { if (-not (Test-Path $p)) { Die "not found: $p" } }

$aapt2     = Join-Path $Bt "aapt2.exe"
$zipalign  = Join-Path $Bt "zipalign.exe"
$apksigner = Join-Path $Bt "apksigner.bat"
$d8        = Join-Path $Bt "d8.bat"
$keytool   = Join-Path $Jdk "bin\keytool.exe"
$javac     = Join-Path $Jdk "bin\javac.exe"
$jar       = Join-Path $Jdk "bin\jar.exe"

$env:JAVA_HOME = $Jdk
$env:PATH      = "$Jdk\bin;$Bt;$env:PATH"

Step "prepare"
Remove-Item $Stage -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "$Build\gen", "$Build\classes", "$Build\dex", $Dist | Out-Null
Copy-Item $SrcApp $App -Recurse -Force
Ok "sources -> $Stage"

Step "1/5 aapt2 compile"
Run $aapt2 @("compile", "--dir", (Join-Path $App "res"), "-o", "$Build\res.zip") "aapt2 compile"
Ok "res.zip"

Step "2/5 aapt2 link"
Run $aapt2 @(
  "link",
  "-o", "$Build\base.apk",
  "-I", $AndroidJar,
  "--manifest", (Join-Path $App "AndroidManifest.xml"),
  "--java", "$Build\gen",
  "--min-sdk-version", "$MinSdk",
  "--target-sdk-version", "$TargetSdk",
  "--version-code", $VersionCode,
  "--version-name", $VersionName,
  "--auto-add-overlay",
  "$Build\res.zip"
) "aapt2 link"
Ok "base.apk"

Step "3/5 javac"
$sources = @()
$sources += (Get-ChildItem -Recurse (Join-Path $App "java") -Filter *.java | ForEach-Object { $_.FullName })
$sources += (Get-ChildItem -Recurse "$Build\gen"   -Filter *.java | ForEach-Object { $_.FullName })
Run $javac (@("-encoding", "UTF-8", "--release", "11", "-nowarn", "-Xlint:none",
              "-classpath", $AndroidJar, "-d", "$Build\classes") + $sources) "javac"
Ok "$($sources.Count) java files"

Step "4/5 d8 + zipalign"
$classes = @(Get-ChildItem -Recurse "$Build\classes" -Filter *.class | ForEach-Object { $_.FullName })
Run $d8 (@("--lib", $AndroidJar, "--min-api", "$MinSdk", "--output", "$Build\dex") + $classes) "d8"
Ok "classes.dex"
# assets добавляем через jar: на Windows aapt2 -A кладёт пути с обратным слэшем,
# а AssetManager требует прямые слэши ("assets/js/app.js")
Run $jar @("uf", "$Build\base.apk", "-C", "$Build\dex", "classes.dex", "-C", $App, "assets") "jar"
Run $zipalign @("-f", "-p", "4", "$Build\base.apk", "$Build\aligned.apk") "zipalign"
Ok "aligned.apk"

Step "5/5 apksigner"
$ksDir  = Join-Path $env:LOCALAPPDATA "Temp\kumanpc-keystore"
$ks     = Join-Path $ksDir "kumanpc.keystore"
$ksPass = "kumanpc2024"
New-Item -ItemType Directory -Force -Path $ksDir | Out-Null
if (-not (Test-Path $ks)) {
  Run $keytool @("-genkeypair","-keystore",$ks,"-alias","kumanpc","-keyalg","RSA","-keysize","2048",
                 "-validity","10950","-storepass",$ksPass,"-keypass",$ksPass,
                 "-dname","CN=Kumanpc, OU=Mobile, O=Kumanpc PC, L=Moscow, ST=Moscow, C=RU") "keytool"
  Ok "keystore created"
}
$outApk = Join-Path $Dist "Kumanpc-ru-$VersionName.apk"
Remove-Item $outApk -Force -ErrorAction SilentlyContinue
Run $apksigner @("sign","--ks",$ks,"--ks-pass","pass:$ksPass","--key-pass","pass:$ksPass",
                 "--ks-key-alias","kumanpc",
                 "--v1-signing-enabled","true","--v2-signing-enabled","true","--v3-signing-enabled","true",
                 "--out",$outApk,"$Build\aligned.apk") "apksigner sign"
Run $apksigner @("verify","--verbose",$outApk) "apksigner verify"

$size = [math]::Round((Get-Item $outApk).Length / 1MB, 2)
Write-Host ""
Write-Host "  BUILD OK" -ForegroundColor Green
Write-Host "  $outApk ($size MB)" -ForegroundColor Green
Write-Host ""
exit 0
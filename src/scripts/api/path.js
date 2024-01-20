// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-v2/tooling/api/src/path.ts
var BaseDirectory = /* @__PURE__ */ ((BaseDirectory2) => {
  BaseDirectory2[BaseDirectory2["Audio"] = 1] = "Audio";
  BaseDirectory2[BaseDirectory2["Cache"] = 2] = "Cache";
  BaseDirectory2[BaseDirectory2["Config"] = 3] = "Config";
  BaseDirectory2[BaseDirectory2["Data"] = 4] = "Data";
  BaseDirectory2[BaseDirectory2["LocalData"] = 5] = "LocalData";
  BaseDirectory2[BaseDirectory2["Document"] = 6] = "Document";
  BaseDirectory2[BaseDirectory2["Download"] = 7] = "Download";
  BaseDirectory2[BaseDirectory2["Picture"] = 8] = "Picture";
  BaseDirectory2[BaseDirectory2["Public"] = 9] = "Public";
  BaseDirectory2[BaseDirectory2["Video"] = 10] = "Video";
  BaseDirectory2[BaseDirectory2["Resource"] = 11] = "Resource";
  BaseDirectory2[BaseDirectory2["Temp"] = 12] = "Temp";
  BaseDirectory2[BaseDirectory2["AppConfig"] = 13] = "AppConfig";
  BaseDirectory2[BaseDirectory2["AppData"] = 14] = "AppData";
  BaseDirectory2[BaseDirectory2["AppLocalData"] = 15] = "AppLocalData";
  BaseDirectory2[BaseDirectory2["AppCache"] = 16] = "AppCache";
  BaseDirectory2[BaseDirectory2["AppLog"] = 17] = "AppLog";
  BaseDirectory2[BaseDirectory2["Desktop"] = 18] = "Desktop";
  BaseDirectory2[BaseDirectory2["Executable"] = 19] = "Executable";
  BaseDirectory2[BaseDirectory2["Font"] = 20] = "Font";
  BaseDirectory2[BaseDirectory2["Home"] = 21] = "Home";
  BaseDirectory2[BaseDirectory2["Runtime"] = 22] = "Runtime";
  BaseDirectory2[BaseDirectory2["Template"] = 23] = "Template";
  return BaseDirectory2;
})(BaseDirectory || {});
async function appConfigDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 13 /* AppConfig */
  });
}
async function appDataDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 14 /* AppData */
  });
}
async function appLocalDataDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 15 /* AppLocalData */
  });
}
async function appCacheDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 16 /* AppCache */
  });
}
async function audioDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 1 /* Audio */
  });
}
async function cacheDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 2 /* Cache */
  });
}
async function configDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 3 /* Config */
  });
}
async function dataDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 4 /* Data */
  });
}
async function desktopDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 18 /* Desktop */
  });
}
async function documentDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 6 /* Document */
  });
}
async function downloadDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 7 /* Download */
  });
}
async function executableDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 19 /* Executable */
  });
}
async function fontDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 20 /* Font */
  });
}
async function homeDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 21 /* Home */
  });
}
async function localDataDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 5 /* LocalData */
  });
}
async function pictureDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 8 /* Picture */
  });
}
async function publicDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 9 /* Public */
  });
}
async function resourceDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 11 /* Resource */
  });
}
async function resolveResource(resourcePath) {
  return invoke("plugin:path|resolve_directory", {
    directory: 11 /* Resource */,
    path: resourcePath
  });
}
async function runtimeDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 22 /* Runtime */
  });
}
async function templateDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 23 /* Template */
  });
}
async function videoDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 10 /* Video */
  });
}
async function appLogDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 17 /* AppLog */
  });
}
async function tempDir() {
  return invoke("plugin:path|resolve_directory", {
    directory: 12 /* Temp */
  });
}
function sep() {
  return window.__TAURI_INTERNALS__.plugins.path.sep;
}
function delimiter() {
  return window.__TAURI_INTERNALS__.plugins.path.delimiter;
}
async function resolve(...paths) {
  return invoke("plugin:path|resolve", { paths });
}
async function normalize(path) {
  return invoke("plugin:path|normalize", { path });
}
async function join(...paths) {
  return invoke("plugin:path|join", { paths });
}
async function dirname(path) {
  return invoke("plugin:path|dirname", { path });
}
async function extname(path) {
  return invoke("plugin:path|extname", { path });
}
async function basename(path, ext) {
  return invoke("plugin:path|basename", { path, ext });
}
async function isAbsolute(path) {
  return invoke("plugin:path|isAbsolute", { path });
}
export {
  BaseDirectory,
  appCacheDir,
  appConfigDir,
  appDataDir,
  appLocalDataDir,
  appLogDir,
  audioDir,
  basename,
  cacheDir,
  configDir,
  dataDir,
  delimiter,
  desktopDir,
  dirname,
  documentDir,
  downloadDir,
  executableDir,
  extname,
  fontDir,
  homeDir,
  isAbsolute,
  join,
  localDataDir,
  normalize,
  pictureDir,
  publicDir,
  resolve,
  resolveResource,
  resourceDir,
  runtimeDir,
  sep,
  tempDir,
  templateDir,
  videoDir
};

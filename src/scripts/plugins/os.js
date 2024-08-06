// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/os/guest-js/index.ts
function eol() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.eol;
}
function platform() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.platform;
}
function version() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.version;
}
function family() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.family;
}
function type() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.os_type;
}
function arch() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.arch;
}
function exeExtension() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.exe_extension;
}
async function locale() {
  return await invoke("plugin:os|locale");
}
async function hostname() {
  return await invoke("plugin:os|hostname");
}
export {
  arch,
  eol,
  exeExtension,
  family,
  hostname,
  locale,
  platform,
  type,
  version
};

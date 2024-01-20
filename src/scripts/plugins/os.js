// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/os/guest-js/index.ts
function eol() {
  return window.__TAURI_OS_PLUGIN_INTERNALS__.eol;
}
async function platform() {
  return invoke("plugin:os|platform");
}
async function version() {
  return invoke("plugin:os|version");
}
async function family() {
  return invoke("plugin:os|family");
}
async function type() {
  return invoke("plugin:os|os_type");
}
async function arch() {
  return invoke("plugin:os|arch");
}
async function locale() {
  return invoke("plugin:os|locale");
}
async function exeExtension() {
  return invoke("plugin:os|exe_extension");
}
async function hostname() {
  return invoke("plugin:os|hostname");
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

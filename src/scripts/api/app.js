// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-v2/tooling/api/src/app.ts
async function getVersion() {
  return invoke("plugin:app|version");
}
async function getName() {
  return invoke("plugin:app|name");
}
async function getTauriVersion() {
  return invoke("plugin:app|tauri_version");
}
async function show() {
  return invoke("plugin:app|app_show");
}
async function hide() {
  return invoke("plugin:app|app_hide");
}
export {
  getName,
  getTauriVersion,
  getVersion,
  hide,
  show
};

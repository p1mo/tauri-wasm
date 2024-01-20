// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/autostart/guest-js/index.ts
async function isEnabled() {
  return await invoke("plugin:autostart|is_enabled");
}
async function enable() {
  await invoke("plugin:autostart|enable");
}
async function disable() {
  await invoke("plugin:autostart|disable");
}
export {
  disable,
  enable,
  isEnabled
};

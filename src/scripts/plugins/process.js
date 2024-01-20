// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/process/guest-js/index.ts
async function exit(code = 0) {
  return invoke("plugin:process|exit", { code });
}
async function relaunch() {
  return invoke("plugin:process|restart");
}
export {
  exit,
  relaunch
};

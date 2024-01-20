// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/cli/guest-js/index.ts
async function getMatches() {
  return await invoke("plugin:cli|cli_matches");
}
export {
  getMatches
};

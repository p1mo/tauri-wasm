// tauri-v2/tooling/api/src/core.ts
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/clipboard-manager/guest-js/index.ts
async function writeText(text, opts) {
  return invoke("plugin:clipboard|write", {
    data: {
      plainText: {
        label: opts?.label,
        text
      }
    }
  });
}
async function readText() {
  const kind = await invoke("plugin:clipboard|read");
  return kind.plainText.text;
}
export {
  readText,
  writeText
};

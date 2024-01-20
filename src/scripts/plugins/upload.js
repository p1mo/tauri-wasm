// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  id;
  // @ts-expect-error field used by the IPC serializer
  __TAURI_CHANNEL_MARKER__ = true;
  #onmessage = () => {
  };
  constructor() {
    this.id = transformCallback((response) => {
      this.#onmessage(response);
    });
  }
  set onmessage(handler) {
    this.#onmessage = handler;
  }
  get onmessage() {
    return this.#onmessage;
  }
  toJSON() {
    return `__CHANNEL__:${this.id}`;
  }
};
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/upload/guest-js/index.ts
async function upload(url, filePath, progressHandler, headers) {
  const ids = new Uint32Array(1);
  window.crypto.getRandomValues(ids);
  const id = ids[0];
  const onProgress = new Channel();
  if (progressHandler != null) {
    onProgress.onmessage = progressHandler;
  }
  await invoke("plugin:upload|upload", {
    id,
    url,
    filePath,
    headers: headers ?? {},
    onProgress
  });
}
async function download(url, filePath, progressHandler, headers) {
  const ids = new Uint32Array(1);
  window.crypto.getRandomValues(ids);
  const id = ids[0];
  const onProgress = new Channel();
  if (progressHandler != null) {
    onProgress.onmessage = progressHandler;
  }
  await invoke("plugin:upload|download", {
    id,
    url,
    filePath,
    headers: headers ?? {},
    onProgress
  });
}
export {
  download,
  upload
};

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
  #nextMessageId = 0;
  #pendingMessages = {};
  constructor() {
    this.id = transformCallback(
      ({ message, id }) => {
        if (id === this.#nextMessageId) {
          this.#nextMessageId = id + 1;
          this.#onmessage(message);
          const pendingMessageIds = Object.keys(this.#pendingMessages);
          if (pendingMessageIds.length > 0) {
            let nextId = id + 1;
            for (const pendingId of pendingMessageIds.sort()) {
              if (parseInt(pendingId) === nextId) {
                const message2 = this.#pendingMessages[pendingId];
                delete this.#pendingMessages[pendingId];
                this.#onmessage(message2);
                nextId += 1;
              } else {
                break;
              }
            }
            this.#nextMessageId = nextId;
          }
        } else {
          this.#pendingMessages[id.toString()] = message;
        }
      }
    );
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
  if (progressHandler) {
    onProgress.onmessage = progressHandler;
  }
  return await invoke("plugin:upload|upload", {
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
  if (progressHandler) {
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

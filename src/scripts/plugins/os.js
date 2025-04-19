// tauri-v2/packages/api/src/core.ts
var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  /** The callback id returned from {@linkcode transformCallback} */
  id;
  #onmessage;
  // the index is used as a mechanism to preserve message order
  #nextMessageIndex = 0;
  #pendingMessages = [];
  #messageEndIndex;
  constructor(onmessage) {
    this.#onmessage = onmessage || (() => {
    });
    this.id = transformCallback((rawMessage) => {
      const index = rawMessage.index;
      if ("end" in rawMessage) {
        if (index == this.#nextMessageIndex) {
          this.cleanupCallback();
        } else {
          this.#messageEndIndex = index;
        }
        return;
      }
      const message = rawMessage.message;
      if (index == this.#nextMessageIndex) {
        this.#onmessage(message);
        this.#nextMessageIndex += 1;
        while (this.#nextMessageIndex in this.#pendingMessages) {
          const message2 = this.#pendingMessages[this.#nextMessageIndex];
          this.#onmessage(message2);
          delete this.#pendingMessages[this.#nextMessageIndex];
          this.#nextMessageIndex += 1;
        }
        if (this.#nextMessageIndex === this.#messageEndIndex) {
          this.cleanupCallback();
        }
      } else {
        this.#pendingMessages[index] = message;
      }
    });
  }
  cleanupCallback() {
    Reflect.deleteProperty(window, `_${this.id}`);
  }
  set onmessage(handler) {
    this.#onmessage = handler;
  }
  get onmessage() {
    return this.#onmessage;
  }
  [SERIALIZE_TO_IPC_FN]() {
    return `__CHANNEL__:${this.id}`;
  }
  toJSON() {
    return this[SERIALIZE_TO_IPC_FN]();
  }
};
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

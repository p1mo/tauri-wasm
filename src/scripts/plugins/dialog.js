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
      const message2 = rawMessage.message;
      if (index == this.#nextMessageIndex) {
        this.#onmessage(message2);
        this.#nextMessageIndex += 1;
        while (this.#nextMessageIndex in this.#pendingMessages) {
          const message3 = this.#pendingMessages[this.#nextMessageIndex];
          this.#onmessage(message3);
          delete this.#pendingMessages[this.#nextMessageIndex];
          this.#nextMessageIndex += 1;
        }
        if (this.#nextMessageIndex === this.#messageEndIndex) {
          this.cleanupCallback();
        }
      } else {
        this.#pendingMessages[index] = message2;
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

// tauri-plugins/plugins/dialog/guest-js/index.ts
async function open(options = {}) {
  if (typeof options === "object") {
    Object.freeze(options);
  }
  return await invoke("plugin:dialog|open", { options });
}
async function save(options = {}) {
  if (typeof options === "object") {
    Object.freeze(options);
  }
  return await invoke("plugin:dialog|save", { options });
}
async function message(message2, options) {
  const opts = typeof options === "string" ? { title: options } : options;
  await invoke("plugin:dialog|message", {
    message: message2.toString(),
    title: opts?.title?.toString(),
    kind: opts?.kind,
    okButtonLabel: opts?.okLabel?.toString()
  });
}
async function ask(message2, options) {
  const opts = typeof options === "string" ? { title: options } : options;
  return await invoke("plugin:dialog|ask", {
    message: message2.toString(),
    title: opts?.title?.toString(),
    kind: opts?.kind,
    yesButtonLabel: opts?.okLabel?.toString(),
    noButtonLabel: opts?.cancelLabel?.toString()
  });
}
async function confirm(message2, options) {
  const opts = typeof options === "string" ? { title: options } : options;
  return await invoke("plugin:dialog|confirm", {
    message: message2.toString(),
    title: opts?.title?.toString(),
    kind: opts?.kind,
    okButtonLabel: opts?.okLabel?.toString(),
    cancelButtonLabel: opts?.cancelLabel?.toString()
  });
}
export {
  ask,
  confirm,
  message,
  open,
  save
};

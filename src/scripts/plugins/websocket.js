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

// tauri-plugins/plugins/websocket/guest-js/index.ts
var WebSocket = class _WebSocket {
  constructor(id, listeners) {
    this.id = id;
    this.listeners = listeners;
  }
  static async connect(url, config) {
    const listeners = /* @__PURE__ */ new Set();
    const onMessage = new Channel();
    onMessage.onmessage = (message) => {
      listeners.forEach((l) => {
        l(message);
      });
    };
    if (config?.headers) {
      config.headers = Array.from(new Headers(config.headers).entries());
    }
    return await invoke("plugin:websocket|connect", {
      url,
      onMessage,
      config
    }).then((id) => new _WebSocket(id, listeners));
  }
  addListener(cb) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }
  async send(message) {
    let m;
    if (typeof message === "string") {
      m = { type: "Text", data: message };
    } else if (typeof message === "object" && "type" in message) {
      m = message;
    } else if (Array.isArray(message)) {
      m = { type: "Binary", data: message };
    } else {
      throw new Error(
        "invalid `message` type, expected a `{ type: string, data: any }` object, a string or a numeric array"
      );
    }
    await invoke("plugin:websocket|send", {
      id: this.id,
      message: m
    });
  }
  async disconnect() {
    await this.send({
      type: "Close",
      data: {
        code: 1e3,
        reason: "Disconnected by client"
      }
    });
  }
};
export {
  WebSocket as default
};

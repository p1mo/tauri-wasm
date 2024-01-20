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

// tauri-plugins/plugins/websocket/guest-js/index.ts
var WebSocket = class _WebSocket {
  constructor(id, listeners) {
    this.id = id;
    this.listeners = listeners;
  }
  static async connect(url, config) {
    const listeners = [];
    const onMessage = new Channel();
    onMessage.onmessage = (message) => {
      listeners.forEach((l) => l(message));
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
    this.listeners.push(cb);
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
    return await invoke("plugin:websocket|send", {
      id: this.id,
      message: m
    });
  }
  async disconnect() {
    return await this.send({
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

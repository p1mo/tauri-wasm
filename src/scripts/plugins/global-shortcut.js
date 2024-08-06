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

// tauri-plugins/plugins/global-shortcut/guest-js/index.ts
async function register(shortcuts, handler) {
  const h = new Channel();
  h.onmessage = handler;
  return await invoke("plugin:global-shortcut|register", {
    shortcuts: Array.isArray(shortcuts) ? shortcuts : [shortcuts],
    handler: h
  });
}
async function unregister(shortcuts) {
  return await invoke("plugin:global-shortcut|unregister", {
    shortcuts: Array.isArray(shortcuts) ? shortcuts : [shortcuts]
  });
}
async function unregisterAll() {
  return await invoke("plugin:global-shortcut|unregister_all", {});
}
async function isRegistered(shortcut) {
  return await invoke("plugin:global-shortcut|is_registered", {
    shortcut
  });
}
export {
  isRegistered,
  register,
  unregister,
  unregisterAll
};

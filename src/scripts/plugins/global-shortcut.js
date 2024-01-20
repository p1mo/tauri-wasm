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

// tauri-plugins/plugins/global-shortcut/guest-js/index.ts
async function register(shortcut, handler) {
  const h = new Channel();
  h.onmessage = handler;
  return await invoke("plugin:globalShortcut|register", {
    shortcut,
    handler: h
  });
}
async function registerAll(shortcuts, handler) {
  const h = new Channel();
  h.onmessage = handler;
  return await invoke("plugin:globalShortcut|register_all", {
    shortcuts,
    handler: h
  });
}
async function isRegistered(shortcut) {
  return await invoke("plugin:globalShortcut|is_registered", {
    shortcut
  });
}
async function unregister(shortcut) {
  return await invoke("plugin:globalShortcut|unregister", {
    shortcut
  });
}
async function unregisterAll() {
  return await invoke("plugin:globalShortcut|unregister_all");
}
export {
  isRegistered,
  register,
  registerAll,
  unregister,
  unregisterAll
};

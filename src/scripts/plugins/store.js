// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-v2/tooling/api/src/event.ts
async function _unlisten(event, eventId) {
  await invoke("plugin:event|unlisten", {
    event,
    eventId
  });
}
async function listen(event, handler, options) {
  const target = typeof options?.target === "string" ? { kind: "AnyLabel", label: options.target } : options?.target ?? { kind: "Any" };
  return invoke("plugin:event|listen", {
    event,
    target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}

// tauri-plugins/plugins/store/guest-js/index.ts
var Store = class {
  constructor(path) {
    this.path = path;
  }
  /**
   * Inserts a key-value pair into the store.
   *
   * @param key
   * @param value
   * @returns
   */
  async set(key, value) {
    return await invoke("plugin:store|set", {
      path: this.path,
      key,
      value
    });
  }
  /**
   * Returns the value for the given `key` or `null` the key does not exist.
   *
   * @param key
   * @returns
   */
  async get(key) {
    return await invoke("plugin:store|get", {
      path: this.path,
      key
    });
  }
  /**
   * Returns `true` if the given `key` exists in the store.
   *
   * @param key
   * @returns
   */
  async has(key) {
    return await invoke("plugin:store|has", {
      path: this.path,
      key
    });
  }
  /**
   * Removes a key-value pair from the store.
   *
   * @param key
   * @returns
   */
  async delete(key) {
    return await invoke("plugin:store|delete", {
      path: this.path,
      key
    });
  }
  /**
   * Clears the store, removing all key-value pairs.
   *
   * Note: To clear the storage and reset it to it's `default` value, use `reset` instead.
   * @returns
   */
  async clear() {
    return await invoke("plugin:store|clear", {
      path: this.path
    });
  }
  /**
   * Resets the store to it's `default` value.
   *
   * If no default value has been set, this method behaves identical to `clear`.
   * @returns
   */
  async reset() {
    return await invoke("plugin:store|reset", {
      path: this.path
    });
  }
  /**
   * Returns a list of all key in the store.
   *
   * @returns
   */
  async keys() {
    return await invoke("plugin:store|keys", {
      path: this.path
    });
  }
  /**
   * Returns a list of all values in the store.
   *
   * @returns
   */
  async values() {
    return await invoke("plugin:store|values", {
      path: this.path
    });
  }
  /**
   * Returns a list of all entries in the store.
   *
   * @returns
   */
  async entries() {
    return await invoke("plugin:store|entries", {
      path: this.path
    });
  }
  /**
   * Returns the number of key-value pairs in the store.
   *
   * @returns
   */
  async length() {
    return await invoke("plugin:store|length", {
      path: this.path
    });
  }
  /**
   * Attempts to load the on-disk state at the stores `path` into memory.
   *
   * This method is useful if the on-disk state was edited by the user and you want to synchronize the changes.
   *
   * Note: This method does not emit change events.
   * @returns
   */
  async load() {
    return await invoke("plugin:store|load", {
      path: this.path
    });
  }
  /**
   * Saves the store to disk at the stores `path`.
   *
   * As the store is only persisted to disk before the apps exit, changes might be lost in a crash.
   * This method lets you persist the store to disk whenever you deem necessary.
   * @returns
   */
  async save() {
    return await invoke("plugin:store|save", {
      path: this.path
    });
  }
  /**
   * Listen to changes on a store key.
   * @param key
   * @param cb
   * @returns A promise resolving to a function to unlisten to the event.
   *
   * @since 2.0.0
   */
  async onKeyChange(key, cb) {
    return await listen("store://change", (event) => {
      if (event.payload.path === this.path && event.payload.key === key) {
        cb(event.payload.value);
      }
    });
  }
  /**
   * Listen to changes on the store.
   * @param cb
   * @returns A promise resolving to a function to unlisten to the event.
   *
   * @since 2.0.0
   */
  async onChange(cb) {
    return await listen("store://change", (event) => {
      if (event.payload.path === this.path) {
        cb(event.payload.key, event.payload.value);
      }
    });
  }
};
export {
  Store
};

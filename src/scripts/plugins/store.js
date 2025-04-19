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
var Resource = class {
  #rid;
  get rid() {
    return this.#rid;
  }
  constructor(rid) {
    this.#rid = rid;
  }
  /**
   * Destroys and cleans up this resource from memory.
   * **You should not call any method on this object anymore and should drop any reference to it.**
   */
  async close() {
    return invoke("plugin:resources|close", {
      rid: this.rid
    });
  }
};

// tauri-v2/packages/api/src/event.ts
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
async function load(path, options) {
  return await Store.load(path, options);
}
async function getStore(path) {
  return await Store.get(path);
}
var LazyStore = class {
  /**
   * Note that the options are not applied if someone else already created the store
   * @param path Path to save the store in `app_data_dir`
   * @param options Store configuration options
   */
  constructor(path, options) {
    this.path = path;
    this.options = options;
  }
  get store() {
    if (!this._store) {
      this._store = load(this.path, this.options);
    }
    return this._store;
  }
  /**
   * Init/load the store if it's not loaded already
   */
  async init() {
    await this.store;
  }
  async set(key, value) {
    return (await this.store).set(key, value);
  }
  async get(key) {
    return (await this.store).get(key);
  }
  async has(key) {
    return (await this.store).has(key);
  }
  async delete(key) {
    return (await this.store).delete(key);
  }
  async clear() {
    await (await this.store).clear();
  }
  async reset() {
    await (await this.store).reset();
  }
  async keys() {
    return (await this.store).keys();
  }
  async values() {
    return (await this.store).values();
  }
  async entries() {
    return (await this.store).entries();
  }
  async length() {
    return (await this.store).length();
  }
  async reload() {
    await (await this.store).reload();
  }
  async save() {
    await (await this.store).save();
  }
  async onKeyChange(key, cb) {
    return (await this.store).onKeyChange(key, cb);
  }
  async onChange(cb) {
    return (await this.store).onChange(cb);
  }
  async close() {
    if (this._store) {
      await (await this._store).close();
    }
  }
};
var Store = class _Store extends Resource {
  constructor(rid) {
    super(rid);
  }
  /**
   * Create a new Store or load the existing store with the path.
   *
   * @example
   * ```typescript
   * import { Store } from '@tauri-apps/api/store';
   * const store = await Store.load('store.json');
   * ```
   *
   * @param path Path to save the store in `app_data_dir`
   * @param options Store configuration options
   */
  static async load(path, options) {
    const rid = await invoke("plugin:store|load", {
      path,
      ...options
    });
    return new _Store(rid);
  }
  /**
   * Gets an already loaded store.
   *
   * If the store is not loaded, returns `null`. In this case you must {@link Store.load load} it.
   *
   * This function is more useful when you already know the store is loaded
   * and just need to access its instance. Prefer {@link Store.load} otherwise.
   *
   * @example
   * ```typescript
   * import { Store } from '@tauri-apps/api/store';
   * let store = await Store.get('store.json');
   * if (!store) {
   *   store = await Store.load('store.json');
   * }
   * ```
   *
   * @param path Path of the store.
   */
  static async get(path) {
    return await invoke("plugin:store|get_store", { path }).then(
      (rid) => rid ? new _Store(rid) : null
    );
  }
  async set(key, value) {
    await invoke("plugin:store|set", {
      rid: this.rid,
      key,
      value
    });
  }
  async get(key) {
    const [value, exists] = await invoke("plugin:store|get", {
      rid: this.rid,
      key
    });
    return exists ? value : void 0;
  }
  async has(key) {
    return await invoke("plugin:store|has", {
      rid: this.rid,
      key
    });
  }
  async delete(key) {
    return await invoke("plugin:store|delete", {
      rid: this.rid,
      key
    });
  }
  async clear() {
    await invoke("plugin:store|clear", { rid: this.rid });
  }
  async reset() {
    await invoke("plugin:store|reset", { rid: this.rid });
  }
  async keys() {
    return await invoke("plugin:store|keys", { rid: this.rid });
  }
  async values() {
    return await invoke("plugin:store|values", { rid: this.rid });
  }
  async entries() {
    return await invoke("plugin:store|entries", { rid: this.rid });
  }
  async length() {
    return await invoke("plugin:store|length", { rid: this.rid });
  }
  async reload() {
    await invoke("plugin:store|reload", { rid: this.rid });
  }
  async save() {
    await invoke("plugin:store|save", { rid: this.rid });
  }
  async onKeyChange(key, cb) {
    return await listen("store://change", (event) => {
      if (event.payload.resourceId === this.rid && event.payload.key === key) {
        cb(event.payload.exists ? event.payload.value : void 0);
      }
    });
  }
  async onChange(cb) {
    return await listen("store://change", (event) => {
      if (event.payload.resourceId === this.rid) {
        cb(
          event.payload.key,
          event.payload.exists ? event.payload.value : void 0
        );
      }
    });
  }
};
export {
  LazyStore,
  Store,
  getStore,
  load
};

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

// tauri-plugins/plugins/updater/guest-js/index.ts
var Update = class extends Resource {
  constructor(metadata) {
    super(metadata.rid);
    this.available = true;
    this.currentVersion = metadata.currentVersion;
    this.version = metadata.version;
    this.date = metadata.date;
    this.body = metadata.body;
    this.rawJson = metadata.rawJson;
  }
  /** Download the updater package */
  async download(onEvent, options) {
    const channel = new Channel();
    if (onEvent) {
      channel.onmessage = onEvent;
    }
    const downloadedBytesRid = await invoke("plugin:updater|download", {
      onEvent: channel,
      rid: this.rid,
      ...options
    });
    this.downloadedBytes = new Resource(downloadedBytesRid);
  }
  /** Install downloaded updater package */
  async install() {
    if (!this.downloadedBytes) {
      throw new Error("Update.install called before Update.download");
    }
    await invoke("plugin:updater|install", {
      updateRid: this.rid,
      bytesRid: this.downloadedBytes.rid
    });
    this.downloadedBytes = void 0;
  }
  /** Downloads the updater package and installs it */
  async downloadAndInstall(onEvent, options) {
    const channel = new Channel();
    if (onEvent) {
      channel.onmessage = onEvent;
    }
    await invoke("plugin:updater|download_and_install", {
      onEvent: channel,
      rid: this.rid,
      ...options
    });
  }
  async close() {
    await this.downloadedBytes?.close();
    await super.close();
  }
};
async function check(options) {
  if (options?.headers) {
    options.headers = Array.from(new Headers(options.headers).entries());
  }
  const metadata = await invoke("plugin:updater|check", {
    ...options
  });
  return metadata ? new Update(metadata) : null;
}
export {
  Update,
  check
};

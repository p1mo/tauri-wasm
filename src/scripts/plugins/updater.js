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
    this.available = metadata.available;
    this.currentVersion = metadata.currentVersion;
    this.version = metadata.version;
    this.date = metadata.date;
    this.body = metadata.body;
  }
  /** Download the updater package */
  async download(onEvent) {
    const channel = new Channel();
    if (onEvent) {
      channel.onmessage = onEvent;
    }
    const downloadedBytesRid = await invoke("plugin:updater|download", {
      onEvent: channel,
      rid: this.rid
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
  async downloadAndInstall(onEvent) {
    const channel = new Channel();
    if (onEvent) {
      channel.onmessage = onEvent;
    }
    await invoke("plugin:updater|download_and_install", {
      onEvent: channel,
      rid: this.rid
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
  return await invoke("plugin:updater|check", {
    ...options
  }).then((meta) => meta.available ? new Update(meta) : null);
}
export {
  Update,
  check
};

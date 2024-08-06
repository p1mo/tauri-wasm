// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once2 = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once2);
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

// tauri-plugins/plugins/geolocation/guest-js/bindings.ts
var commands = {
  async getCurrentPosition(options) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:geolocation|get_current_position", {
          options
        })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async watchPosition(options, channel) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:geolocation|watch_position", {
          options,
          channel
        })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async clearWatch(channelId) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:geolocation|clear_watch", {
          channelId
        })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async checkPermissions() {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:geolocation|check_permissions")
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async requestPermissions(permissions) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:geolocation|request_permissions", {
          permissions
        })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  }
};

// tauri-plugins/plugins/geolocation/guest-js/index.ts
async function watchPosition(options, cb) {
  const channel = new Channel();
  channel.onmessage = cb;
  await commands.watchPosition(options, channel);
  return channel.id;
}
var {
  getCurrentPosition,
  clearWatch,
  checkPermissions,
  requestPermissions
} = commands;
export {
  checkPermissions,
  clearWatch,
  getCurrentPosition,
  requestPermissions,
  watchPosition
};

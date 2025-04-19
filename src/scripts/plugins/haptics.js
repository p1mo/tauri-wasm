// tauri-v2/packages/api/src/core.ts
var SERIALIZE_TO_IPC_FN = "__TAURI_TO_IPC_KEY__";
function transformCallback(callback, once2 = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once2);
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

// tauri-plugins/plugins/haptics/guest-js/bindings.ts
var commands = {
  async vibrate(duration) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:haptics|vibrate", { duration })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async impactFeedback(style) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:haptics|impact_feedback", { style })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async notificationFeedback(type) {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:haptics|notification_feedback", {
          type
        })
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  },
  async selectionFeedback() {
    try {
      return {
        status: "ok",
        data: await invoke("plugin:haptics|selection_feedback")
      };
    } catch (e) {
      if (e instanceof Error)
        throw e;
      else
        return { status: "error", error: e };
    }
  }
};

// tauri-plugins/plugins/haptics/guest-js/index.ts
var {
  vibrate,
  impactFeedback,
  notificationFeedback,
  selectionFeedback
} = commands;
export {
  impactFeedback,
  notificationFeedback,
  selectionFeedback,
  vibrate
};

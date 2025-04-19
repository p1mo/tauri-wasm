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

// tauri-plugins/plugins/positioner/guest-js/index.ts
var Position = /* @__PURE__ */ ((Position2) => {
  Position2[Position2["TopLeft"] = 0] = "TopLeft";
  Position2[Position2["TopRight"] = 1] = "TopRight";
  Position2[Position2["BottomLeft"] = 2] = "BottomLeft";
  Position2[Position2["BottomRight"] = 3] = "BottomRight";
  Position2[Position2["TopCenter"] = 4] = "TopCenter";
  Position2[Position2["BottomCenter"] = 5] = "BottomCenter";
  Position2[Position2["LeftCenter"] = 6] = "LeftCenter";
  Position2[Position2["RightCenter"] = 7] = "RightCenter";
  Position2[Position2["Center"] = 8] = "Center";
  Position2[Position2["TrayLeft"] = 9] = "TrayLeft";
  Position2[Position2["TrayBottomLeft"] = 10] = "TrayBottomLeft";
  Position2[Position2["TrayRight"] = 11] = "TrayRight";
  Position2[Position2["TrayBottomRight"] = 12] = "TrayBottomRight";
  Position2[Position2["TrayCenter"] = 13] = "TrayCenter";
  Position2[Position2["TrayBottomCenter"] = 14] = "TrayBottomCenter";
  return Position2;
})(Position || {});
async function moveWindow(to) {
  await invoke("plugin:positioner|move_window", {
    position: to
  });
}
async function moveWindowConstrained(to) {
  await invoke("plugin:positioner|move_window_constrained", {
    position: to
  });
}
async function handleIconState(event) {
  await invoke("plugin:positioner|set_tray_icon_state", {
    position: event.rect.position,
    size: event.rect.size
  });
}
export {
  Position,
  handleIconState,
  moveWindow,
  moveWindowConstrained
};

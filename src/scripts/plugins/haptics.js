// tauri-v2/tooling/api/src/core.ts
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

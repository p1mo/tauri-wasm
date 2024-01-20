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
var PluginListener = class {
  plugin;
  event;
  channelId;
  constructor(plugin, event, channelId) {
    this.plugin = plugin;
    this.event = event;
    this.channelId = channelId;
  }
  async unregister() {
    return invoke(`plugin:${this.plugin}|remove_listener`, {
      event: this.event,
      channelId: this.channelId
    });
  }
};
async function addPluginListener(plugin, event, cb) {
  const handler = new Channel();
  handler.onmessage = cb;
  return invoke(`plugin:${plugin}|register_listener`, { event, handler }).then(
    () => new PluginListener(plugin, event, handler.id)
  );
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/notification/guest-js/index.ts
var ScheduleEvery = /* @__PURE__ */ ((ScheduleEvery2) => {
  ScheduleEvery2["Year"] = "year";
  ScheduleEvery2["Month"] = "month";
  ScheduleEvery2["TwoWeeks"] = "twoWeeks";
  ScheduleEvery2["Week"] = "week";
  ScheduleEvery2["Day"] = "day";
  ScheduleEvery2["Hour"] = "hour";
  ScheduleEvery2["Minute"] = "minute";
  ScheduleEvery2["Second"] = "second";
  return ScheduleEvery2;
})(ScheduleEvery || {});
var Schedule = class _Schedule {
  constructor(schedule) {
    this.schedule = schedule;
  }
  toJSON() {
    return JSON.stringify(this.schedule);
  }
  static at(date, repeating = false, allowWhileIdle = false) {
    return new _Schedule({ at: { date, repeating, allowWhileIdle } });
  }
  static interval(interval, allowWhileIdle = false) {
    return new _Schedule({ interval: { interval, allowWhileIdle } });
  }
  static every(kind, count, allowWhileIdle = false) {
    return new _Schedule({ every: { interval: kind, count, allowWhileIdle } });
  }
};
var Importance = /* @__PURE__ */ ((Importance2) => {
  Importance2[Importance2["None"] = 0] = "None";
  Importance2[Importance2["Min"] = 1] = "Min";
  Importance2[Importance2["Low"] = 2] = "Low";
  Importance2[Importance2["Default"] = 3] = "Default";
  Importance2[Importance2["High"] = 4] = "High";
  return Importance2;
})(Importance || {});
var Visibility = /* @__PURE__ */ ((Visibility2) => {
  Visibility2[Visibility2["Secret"] = -1] = "Secret";
  Visibility2[Visibility2["Private"] = 0] = "Private";
  Visibility2[Visibility2["Public"] = 1] = "Public";
  return Visibility2;
})(Visibility || {});
async function isPermissionGranted() {
  if (window.Notification.permission !== "default") {
    return Promise.resolve(window.Notification.permission === "granted");
  }
  return invoke("plugin:notification|is_permission_granted");
}
async function requestPermission() {
  return window.Notification.requestPermission();
}
function sendNotification(options) {
  if (typeof options === "string") {
    new window.Notification(options);
  } else {
    new window.Notification(options.title, options);
  }
}
async function registerActionTypes(types) {
  return invoke("plugin:notification|register_action_types", { types });
}
async function pending() {
  return invoke("plugin:notification|get_pending");
}
async function cancel(notifications) {
  return invoke("plugin:notification|cancel", { notifications });
}
async function cancelAll() {
  return invoke("plugin:notification|cancel");
}
async function active() {
  return invoke("plugin:notification|get_active");
}
async function removeActive(notifications) {
  return invoke("plugin:notification|remove_active", { notifications });
}
async function removeAllActive() {
  return invoke("plugin:notification|remove_active");
}
async function createChannel(channel) {
  return invoke("plugin:notification|create_channel", { ...channel });
}
async function removeChannel(id) {
  return invoke("plugin:notification|delete_channel", { id });
}
async function channels() {
  return invoke("plugin:notification|listChannels");
}
async function onNotificationReceived(cb) {
  return addPluginListener("notification", "notification", cb);
}
async function onAction(cb) {
  return addPluginListener("notification", "actionPerformed", cb);
}
export {
  Importance,
  Schedule,
  ScheduleEvery,
  Visibility,
  active,
  cancel,
  cancelAll,
  channels,
  createChannel,
  isPermissionGranted,
  onAction,
  onNotificationReceived,
  pending,
  registerActionTypes,
  removeActive,
  removeAllActive,
  removeChannel,
  requestPermission,
  sendNotification
};

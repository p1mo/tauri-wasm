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
  return invoke("plugin:event|listen", {
    event,
    target: options?.target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}

// tauri-plugins/plugins/log/guest-js/index.ts
async function log(level, message, options) {
  const traces = new Error().stack?.split("\n").map((line2) => line2.split("@"));
  const filtered = traces?.filter(([name, location2]) => {
    return name.length > 0 && location2 !== "[native code]";
  });
  const { file, line, keyValues } = options ?? {};
  let location = filtered?.[0]?.filter((v) => v.length > 0).join("@");
  if (location === "Error") {
    location = "webview::unknown";
  }
  await invoke("plugin:log|log", {
    level,
    message,
    location,
    file,
    line,
    keyValues
  });
}
async function error(message, options) {
  await log(5 /* Error */, message, options);
}
async function warn(message, options) {
  await log(4 /* Warn */, message, options);
}
async function info(message, options) {
  await log(3 /* Info */, message, options);
}
async function debug(message, options) {
  await log(2 /* Debug */, message, options);
}
async function trace(message, options) {
  await log(1 /* Trace */, message, options);
}
async function attachConsole() {
  return await listen("log://log", (event) => {
    const payload = event.payload;
    const message = payload.message.replace(
      // TODO: Investigate security/detect-unsafe-regex
      // eslint-disable-next-line no-control-regex, security/detect-unsafe-regex
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );
    switch (payload.level) {
      case 1 /* Trace */:
        console.log(message);
        break;
      case 2 /* Debug */:
        console.debug(message);
        break;
      case 3 /* Info */:
        console.info(message);
        break;
      case 4 /* Warn */:
        console.warn(message);
        break;
      case 5 /* Error */:
        console.error(message);
        break;
      default:
        throw new Error(`unknown log level ${payload.level}`);
    }
  });
}
export {
  attachConsole,
  debug,
  error,
  info,
  trace,
  warn
};

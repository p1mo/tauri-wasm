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

// tauri-plugins/plugins/log/guest-js/index.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Trace"] = 1] = "Trace";
  LogLevel2[LogLevel2["Debug"] = 2] = "Debug";
  LogLevel2[LogLevel2["Info"] = 3] = "Info";
  LogLevel2[LogLevel2["Warn"] = 4] = "Warn";
  LogLevel2[LogLevel2["Error"] = 5] = "Error";
  return LogLevel2;
})(LogLevel || {});
function getCallerLocation(stack) {
  if (!stack) {
    return;
  }
  if (stack.startsWith("Error")) {
    const lines = stack.split("\n");
    const callerLine = lines[3]?.trim();
    if (!callerLine) {
      return;
    }
    const regex = /at\s+(?<functionName>.*?)\s+\((?<fileName>.*?):(?<lineNumber>\d+):(?<columnNumber>\d+)\)/;
    const match = callerLine.match(regex);
    if (match) {
      const { functionName, fileName, lineNumber, columnNumber } = match.groups;
      return `${functionName}@${fileName}:${lineNumber}:${columnNumber}`;
    } else {
      const regexNoFunction = /at\s+(?<fileName>.*?):(?<lineNumber>\d+):(?<columnNumber>\d+)/;
      const matchNoFunction = callerLine.match(regexNoFunction);
      if (matchNoFunction) {
        const { fileName, lineNumber, columnNumber } = matchNoFunction.groups;
        return `<anonymous>@${fileName}:${lineNumber}:${columnNumber}`;
      }
    }
  } else {
    const traces = stack.split("\n").map((line) => line.split("@"));
    const filtered = traces.filter(([name, location]) => {
      return name.length > 0 && location !== "[native code]";
    });
    return filtered[2]?.filter((v) => v.length > 0).join("@");
  }
}
async function log(level, message, options) {
  const location = getCallerLocation(new Error().stack);
  const { file, line, keyValues } = options ?? {};
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
async function attachLogger(fn) {
  return await listen("log://log", (event) => {
    const { level } = event.payload;
    let { message } = event.payload;
    message = message.replace(
      // TODO: Investigate security/detect-unsafe-regex
      // eslint-disable-next-line no-control-regex, security/detect-unsafe-regex
      /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
      ""
    );
    fn({ message, level });
  });
}
async function attachConsole() {
  return await attachLogger(({ level, message }) => {
    switch (level) {
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
        throw new Error(`unknown log level ${level}`);
    }
  });
}
export {
  LogLevel,
  attachConsole,
  attachLogger,
  debug,
  error,
  info,
  trace,
  warn
};

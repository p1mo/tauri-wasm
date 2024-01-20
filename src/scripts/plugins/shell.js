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
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-plugins/plugins/shell/guest-js/index.ts
async function execute(onEventHandler, program, args = [], options) {
  if (typeof args === "object") {
    Object.freeze(args);
  }
  const onEvent = new Channel();
  onEvent.onmessage = onEventHandler;
  return invoke("plugin:shell|execute", {
    program,
    args,
    options,
    onEvent
  });
}
var EventEmitter = class {
  constructor() {
    /** @ignore */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
    this.eventListeners = /* @__PURE__ */ Object.create(null);
  }
  /**
   * Alias for `emitter.on(eventName, listener)`.
   *
   * @since 2.0.0
   */
  addListener(eventName, listener) {
    return this.on(eventName, listener);
  }
  /**
   * Alias for `emitter.off(eventName, listener)`.
   *
   * @since 2.0.0
   */
  removeListener(eventName, listener) {
    return this.off(eventName, listener);
  }
  /**
   * Adds the `listener` function to the end of the listeners array for the
   * event named `eventName`. No checks are made to see if the `listener` has
   * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
   * times.
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * @since 2.0.0
   */
  on(eventName, listener) {
    if (eventName in this.eventListeners) {
      this.eventListeners[eventName].push(listener);
    } else {
      this.eventListeners[eventName] = [listener];
    }
    return this;
  }
  /**
   * Adds a **one-time**`listener` function for the event named `eventName`. The
   * next time `eventName` is triggered, this listener is removed and then invoked.
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * @since 2.0.0
   */
  once(eventName, listener) {
    const wrapper = (arg) => {
      this.removeListener(eventName, wrapper);
      listener(arg);
    };
    return this.addListener(eventName, wrapper);
  }
  /**
   * Removes the all specified listener from the listener array for the event eventName
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * @since 2.0.0
   */
  off(eventName, listener) {
    if (eventName in this.eventListeners) {
      this.eventListeners[eventName] = this.eventListeners[eventName].filter(
        (l) => l !== listener
      );
    }
    return this;
  }
  /**
   * Removes all listeners, or those of the specified eventName.
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * @since 2.0.0
   */
  removeAllListeners(event) {
    if (event) {
      delete this.eventListeners[event];
    } else {
      this.eventListeners = /* @__PURE__ */ Object.create(null);
    }
    return this;
  }
  /**
   * @ignore
   * Synchronously calls each of the listeners registered for the event named`eventName`, in the order they were registered, passing the supplied arguments
   * to each.
   *
   * @returns `true` if the event had listeners, `false` otherwise.
   *
   * @since 2.0.0
   */
  emit(eventName, arg) {
    if (eventName in this.eventListeners) {
      const listeners = this.eventListeners[eventName];
      for (const listener of listeners)
        listener(arg);
      return true;
    }
    return false;
  }
  /**
   * Returns the number of listeners listening to the event named `eventName`.
   *
   * @since 2.0.0
   */
  listenerCount(eventName) {
    if (eventName in this.eventListeners)
      return this.eventListeners[eventName].length;
    return 0;
  }
  /**
   * Adds the `listener` function to the _beginning_ of the listeners array for the
   * event named `eventName`. No checks are made to see if the `listener` has
   * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
   * times.
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * @since 2.0.0
   */
  prependListener(eventName, listener) {
    if (eventName in this.eventListeners) {
      this.eventListeners[eventName].unshift(listener);
    } else {
      this.eventListeners[eventName] = [listener];
    }
    return this;
  }
  /**
   * Adds a **one-time**`listener` function for the event named `eventName` to the_beginning_ of the listeners array. The next time `eventName` is triggered, this
   * listener is removed, and then invoked.
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * @since 2.0.0
   */
  prependOnceListener(eventName, listener) {
    const wrapper = (arg) => {
      this.removeListener(eventName, wrapper);
      listener(arg);
    };
    return this.prependListener(eventName, wrapper);
  }
};
var Child = class {
  constructor(pid) {
    this.pid = pid;
  }
  /**
   * Writes `data` to the `stdin`.
   *
   * @param data The message to write, either a string or a byte array.
   * @example
   * ```typescript
   * import { Command } from '@tauri-apps/plugin-shell';
   * const command = Command.create('node');
   * const child = await command.spawn();
   * await child.write('message');
   * await child.write([0, 1, 2, 3, 4, 5]);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   *
   * @since 2.0.0
   */
  async write(data) {
    return invoke("plugin:shell|stdin_write", {
      pid: this.pid,
      // correctly serialize Uint8Arrays
      buffer: typeof data === "string" ? data : Array.from(data)
    });
  }
  /**
   * Kills the child process.
   *
   * @returns A promise indicating the success or failure of the operation.
   *
   * @since 2.0.0
   */
  async kill() {
    return invoke("plugin:shell|kill", {
      cmd: "killChild",
      pid: this.pid
    });
  }
};
var Command = class _Command extends EventEmitter {
  /**
   * @ignore
   * Creates a new `Command` instance.
   *
   * @param program The program name to execute.
   * It must be configured on `tauri.conf.json > plugins > shell > scope`.
   * @param args Program arguments.
   * @param options Spawn options.
   */
  constructor(program, args = [], options) {
    super();
    /** Event emitter for the `stdout`. Emits the `data` event. */
    this.stdout = new EventEmitter();
    /** Event emitter for the `stderr`. Emits the `data` event. */
    this.stderr = new EventEmitter();
    this.program = program;
    this.args = typeof args === "string" ? [args] : args;
    this.options = options ?? {};
  }
  /**
   * Creates a command to execute the given program.
   * @example
   * ```typescript
   * import { Command } from '@tauri-apps/plugin-shell';
   * const command = Command.create('my-app', ['run', 'tauri']);
   * const output = await command.execute();
   * ```
   *
   * @param program The program to execute.
   * It must be configured on `tauri.conf.json > plugins > shell > scope`.
   */
  static create(program, args = [], options) {
    return new _Command(program, args, options);
  }
  /**
   * Creates a command to execute the given sidecar program.
   * @example
   * ```typescript
   * import { Command } from '@tauri-apps/plugin-shell';
   * const command = Command.sidecar('my-sidecar');
   * const output = await command.execute();
   * ```
   *
   * @param program The program to execute.
   * It must be configured on `tauri.conf.json > plugins > shell > scope`.
   */
  static sidecar(program, args = [], options) {
    const instance = new _Command(program, args, options);
    instance.options.sidecar = true;
    return instance;
  }
  /**
   * Executes the command as a child process, returning a handle to it.
   *
   * @returns A promise resolving to the child process handle.
   *
   * @since 2.0.0
   */
  async spawn() {
    return execute(
      (event) => {
        switch (event.event) {
          case "Error":
            this.emit("error", event.payload);
            break;
          case "Terminated":
            this.emit("close", event.payload);
            break;
          case "Stdout":
            this.stdout.emit("data", event.payload);
            break;
          case "Stderr":
            this.stderr.emit("data", event.payload);
            break;
        }
      },
      this.program,
      this.args,
      this.options
    ).then((pid) => new Child(pid));
  }
  /**
   * Executes the command as a child process, waiting for it to finish and collecting all of its output.
   * @example
   * ```typescript
   * import { Command } from '@tauri-apps/plugin-shell';
   * const output = await Command.create('echo', 'message').execute();
   * assert(output.code === 0);
   * assert(output.signal === null);
   * assert(output.stdout === 'message');
   * assert(output.stderr === '');
   * ```
   *
   * @returns A promise resolving to the child process output.
   *
   * @since 2.0.0
   */
  async execute() {
    return new Promise((resolve, reject) => {
      this.on("error", reject);
      const stdout = [];
      const stderr = [];
      this.stdout.on("data", (line) => {
        stdout.push(line);
      });
      this.stderr.on("data", (line) => {
        stderr.push(line);
      });
      this.on("close", (payload) => {
        resolve({
          code: payload.code,
          signal: payload.signal,
          stdout: this.collectOutput(stdout),
          stderr: this.collectOutput(stderr)
        });
      });
      this.spawn().catch(reject);
    });
  }
  /** @ignore */
  collectOutput(events) {
    if (this.options.encoding === "raw") {
      return events.reduce((p, c) => {
        return new Uint8Array([...p, ...c, 10]);
      }, new Uint8Array());
    } else {
      return events.join("\n");
    }
  }
};
async function open(path, openWith) {
  return invoke("plugin:shell|open", {
    path,
    with: openWith
  });
}
export {
  Child,
  Command,
  EventEmitter,
  open
};

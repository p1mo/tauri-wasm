// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once2 = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once2);
}
async function invoke(cmd, args = {}, options) {
  return window.__TAURI_INTERNALS__.invoke(cmd, args, options);
}

// tauri-v2/tooling/api/src/dpi.ts
var LogicalSize = class {
  constructor(width, height) {
    this.type = "Logical";
    this.width = width;
    this.height = height;
  }
};
var PhysicalSize = class {
  constructor(width, height) {
    this.type = "Physical";
    this.width = width;
    this.height = height;
  }
  /**
   * Converts the physical size to a logical one.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const appWindow = getCurrent();
   * const factor = await appWindow.scaleFactor();
   * const size = await appWindow.innerSize();
   * const logical = size.toLogical(factor);
   * ```
   *  */
  toLogical(scaleFactor) {
    return new LogicalSize(this.width / scaleFactor, this.height / scaleFactor);
  }
};
var LogicalPosition = class {
  constructor(x, y) {
    this.type = "Logical";
    this.x = x;
    this.y = y;
  }
};
var PhysicalPosition = class {
  constructor(x, y) {
    this.type = "Physical";
    this.x = x;
    this.y = y;
  }
  /**
   * Converts the physical position to a logical one.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const appWindow = getCurrent();
   * const factor = await appWindow.scaleFactor();
   * const position = await appWindow.innerPosition();
   * const logical = position.toLogical(factor);
   * ```
   * */
  toLogical(scaleFactor) {
    return new LogicalPosition(this.x / scaleFactor, this.y / scaleFactor);
  }
};

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
    windowLabel: options?.target,
    handler: transformCallback(handler)
  }).then((eventId) => {
    return async () => _unlisten(event, eventId);
  });
}
async function once(event, handler, options) {
  return listen(
    event,
    (eventData) => {
      handler(eventData);
      _unlisten(event, eventData.id).catch(() => {
      });
    },
    options
  );
}
async function emit(event, payload, options) {
  await invoke("plugin:event|emit", {
    event,
    windowLabel: options?.target,
    payload
  });
}

// tauri-v2/tooling/api/src/window.ts
var CloseRequestedEvent = class {
  /** Event name */
  event;
  /** The label of the window that emitted this event. */
  windowLabel;
  /** Event identifier used to unlisten */
  id;
  _preventDefault = false;
  constructor(event) {
    this.event = event.event;
    this.windowLabel = event.windowLabel;
    this.id = event.id;
  }
  preventDefault() {
    this._preventDefault = true;
  }
  isPreventDefault() {
    return this._preventDefault;
  }
};
function getCurrent() {
  return new Window(window.__TAURI_INTERNALS__.metadata.currentWindow.label, {
    // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
    skip: true
  });
}
function getAll() {
  return window.__TAURI_INTERNALS__.metadata.windows.map(
    (w) => new Window(w.label, {
      // @ts-expect-error `skip` is not defined in the public API but it is handled by the constructor
      skip: true
    })
  );
}
var localTauriEvents = ["tauri://created", "tauri://error"];
var Window = class _Window {
  /** The window label. It is a unique identifier for the window, can be used to reference it later. */
  label;
  /** Local event listeners. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listeners;
  /**
   * Creates a new Window.
   * @example
   * ```typescript
   * import { Window } from '@tauri-apps/api/window';
   * const appWindow = new Window('my-label', {
   *   url: 'https://github.com/tauri-apps/tauri'
   * });
   * appWindow.once('tauri://created', function () {
   *  // window successfully created
   * });
   * appWindow.once('tauri://error', function (e) {
   *  // an error happened creating the window
   * });
   * ```
   *
   * @param label The unique webview window label. Must be alphanumeric: `a-zA-Z-/:_`.
   * @returns The {@link Window} instance to communicate with the webview.
   */
  constructor(label, options = {}) {
    this.label = label;
    this.listeners = /* @__PURE__ */ Object.create(null);
    if (!options?.skip) {
      invoke("plugin:window|create", {
        options: {
          ...options,
          label
        }
      }).then(async () => this.emit("tauri://created")).catch(async (e) => this.emit("tauri://error", e));
    }
  }
  /**
   * Gets the Window for the webview associated with the given label.
   * @example
   * ```typescript
   * import { Window } from '@tauri-apps/api/window';
   * const mainWindow = Window.getByLabel('main');
   * ```
   *
   * @param label The webview window label.
   * @returns The Window instance to communicate with the webview or null if the webview doesn't exist.
   */
  static getByLabel(label) {
    if (getAll().some((w) => w.label === label)) {
      return new _Window(label, { skip: true });
    }
    return null;
  }
  /**
   * Get an instance of `Window` for the current window.
   */
  static getCurrent() {
    return getCurrent();
  }
  /**
   * Gets a list of instances of `Window` for all available windows.
   */
  static getAll() {
    return getAll();
  }
  /**
   *  Gets the focused window.
   * @example
   * ```typescript
   * import { Window } from '@tauri-apps/api/window';
   * const focusedWindow = Window.getFocusedWindow();
   * ```
   *
   * @returns The Window instance to communicate with the webview or `undefined` if there is not any focused window.
   */
  static async getFocusedWindow() {
    for (const w of getAll()) {
      if (await w.isFocused()) {
        return w;
      }
    }
    return null;
  }
  /**
   * Listen to an event emitted by the backend that is tied to the webview window.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const unlisten = await getCurrent().listen<string>('state-changed', (event) => {
   *   console.log(`Got error: ${payload}`);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
   * @param handler Event handler.
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async listen(event, handler) {
    if (this._handleTauriEvent(event, handler)) {
      return Promise.resolve(() => {
        const listeners = this.listeners[event];
        listeners.splice(listeners.indexOf(handler), 1);
      });
    }
    return listen(event, handler, { target: this.label });
  }
  /**
   * Listen to an one-off event emitted by the backend that is tied to the webview window.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const unlisten = await getCurrent().once<null>('initialized', (event) => {
   *   console.log(`Window initialized!`);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
   * @param handler Event handler.
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async once(event, handler) {
    if (this._handleTauriEvent(event, handler)) {
      return Promise.resolve(() => {
        const listeners = this.listeners[event];
        listeners.splice(listeners.indexOf(handler), 1);
      });
    }
    return once(event, handler, { target: this.label });
  }
  /**
   * Emits an event to the backend, tied to the webview window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().emit('window-loaded', { loggedIn: true, token: 'authToken' });
   * ```
   *
   * @param event Event name. Must include only alphanumeric characters, `-`, `/`, `:` and `_`.
   * @param payload Event payload.
   */
  async emit(event, payload) {
    if (localTauriEvents.includes(event)) {
      for (const handler of this.listeners[event] || []) {
        handler({ event, id: -1, windowLabel: this.label, payload });
      }
      return Promise.resolve();
    }
    return emit(event, payload, { target: this.label });
  }
  /** @ignore */
  _handleTauriEvent(event, handler) {
    if (localTauriEvents.includes(event)) {
      if (!(event in this.listeners)) {
        this.listeners[event] = [handler];
      } else {
        this.listeners[event].push(handler);
      }
      return true;
    }
    return false;
  }
  // Getters
  /**
   * The scale factor that can be used to map physical pixels to logical pixels.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const factor = await getCurrent().scaleFactor();
   * ```
   *
   * @returns The window's monitor scale factor.
   */
  async scaleFactor() {
    return invoke("plugin:window|scale_factor", {
      label: this.label
    });
  }
  /**
   * The position of the top-left hand corner of the window's client area relative to the top-left hand corner of the desktop.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const position = await getCurrent().innerPosition();
   * ```
   *
   * @returns The window's inner position.
   */
  async innerPosition() {
    return invoke("plugin:window|inner_position", {
      label: this.label
    }).then(({ x, y }) => new PhysicalPosition(x, y));
  }
  /**
   * The position of the top-left hand corner of the window relative to the top-left hand corner of the desktop.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const position = await getCurrent().outerPosition();
   * ```
   *
   * @returns The window's outer position.
   */
  async outerPosition() {
    return invoke("plugin:window|outer_position", {
      label: this.label
    }).then(({ x, y }) => new PhysicalPosition(x, y));
  }
  /**
   * The physical size of the window's client area.
   * The client area is the content of the window, excluding the title bar and borders.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const size = await getCurrent().innerSize();
   * ```
   *
   * @returns The window's inner size.
   */
  async innerSize() {
    return invoke(
      "plugin:window|inner_size",
      {
        label: this.label
      }
    ).then(({ width, height }) => new PhysicalSize(width, height));
  }
  /**
   * The physical size of the entire window.
   * These dimensions include the title bar and borders. If you don't want that (and you usually don't), use inner_size instead.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const size = await getCurrent().outerSize();
   * ```
   *
   * @returns The window's outer size.
   */
  async outerSize() {
    return invoke(
      "plugin:window|outer_size",
      {
        label: this.label
      }
    ).then(({ width, height }) => new PhysicalSize(width, height));
  }
  /**
   * Gets the window's current fullscreen state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const fullscreen = await getCurrent().isFullscreen();
   * ```
   *
   * @returns Whether the window is in fullscreen mode or not.
   */
  async isFullscreen() {
    return invoke("plugin:window|is_fullscreen", {
      label: this.label
    });
  }
  /**
   * Gets the window's current minimized state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const minimized = await getCurrent().isMinimized();
   * ```
   */
  async isMinimized() {
    return invoke("plugin:window|is_minimized", {
      label: this.label
    });
  }
  /**
   * Gets the window's current maximized state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const maximized = await getCurrent().isMaximized();
   * ```
   *
   * @returns Whether the window is maximized or not.
   */
  async isMaximized() {
    return invoke("plugin:window|is_maximized", {
      label: this.label
    });
  }
  /**
   * Gets the window's current focus state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const focused = await getCurrent().isFocused();
   * ```
   *
   * @returns Whether the window is focused or not.
   */
  async isFocused() {
    return invoke("plugin:window|is_focused", {
      label: this.label
    });
  }
  /**
   * Gets the window's current decorated state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const decorated = await getCurrent().isDecorated();
   * ```
   *
   * @returns Whether the window is decorated or not.
   */
  async isDecorated() {
    return invoke("plugin:window|is_decorated", {
      label: this.label
    });
  }
  /**
   * Gets the window's current resizable state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const resizable = await getCurrent().isResizable();
   * ```
   *
   * @returns Whether the window is resizable or not.
   */
  async isResizable() {
    return invoke("plugin:window|is_resizable", {
      label: this.label
    });
  }
  /**
   * Gets the window’s native maximize button state.
   *
   * #### Platform-specific
   *
   * - **Linux / iOS / Android:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const maximizable = await getCurrent().isMaximizable();
   * ```
   *
   * @returns Whether the window's native maximize button is enabled or not.
   */
  async isMaximizable() {
    return invoke("plugin:window|is_maximizable", {
      label: this.label
    });
  }
  /**
   * Gets the window’s native minimize button state.
   *
   * #### Platform-specific
   *
   * - **Linux / iOS / Android:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const minimizable = await getCurrent().isMinimizable();
   * ```
   *
   * @returns Whether the window's native minimize button is enabled or not.
   */
  async isMinimizable() {
    return invoke("plugin:window|is_minimizable", {
      label: this.label
    });
  }
  /**
   * Gets the window’s native close button state.
   *
   * #### Platform-specific
   *
   * - **iOS / Android:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const closable = await getCurrent().isClosable();
   * ```
   *
   * @returns Whether the window's native close button is enabled or not.
   */
  async isClosable() {
    return invoke("plugin:window|is_closable", {
      label: this.label
    });
  }
  /**
   * Gets the window's current visible state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const visible = await getCurrent().isVisible();
   * ```
   *
   * @returns Whether the window is visible or not.
   */
  async isVisible() {
    return invoke("plugin:window|is_visible", {
      label: this.label
    });
  }
  /**
   * Gets the window's current title.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const title = await getCurrent().title();
   * ```
   */
  async title() {
    return invoke("plugin:window|title", {
      label: this.label
    });
  }
  /**
   * Gets the window's current theme.
   *
   * #### Platform-specific
   *
   * - **macOS:** Theme was introduced on macOS 10.14. Returns `light` on macOS 10.13 and below.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * const theme = await getCurrent().theme();
   * ```
   *
   * @returns The window theme.
   */
  async theme() {
    return invoke("plugin:window|theme", {
      label: this.label
    });
  }
  // Setters
  /**
   * Centers the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().center();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async center() {
    return invoke("plugin:window|center", {
      label: this.label
    });
  }
  /**
   *  Requests user attention to the window, this has no effect if the application
   * is already focused. How requesting for user attention manifests is platform dependent,
   * see `UserAttentionType` for details.
   *
   * Providing `null` will unset the request for user attention. Unsetting the request for
   * user attention might not be done automatically by the WM when the window receives input.
   *
   * #### Platform-specific
   *
   * - **macOS:** `null` has no effect.
   * - **Linux:** Urgency levels have the same effect.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().requestUserAttention();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async requestUserAttention(requestType) {
    let requestType_ = null;
    if (requestType) {
      if (requestType === 1 /* Critical */) {
        requestType_ = { type: "Critical" };
      } else {
        requestType_ = { type: "Informational" };
      }
    }
    return invoke("plugin:window|request_user_attention", {
      label: this.label,
      value: requestType_
    });
  }
  /**
   * Updates the window resizable flag.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setResizable(false);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setResizable(resizable) {
    return invoke("plugin:window|set_resizable", {
      label: this.label,
      value: resizable
    });
  }
  /**
   * Sets whether the window's native maximize button is enabled or not.
   * If resizable is set to false, this setting is ignored.
   *
   * #### Platform-specific
   *
   * - **macOS:** Disables the "zoom" button in the window titlebar, which is also used to enter fullscreen mode.
   * - **Linux / iOS / Android:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setMaximizable(false);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setMaximizable(maximizable) {
    return invoke("plugin:window|set_maximizable", {
      label: this.label,
      value: maximizable
    });
  }
  /**
   * Sets whether the window's native minimize button is enabled or not.
   *
   * #### Platform-specific
   *
   * - **Linux / iOS / Android:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setMinimizable(false);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setMinimizable(minimizable) {
    return invoke("plugin:window|set_minimizable", {
      label: this.label,
      value: minimizable
    });
  }
  /**
   * Sets whether the window's native close button is enabled or not.
   *
   * #### Platform-specific
   *
   * - **Linux:** GTK+ will do its best to convince the window manager not to show a close button. Depending on the system, this function may not have any effect when called on a window that is already visible
   * - **iOS / Android:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setClosable(false);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setClosable(closable) {
    return invoke("plugin:window|set_closable", {
      label: this.label,
      value: closable
    });
  }
  /**
   * Sets the window title.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setTitle('Tauri');
   * ```
   *
   * @param title The new title
   * @returns A promise indicating the success or failure of the operation.
   */
  async setTitle(title) {
    return invoke("plugin:window|set_title", {
      label: this.label,
      value: title
    });
  }
  /**
   * Maximizes the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().maximize();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async maximize() {
    return invoke("plugin:window|maximize", {
      label: this.label
    });
  }
  /**
   * Unmaximizes the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().unmaximize();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async unmaximize() {
    return invoke("plugin:window|unmaximize", {
      label: this.label
    });
  }
  /**
   * Toggles the window maximized state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().toggleMaximize();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async toggleMaximize() {
    return invoke("plugin:window|toggle_maximize", {
      label: this.label
    });
  }
  /**
   * Minimizes the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().minimize();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async minimize() {
    return invoke("plugin:window|minimize", {
      label: this.label
    });
  }
  /**
   * Unminimizes the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().unminimize();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async unminimize() {
    return invoke("plugin:window|unminimize", {
      label: this.label
    });
  }
  /**
   * Sets the window visibility to true.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().show();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async show() {
    return invoke("plugin:window|show", {
      label: this.label
    });
  }
  /**
   * Sets the window visibility to false.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().hide();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async hide() {
    return invoke("plugin:window|hide", {
      label: this.label
    });
  }
  /**
   * Closes the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().close();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async close() {
    return invoke("plugin:window|close", {
      label: this.label
    });
  }
  /**
   * Whether the window should have borders and bars.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setDecorations(false);
   * ```
   *
   * @param decorations Whether the window should have borders and bars.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setDecorations(decorations) {
    return invoke("plugin:window|set_decorations", {
      label: this.label,
      value: decorations
    });
  }
  /**
   * Whether or not the window should have shadow.
   *
   * #### Platform-specific
   *
   * - **Windows:**
   *   - `false` has no effect on decorated window, shadows are always ON.
   *   - `true` will make ndecorated window have a 1px white border,
   * and on Windows 11, it will have a rounded corners.
   * - **Linux:** Unsupported.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setShadow(false);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setShadow(enable) {
    return invoke("plugin:window|set_shadow", {
      label: this.label,
      value: enable
    });
  }
  /**
   * Set window effects.
   */
  async setEffects(effects) {
    return invoke("plugin:window|set_effects", {
      label: this.label,
      value: effects
    });
  }
  /**
   * Clear any applied effects if possible.
   */
  async clearEffects() {
    return invoke("plugin:window|set_effects", {
      label: this.label,
      value: null
    });
  }
  /**
   * Whether the window should always be on top of other windows.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setAlwaysOnTop(true);
   * ```
   *
   * @param alwaysOnTop Whether the window should always be on top of other windows or not.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setAlwaysOnTop(alwaysOnTop) {
    return invoke("plugin:window|set_always_on_top", {
      label: this.label,
      value: alwaysOnTop
    });
  }
  /**
   * Whether the window should always be below other windows.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setAlwaysOnBottom(true);
   * ```
   *
   * @param alwaysOnBottom Whether the window should always be below other windows or not.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setAlwaysOnBottom(alwaysOnBottom) {
    return invoke("plugin:window|set_always_on_bottom", {
      label: this.label,
      value: alwaysOnBottom
    });
  }
  /**
   * Prevents the window contents from being captured by other apps.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setContentProtected(true);
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setContentProtected(protected_) {
    return invoke("plugin:window|set_content_protected", {
      label: this.label,
      value: protected_
    });
  }
  /**
   * Resizes the window with a new inner size.
   * @example
   * ```typescript
   * import { getCurrent, LogicalSize } from '@tauri-apps/api/window';
   * await getCurrent().setSize(new LogicalSize(600, 500));
   * ```
   *
   * @param size The logical or physical inner size.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setSize(size) {
    if (!size || size.type !== "Logical" && size.type !== "Physical") {
      throw new Error(
        "the `size` argument must be either a LogicalSize or a PhysicalSize instance"
      );
    }
    return invoke("plugin:window|set_size", {
      label: this.label,
      value: {
        type: size.type,
        data: {
          width: size.width,
          height: size.height
        }
      }
    });
  }
  /**
   * Sets the window minimum inner size. If the `size` argument is not provided, the constraint is unset.
   * @example
   * ```typescript
   * import { getCurrent, PhysicalSize } from '@tauri-apps/api/window';
   * await getCurrent().setMinSize(new PhysicalSize(600, 500));
   * ```
   *
   * @param size The logical or physical inner size, or `null` to unset the constraint.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setMinSize(size) {
    if (size && size.type !== "Logical" && size.type !== "Physical") {
      throw new Error(
        "the `size` argument must be either a LogicalSize or a PhysicalSize instance"
      );
    }
    return invoke("plugin:window|set_min_size", {
      label: this.label,
      value: size ? {
        type: size.type,
        data: {
          width: size.width,
          height: size.height
        }
      } : null
    });
  }
  /**
   * Sets the window maximum inner size. If the `size` argument is undefined, the constraint is unset.
   * @example
   * ```typescript
   * import { getCurrent, LogicalSize } from '@tauri-apps/api/window';
   * await getCurrent().setMaxSize(new LogicalSize(600, 500));
   * ```
   *
   * @param size The logical or physical inner size, or `null` to unset the constraint.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setMaxSize(size) {
    if (size && size.type !== "Logical" && size.type !== "Physical") {
      throw new Error(
        "the `size` argument must be either a LogicalSize or a PhysicalSize instance"
      );
    }
    return invoke("plugin:window|set_max_size", {
      label: this.label,
      value: size ? {
        type: size.type,
        data: {
          width: size.width,
          height: size.height
        }
      } : null
    });
  }
  /**
   * Sets the window outer position.
   * @example
   * ```typescript
   * import { getCurrent, LogicalPosition } from '@tauri-apps/api/window';
   * await getCurrent().setPosition(new LogicalPosition(600, 500));
   * ```
   *
   * @param position The new position, in logical or physical pixels.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setPosition(position) {
    if (!position || position.type !== "Logical" && position.type !== "Physical") {
      throw new Error(
        "the `position` argument must be either a LogicalPosition or a PhysicalPosition instance"
      );
    }
    return invoke("plugin:window|set_position", {
      label: this.label,
      value: {
        type: position.type,
        data: {
          x: position.x,
          y: position.y
        }
      }
    });
  }
  /**
   * Sets the window fullscreen state.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setFullscreen(true);
   * ```
   *
   * @param fullscreen Whether the window should go to fullscreen or not.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setFullscreen(fullscreen) {
    return invoke("plugin:window|set_fullscreen", {
      label: this.label,
      value: fullscreen
    });
  }
  /**
   * Bring the window to front and focus.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setFocus();
   * ```
   *
   * @returns A promise indicating the success or failure of the operation.
   */
  async setFocus() {
    return invoke("plugin:window|set_focus", {
      label: this.label
    });
  }
  /**
   * Sets the window icon.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setIcon('/tauri/awesome.png');
   * ```
   *
   * Note that you need the `icon-ico` or `icon-png` Cargo features to use this API.
   * To enable it, change your Cargo.toml file:
   * ```toml
   * [dependencies]
   * tauri = { version = "...", features = ["...", "icon-png"] }
   * ```
   *
   * @param icon Icon bytes or path to the icon file.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setIcon(icon) {
    return invoke("plugin:window|set_icon", {
      label: this.label,
      value: typeof icon === "string" ? icon : Array.from(icon)
    });
  }
  /**
   * Whether the window icon should be hidden from the taskbar or not.
   *
   * #### Platform-specific
   *
   * - **macOS:** Unsupported.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setSkipTaskbar(true);
   * ```
   *
   * @param skip true to hide window icon, false to show it.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setSkipTaskbar(skip) {
    return invoke("plugin:window|set_skip_taskbar", {
      label: this.label,
      value: skip
    });
  }
  /**
   * Grabs the cursor, preventing it from leaving the window.
   *
   * There's no guarantee that the cursor will be hidden. You should
   * hide it by yourself if you want so.
   *
   * #### Platform-specific
   *
   * - **Linux:** Unsupported.
   * - **macOS:** This locks the cursor in a fixed location, which looks visually awkward.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setCursorGrab(true);
   * ```
   *
   * @param grab `true` to grab the cursor icon, `false` to release it.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setCursorGrab(grab) {
    return invoke("plugin:window|set_cursor_grab", {
      label: this.label,
      value: grab
    });
  }
  /**
   * Modifies the cursor's visibility.
   *
   * #### Platform-specific
   *
   * - **Windows:** The cursor is only hidden within the confines of the window.
   * - **macOS:** The cursor is hidden as long as the window has input focus, even if the cursor is
   *   outside of the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setCursorVisible(false);
   * ```
   *
   * @param visible If `false`, this will hide the cursor. If `true`, this will show the cursor.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setCursorVisible(visible) {
    return invoke("plugin:window|set_cursor_visible", {
      label: this.label,
      value: visible
    });
  }
  /**
   * Modifies the cursor icon of the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setCursorIcon('help');
   * ```
   *
   * @param icon The new cursor icon.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setCursorIcon(icon) {
    return invoke("plugin:window|set_cursor_icon", {
      label: this.label,
      value: icon
    });
  }
  /**
   * Changes the position of the cursor in window coordinates.
   * @example
   * ```typescript
   * import { getCurrent, LogicalPosition } from '@tauri-apps/api/window';
   * await getCurrent().setCursorPosition(new LogicalPosition(600, 300));
   * ```
   *
   * @param position The new cursor position.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setCursorPosition(position) {
    if (!position || position.type !== "Logical" && position.type !== "Physical") {
      throw new Error(
        "the `position` argument must be either a LogicalPosition or a PhysicalPosition instance"
      );
    }
    return invoke("plugin:window|set_cursor_position", {
      label: this.label,
      value: {
        type: position.type,
        data: {
          x: position.x,
          y: position.y
        }
      }
    });
  }
  /**
   * Changes the cursor events behavior.
   *
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().setIgnoreCursorEvents(true);
   * ```
   *
   * @param ignore `true` to ignore the cursor events; `false` to process them as usual.
   * @returns A promise indicating the success or failure of the operation.
   */
  async setIgnoreCursorEvents(ignore) {
    return invoke("plugin:window|set_ignore_cursor_events", {
      label: this.label,
      value: ignore
    });
  }
  /**
   * Starts dragging the window.
   * @example
   * ```typescript
   * import { getCurrent } from '@tauri-apps/api/window';
   * await getCurrent().startDragging();
   * ```
   *
   * @return A promise indicating the success or failure of the operation.
   */
  async startDragging() {
    return invoke("plugin:window|start_dragging", {
      label: this.label
    });
  }
  /**
   * Sets the taskbar progress state.
   *
   * #### Platform-specific
   *
   * - **Linux / macOS**: Progress bar is app-wide and not specific to this window.
   * - **Linux**: Only supported desktop environments with `libunity` (e.g. GNOME).
   *
   * @example
   * ```typescript
   * import { getCurrent, ProgressBarStatus } from '@tauri-apps/api/window';
   * await getCurrent().setProgressBar({
   *   status: ProgressBarStatus.Normal,
   *   progress: 50,
   * });
   * ```
   *
   * @return A promise indicating the success or failure of the operation.
   */
  async setProgressBar(state) {
    return invoke("plugin:window|set_progress_bar", {
      label: this.label,
      value: state
    });
  }
  // Listeners
  /**
   * Listen to window resize.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * const unlisten = await getCurrent().onResized(({ payload: size }) => {
   *  console.log('Window resized', size);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async onResized(handler) {
    return this.listen("tauri://resize" /* WINDOW_RESIZED */, (e) => {
      e.payload = mapPhysicalSize(e.payload);
      handler(e);
    });
  }
  /**
   * Listen to window move.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * const unlisten = await getCurrent().onMoved(({ payload: position }) => {
   *  console.log('Window moved', position);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async onMoved(handler) {
    return this.listen("tauri://move" /* WINDOW_MOVED */, (e) => {
      e.payload = mapPhysicalPosition(e.payload);
      handler(e);
    });
  }
  /**
   * Listen to window close requested. Emitted when the user requests to closes the window.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * import { confirm } from '@tauri-apps/api/dialog';
   * const unlisten = await getCurrent().onCloseRequested(async (event) => {
   *   const confirmed = await confirm('Are you sure?');
   *   if (!confirmed) {
   *     // user did not confirm closing the window; let's prevent it
   *     event.preventDefault();
   *   }
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  /* eslint-disable @typescript-eslint/promise-function-async */
  async onCloseRequested(handler) {
    return this.listen("tauri://close-requested" /* WINDOW_CLOSE_REQUESTED */, (event) => {
      const evt = new CloseRequestedEvent(event);
      void Promise.resolve(handler(evt)).then(() => {
        if (!evt.isPreventDefault()) {
          return this.close();
        }
      });
    });
  }
  /* eslint-enable */
  /**
   * Listen to window focus change.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * const unlisten = await getCurrent().onFocusChanged(({ payload: focused }) => {
   *  console.log('Focus changed, window is focused? ' + focused);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async onFocusChanged(handler) {
    const unlistenFocus = await this.listen(
      "tauri://focus" /* WINDOW_FOCUS */,
      (event) => {
        handler({ ...event, payload: true });
      }
    );
    const unlistenBlur = await this.listen(
      "tauri://blur" /* WINDOW_BLUR */,
      (event) => {
        handler({ ...event, payload: false });
      }
    );
    return () => {
      unlistenFocus();
      unlistenBlur();
    };
  }
  /**
   * Listen to window scale change. Emitted when the window's scale factor has changed.
   * The following user actions can cause DPI changes:
   * - Changing the display's resolution.
   * - Changing the display's scale factor (e.g. in Control Panel on Windows).
   * - Moving the window to a display with a different scale factor.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * const unlisten = await getCurrent().onScaleChanged(({ payload }) => {
   *  console.log('Scale changed', payload.scaleFactor, payload.size);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async onScaleChanged(handler) {
    return this.listen(
      "tauri://scale-change" /* WINDOW_SCALE_FACTOR_CHANGED */,
      handler
    );
  }
  /**
   * Listen to a file drop event.
   * The listener is triggered when the user hovers the selected files on the window,
   * drops the files or cancels the operation.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * const unlisten = await getCurrent().onFileDropEvent((event) => {
   *  if (event.payload.type === 'hover') {
   *    console.log('User hovering', event.payload.paths);
   *  } else if (event.payload.type === 'drop') {
   *    console.log('User dropped', event.payload.paths);
   *  } else {
   *    console.log('File drop cancelled');
   *  }
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async onFileDropEvent(handler) {
    const unlistenFileDrop = await this.listen(
      "tauri://file-drop" /* WINDOW_FILE_DROP */,
      (event) => {
        handler({
          ...event,
          payload: {
            type: "drop",
            paths: event.payload.paths,
            position: mapPhysicalPosition(event.payload.position)
          }
        });
      }
    );
    const unlistenFileHover = await this.listen(
      "tauri://file-drop-hover" /* WINDOW_FILE_DROP_HOVER */,
      (event) => {
        handler({
          ...event,
          payload: {
            type: "hover",
            paths: event.payload.paths,
            position: mapPhysicalPosition(event.payload.position)
          }
        });
      }
    );
    const unlistenCancel = await this.listen(
      "tauri://file-drop-cancelled" /* WINDOW_FILE_DROP_CANCELLED */,
      (event) => {
        handler({ ...event, payload: { type: "cancel" } });
      }
    );
    return () => {
      unlistenFileDrop();
      unlistenFileHover();
      unlistenCancel();
    };
  }
  /**
   * Listen to the system theme change.
   *
   * @example
   * ```typescript
   * import { getCurrent } from "@tauri-apps/api/window";
   * const unlisten = await getCurrent().onThemeChanged(({ payload: theme }) => {
   *  console.log('New theme: ' + theme);
   * });
   *
   * // you need to call unlisten if your handler goes out of scope e.g. the component is unmounted
   * unlisten();
   * ```
   *
   * @returns A promise resolving to a function to unlisten to the event.
   * Note that removing the listener is required if your listener goes out of scope e.g. the component is unmounted.
   */
  async onThemeChanged(handler) {
    return this.listen("tauri://theme-changed" /* WINDOW_THEME_CHANGED */, handler);
  }
};
function mapPhysicalPosition(m) {
  return new PhysicalPosition(m.x, m.y);
}
function mapPhysicalSize(m) {
  return new PhysicalSize(m.width, m.height);
}

// tauri-plugins/plugins/window-state/guest-js/index.ts
var StateFlags = /* @__PURE__ */ ((StateFlags2) => {
  StateFlags2[StateFlags2["SIZE"] = 1] = "SIZE";
  StateFlags2[StateFlags2["POSITION"] = 2] = "POSITION";
  StateFlags2[StateFlags2["MAXIMIZED"] = 4] = "MAXIMIZED";
  StateFlags2[StateFlags2["VISIBLE"] = 8] = "VISIBLE";
  StateFlags2[StateFlags2["DECORATIONS"] = 16] = "DECORATIONS";
  StateFlags2[StateFlags2["FULLSCREEN"] = 32] = "FULLSCREEN";
  StateFlags2[StateFlags2["ALL"] = 63] = "ALL";
  return StateFlags2;
})(StateFlags || {});
async function saveWindowState(flags) {
  return invoke("plugin:window-state|save_window_state", { flags });
}
async function restoreState(label, flags) {
  return invoke("plugin:window-state|restore_state", { label, flags });
}
async function restoreStateCurrent(flags) {
  return restoreState(getCurrent().label, flags);
}
export {
  StateFlags,
  restoreState,
  restoreStateCurrent,
  saveWindowState
};

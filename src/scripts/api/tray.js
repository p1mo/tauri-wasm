// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once);
}
var Channel = class {
  constructor() {
    // @ts-expect-error field used by the IPC serializer
    this.__TAURI_CHANNEL_MARKER__ = true;
    this.#onmessage = () => {
    };
    this.id = transformCallback((response) => {
      this.#onmessage(response);
    });
  }
  #onmessage;
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

// tauri-v2/tooling/api/src/tray.ts
var TrayIcon = class _TrayIcon extends Resource {
  constructor(rid, id) {
    super(rid);
    this.id = id;
  }
  /**
   * Creates a new {@linkcode TrayIcon}
   *
   * #### Platform-specific:
   *
   * - **Linux:** Sometimes the icon won't be visible unless a menu is set.
   * Setting an empty {@linkcode Menu} is enough.
   */
  static async new(options) {
    if (options?.menu) {
      options.menu = [options.menu.rid, options.menu.kind];
    }
    if (options?.icon) {
      options.icon = typeof options.icon === "string" ? options.icon : Array.from(options.icon);
    }
    const handler = new Channel();
    if (options?.action) {
      handler.onmessage = options.action;
      delete options.action;
    }
    return invoke("plugin:tray|new", {
      options: options ?? {},
      handler
    }).then(([rid, id]) => new _TrayIcon(rid, id));
  }
  /** Sets a new tray icon. If `null` is provided, it will remove the icon. */
  async setIcon(icon) {
    let trayIcon = null;
    if (icon) {
      trayIcon = typeof icon === "string" ? icon : Array.from(icon);
    }
    return invoke("plugin:tray|set_icon", { rid: this.rid, icon: trayIcon });
  }
  /**
   * Sets a new tray menu.
   *
   * #### Platform-specific:
   *
   * - **Linux**: once a menu is set it cannot be removed so `null` has no effect
   */
  async setMenu(menu) {
    if (menu) {
      menu = [menu.rid, menu.kind];
    }
    return invoke("plugin:tray|set_menu", { rid: this.rid, menu });
  }
  /**
   * Sets the tooltip for this tray icon.
   *
   * ## Platform-specific:
   *
   * - **Linux:** Unsupported
   */
  async setTooltip(tooltip) {
    return invoke("plugin:tray|set_tooltip", { rid: this.rid, tooltip });
  }
  /**
   * Sets the tooltip for this tray icon.
   *
   * ## Platform-specific:
   *
   * - **Linux:** The title will not be shown unless there is an icon
   * as well.  The title is useful for numerical and other frequently
   * updated information.  In general, it shouldn't be shown unless a
   * user requests it as it can take up a significant amount of space
   * on the user's panel.  This may not be shown in all visualizations.
   * - **Windows:** Unsupported
   */
  async setTitle(title) {
    return invoke("plugin:tray|set_title", { rid: this.rid, title });
  }
  /** Show or hide this tray icon. */
  async setVisible(visible) {
    return invoke("plugin:tray|set_visible", { rid: this.rid, visible });
  }
  /**
   * Sets the tray icon temp dir path. **Linux only**.
   *
   * On Linux, we need to write the icon to the disk and usually it will
   * be `$XDG_RUNTIME_DIR/tray-icon` or `$TEMP/tray-icon`.
   */
  async setTempDirPath(path) {
    return invoke("plugin:tray|set_temp_dir_path", { rid: this.rid, path });
  }
  /** Sets the current icon as a [template](https://developer.apple.com/documentation/appkit/nsimage/1520017-template?language=objc). **macOS only** */
  async setIconAsTemplate(asTemplate) {
    return invoke("plugin:tray|set_icon_as_template", {
      rid: this.rid,
      asTemplate
    });
  }
  /** Disable or enable showing the tray menu on left click. **macOS only**. */
  async setMenuOnLeftClick(onLeft) {
    return invoke("plugin:tray|set_show_menu_on_left_click", {
      rid: this.rid,
      onLeft
    });
  }
};
export {
  TrayIcon
};

// tauri-v2/tooling/api/src/core.ts
function transformCallback(callback, once2 = false) {
  return window.__TAURI_INTERNALS__.transformCallback(callback, once2);
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

// tauri-v2/tooling/api/src/menu/base.ts
function injectChannel(i) {
  if ("items" in i) {
    i.items = i.items?.map(
      (item) => "rid" in item ? item : injectChannel(item)
    );
  } else if ("action" in i && i.action) {
    const handler = new Channel();
    handler.onmessage = i.action;
    delete i.action;
    return { ...i, handler };
  }
  return i;
}
async function newMenu(kind, opts) {
  const handler = new Channel();
  let items = null;
  if (opts && typeof opts === "object") {
    if ("action" in opts && opts.action) {
      handler.onmessage = opts.action;
      delete opts.action;
    }
    if ("items" in opts && opts.items) {
      items = opts.items.map((i) => {
        if ("rid" in i) {
          return [i.rid, i.kind];
        }
        return injectChannel(i);
      });
    }
  }
  return invoke("plugin:menu|new", {
    kind,
    options: opts ? { ...opts, items } : void 0,
    handler
  });
}
var MenuItemBase = class extends Resource {
  /** @ignore */
  #id;
  /** @ignore */
  #kind;
  /** The id of this item. */
  get id() {
    return this.#id;
  }
  /** @ignore */
  get kind() {
    return this.#kind;
  }
  /** @ignore */
  constructor(rid, id, kind) {
    super(rid);
    this.#id = id;
    this.#kind = kind;
  }
};

// tauri-v2/tooling/api/src/menu/menuItem.ts
var MenuItem = class _MenuItem extends MenuItemBase {
  /** @ignore */
  constructor(rid, id) {
    super(rid, id, "MenuItem");
  }
  /** Create a new menu item. */
  static async new(opts) {
    return newMenu("MenuItem", opts).then(([rid, id]) => new _MenuItem(rid, id));
  }
  /** Returns the text of this menu item. */
  async text() {
    return invoke("plugin:menu|text", { rid: this.rid, kind: this.kind });
  }
  /** Sets the text for this menu item. */
  async setText(text) {
    return invoke("plugin:menu|set_text", {
      rid: this.rid,
      kind: this.kind,
      text
    });
  }
  /** Returns whether this menu item is enabled or not. */
  async isEnabled() {
    return invoke("plugin:menu|is_enabled", { rid: this.rid, kind: this.kind });
  }
  /** Sets whether this menu item is enabled or not. */
  async setEnabled(enabled) {
    return invoke("plugin:menu|set_enabled", {
      rid: this.rid,
      kind: this.kind,
      enabled
    });
  }
  /** Sets the accelerator for this menu item. */
  async setAccelerator(accelerator) {
    return invoke("plugin:menu|set_accelerator", {
      rid: this.rid,
      kind: this.kind,
      accelerator
    });
  }
};

// tauri-v2/tooling/api/src/menu/checkMenuItem.ts
var CheckMenuItem = class _CheckMenuItem extends MenuItemBase {
  /** @ignore */
  constructor(rid, id) {
    super(rid, id, "Check");
  }
  /** Create a new check menu item. */
  static async new(opts) {
    return newMenu("Check", opts).then(
      ([rid, id]) => new _CheckMenuItem(rid, id)
    );
  }
  /** Returns the text of this check menu item. */
  async text() {
    return invoke("plugin:menu|text", { rid: this.rid, kind: this.kind });
  }
  /** Sets the text for this check menu item. */
  async setText(text) {
    return invoke("plugin:menu|set_text", {
      rid: this.rid,
      kind: this.kind,
      text
    });
  }
  /** Returns whether this check menu item is enabled or not. */
  async isEnabled() {
    return invoke("plugin:menu|is_enabled", { rid: this.rid, kind: this.kind });
  }
  /** Sets whether this check menu item is enabled or not. */
  async setEnabled(enabled) {
    return invoke("plugin:menu|set_enabled", {
      rid: this.rid,
      kind: this.kind,
      enabled
    });
  }
  /** Sets the accelerator for this check menu item. */
  async setAccelerator(accelerator) {
    return invoke("plugin:menu|set_accelerator", {
      rid: this.rid,
      kind: this.kind,
      accelerator
    });
  }
  /** Returns whether this check menu item is checked or not. */
  async isChecked() {
    return invoke("plugin:menu|is_checked", { rid: this.rid });
  }
  /** Sets whether this check menu item is checked or not. */
  async setChecked(checked) {
    return invoke("plugin:menu|set_checked", {
      rid: this.rid,
      checked
    });
  }
};

// tauri-v2/tooling/api/src/menu/iconMenuItem.ts
var NativeIcon = /* @__PURE__ */ ((NativeIcon2) => {
  NativeIcon2["Add"] = "Add";
  NativeIcon2["Advanced"] = "Advanced";
  NativeIcon2["Bluetooth"] = "Bluetooth";
  NativeIcon2["Bookmarks"] = "Bookmarks";
  NativeIcon2["Caution"] = "Caution";
  NativeIcon2["ColorPanel"] = "ColorPanel";
  NativeIcon2["ColumnView"] = "ColumnView";
  NativeIcon2["Computer"] = "Computer";
  NativeIcon2["EnterFullScreen"] = "EnterFullScreen";
  NativeIcon2["Everyone"] = "Everyone";
  NativeIcon2["ExitFullScreen"] = "ExitFullScreen";
  NativeIcon2["FlowView"] = "FlowView";
  NativeIcon2["Folder"] = "Folder";
  NativeIcon2["FolderBurnable"] = "FolderBurnable";
  NativeIcon2["FolderSmart"] = "FolderSmart";
  NativeIcon2["FollowLinkFreestanding"] = "FollowLinkFreestanding";
  NativeIcon2["FontPanel"] = "FontPanel";
  NativeIcon2["GoLeft"] = "GoLeft";
  NativeIcon2["GoRight"] = "GoRight";
  NativeIcon2["Home"] = "Home";
  NativeIcon2["IChatTheater"] = "IChatTheater";
  NativeIcon2["IconView"] = "IconView";
  NativeIcon2["Info"] = "Info";
  NativeIcon2["InvalidDataFreestanding"] = "InvalidDataFreestanding";
  NativeIcon2["LeftFacingTriangle"] = "LeftFacingTriangle";
  NativeIcon2["ListView"] = "ListView";
  NativeIcon2["LockLocked"] = "LockLocked";
  NativeIcon2["LockUnlocked"] = "LockUnlocked";
  NativeIcon2["MenuMixedState"] = "MenuMixedState";
  NativeIcon2["MenuOnState"] = "MenuOnState";
  NativeIcon2["MobileMe"] = "MobileMe";
  NativeIcon2["MultipleDocuments"] = "MultipleDocuments";
  NativeIcon2["Network"] = "Network";
  NativeIcon2["Path"] = "Path";
  NativeIcon2["PreferencesGeneral"] = "PreferencesGeneral";
  NativeIcon2["QuickLook"] = "QuickLook";
  NativeIcon2["RefreshFreestanding"] = "RefreshFreestanding";
  NativeIcon2["Refresh"] = "Refresh";
  NativeIcon2["Remove"] = "Remove";
  NativeIcon2["RevealFreestanding"] = "RevealFreestanding";
  NativeIcon2["RightFacingTriangle"] = "RightFacingTriangle";
  NativeIcon2["Share"] = "Share";
  NativeIcon2["Slideshow"] = "Slideshow";
  NativeIcon2["SmartBadge"] = "SmartBadge";
  NativeIcon2["StatusAvailable"] = "StatusAvailable";
  NativeIcon2["StatusNone"] = "StatusNone";
  NativeIcon2["StatusPartiallyAvailable"] = "StatusPartiallyAvailable";
  NativeIcon2["StatusUnavailable"] = "StatusUnavailable";
  NativeIcon2["StopProgressFreestanding"] = "StopProgressFreestanding";
  NativeIcon2["StopProgress"] = "StopProgress";
  NativeIcon2["TrashEmpty"] = "TrashEmpty";
  NativeIcon2["TrashFull"] = "TrashFull";
  NativeIcon2["User"] = "User";
  NativeIcon2["UserAccounts"] = "UserAccounts";
  NativeIcon2["UserGroup"] = "UserGroup";
  NativeIcon2["UserGuest"] = "UserGuest";
  return NativeIcon2;
})(NativeIcon || {});
var IconMenuItem = class _IconMenuItem extends MenuItemBase {
  /** @ignore */
  constructor(rid, id) {
    super(rid, id, "Icon");
  }
  /** Create a new icon menu item. */
  static async new(opts) {
    return newMenu("Icon", opts).then(([rid, id]) => new _IconMenuItem(rid, id));
  }
  /** Returns the text of this icon menu item. */
  async text() {
    return invoke("plugin:menu|text", { rid: this.rid, kind: this.kind });
  }
  /** Sets the text for this icon menu item. */
  async setText(text) {
    return invoke("plugin:menu|set_text", {
      rid: this.rid,
      kind: this.kind,
      text
    });
  }
  /** Returns whether this icon menu item is enabled or not. */
  async isEnabled() {
    return invoke("plugin:menu|is_enabled", { rid: this.rid, kind: this.kind });
  }
  /** Sets whether this icon menu item is enabled or not. */
  async setEnabled(enabled) {
    return invoke("plugin:menu|set_enabled", {
      rid: this.rid,
      kind: this.kind,
      enabled
    });
  }
  /** Sets the accelerator for this icon menu item. */
  async setAccelerator(accelerator) {
    return invoke("plugin:menu|set_accelerator", {
      rid: this.rid,
      kind: this.kind,
      accelerator
    });
  }
  /** Sets an icon for this icon menu item */
  async setIcon(icon) {
    return invoke("plugin:menu|set_icon", { rid: this.rid, icon });
  }
};

// tauri-v2/tooling/api/src/menu/predefinedMenuItem.ts
var PredefinedMenuItem = class _PredefinedMenuItem extends MenuItemBase {
  /** @ignore */
  constructor(rid, id) {
    super(rid, id, "Predefined");
  }
  /** Create a new predefined menu item. */
  static async new(opts) {
    return newMenu("Predefined", opts).then(
      ([rid, id]) => new _PredefinedMenuItem(rid, id)
    );
  }
  /** Returns the text of this predefined menu item. */
  async text() {
    return invoke("plugin:menu|text", { rid: this.rid, kind: this.kind });
  }
  /** Sets the text for this predefined menu item. */
  async setText(text) {
    return invoke("plugin:menu|set_text", {
      rid: this.rid,
      kind: this.kind,
      text
    });
  }
};

// tauri-v2/tooling/api/src/dpi.ts
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

// tauri-v2/tooling/api/src/menu/submenu.ts
function itemFromKind([rid, id, kind]) {
  switch (kind) {
    case "Submenu":
      return new Submenu(rid, id);
    case "Predefined":
      return new PredefinedMenuItem(rid, id);
    case "Check":
      return new CheckMenuItem(rid, id);
    case "Icon":
      return new IconMenuItem(rid, id);
    case "MenuItem":
    default:
      return new MenuItem(rid, id);
  }
}
var Submenu = class _Submenu extends MenuItemBase {
  /** @ignore */
  constructor(rid, id) {
    super(rid, id, "Submenu");
  }
  /** Create a new submenu. */
  static async new(opts) {
    return newMenu("Submenu", opts).then(([rid, id]) => new _Submenu(rid, id));
  }
  /** Returns the text of this submenu. */
  async text() {
    return invoke("plugin:menu|text", { rid: this.rid, kind: this.kind });
  }
  /** Sets the text for this submenu. */
  async setText(text) {
    return invoke("plugin:menu|set_text", {
      rid: this.rid,
      kind: this.kind,
      text
    });
  }
  /** Returns whether this submenu is enabled or not. */
  async isEnabled() {
    return invoke("plugin:menu|is_enabled", { rid: this.rid, kind: this.kind });
  }
  /** Sets whether this submenu is enabled or not. */
  async setEnabled(enabled) {
    return invoke("plugin:menu|set_enabled", {
      rid: this.rid,
      kind: this.kind,
      enabled
    });
  }
  /**
   * Add a menu item to the end of this submenu.
   *
   * ## Platform-spcific:
   *
   * - **macOS:** Only {@linkcode Submenu}s can be added to a {@linkcode Menu}.
   */
  async append(items) {
    return invoke("plugin:menu|append", {
      rid: this.rid,
      kind: this.kind,
      items: (Array.isArray(items) ? items : [items]).map(
        (i) => "rid" in i ? [i.rid, i.kind] : i
      )
    });
  }
  /**
   * Add a menu item to the beginning of this submenu.
   *
   * ## Platform-spcific:
   *
   * - **macOS:** Only {@linkcode Submenu}s can be added to a {@linkcode Menu}.
   */
  async prepend(items) {
    return invoke("plugin:menu|prepend", {
      rid: this.rid,
      kind: this.kind,
      items: (Array.isArray(items) ? items : [items]).map(
        (i) => "rid" in i ? [i.rid, i.kind] : i
      )
    });
  }
  /**
   * Add a menu item to the specified position in this submenu.
   *
   * ## Platform-spcific:
   *
   * - **macOS:** Only {@linkcode Submenu}s can be added to a {@linkcode Menu}.
   */
  async insert(items, position) {
    return invoke("plugin:menu|insert", {
      rid: this.rid,
      kind: this.kind,
      items: (Array.isArray(items) ? items : [items]).map(
        (i) => "rid" in i ? [i.rid, i.kind] : i
      ),
      position
    });
  }
  /** Remove a menu item from this submenu. */
  async remove(item) {
    return invoke("plugin:menu|remove", {
      rid: this.rid,
      kind: this.kind,
      item: [item.rid, item.kind]
    });
  }
  /** Remove a menu item from this submenu at the specified position. */
  async removeAt(position) {
    return invoke("plugin:menu|remove_at", {
      rid: this.rid,
      kind: this.kind,
      position
    }).then(itemFromKind);
  }
  /** Returns a list of menu items that has been added to this submenu. */
  async items() {
    return invoke("plugin:menu|items", {
      rid: this.rid,
      kind: this.kind
    }).then((i) => i.map(itemFromKind));
  }
  /** Retrieves the menu item matching the given identifier. */
  async get(id) {
    return invoke("plugin:menu|get", {
      rid: this.rid,
      kind: this.kind,
      id
    }).then((r) => r ? itemFromKind(r) : null);
  }
  /**
   * Popup this submenu as a context menu on the specified window.
   *
   * If the position, is provided, it is relative to the window's top-left corner.
   */
  async popup(at, window2) {
    let atValue = null;
    if (at) {
      atValue = {
        type: at instanceof PhysicalPosition ? "Physical" : "Logical",
        data: at
      };
    }
    return invoke("plugin:menu|popup", {
      rid: this.rid,
      kind: this.kind,
      window: window2?.label ?? null,
      at: atValue
    });
  }
  /**
   * Set this submenu as the Window menu for the application on macOS.
   *
   * This will cause macOS to automatically add window-switching items and
   * certain other items to the menu.
   *
   * #### Platform-specific:
   *
   * - **Windows / Linux**: Unsupported.
   */
  async setAsWindowsMenuForNSApp() {
    return invoke("plugin:menu|set_as_windows_menu_for_nsapp", {
      rid: this.rid
    });
  }
  /**
   * Set this submenu as the Help menu for the application on macOS.
   *
   * This will cause macOS to automatically add a search box to the menu.
   *
   * If no menu is set as the Help menu, macOS will automatically use any menu
   * which has a title matching the localized word "Help".
   *
   * #### Platform-specific:
   *
   * - **Windows / Linux**: Unsupported.
   */
  async setAsHelpMenuForNSApp() {
    return invoke("plugin:menu|set_as_help_menu_for_nsapp", {
      rid: this.rid
    });
  }
};

// tauri-v2/tooling/api/src/menu/menu.ts
function itemFromKind2([rid, id, kind]) {
  switch (kind) {
    case "Submenu":
      return new Submenu(rid, id);
    case "Predefined":
      return new PredefinedMenuItem(rid, id);
    case "Check":
      return new CheckMenuItem(rid, id);
    case "Icon":
      return new IconMenuItem(rid, id);
    case "MenuItem":
    default:
      return new MenuItem(rid, id);
  }
}
var Menu = class _Menu extends MenuItemBase {
  /** @ignore */
  constructor(rid, id) {
    super(rid, id, "Menu");
  }
  /** Create a new menu. */
  static async new(opts) {
    return newMenu("Menu", opts).then(([rid, id]) => new _Menu(rid, id));
  }
  /** Create a default menu. */
  static async default() {
    return invoke("plugin:menu|create_default").then(
      ([rid, id]) => new _Menu(rid, id)
    );
  }
  /**
   * Add a menu item to the end of this menu.
   *
   * ## Platform-spcific:
   *
   * - **macOS:** Only {@linkcode Submenu}s can be added to a {@linkcode Menu}.
   */
  async append(items) {
    return invoke("plugin:menu|append", {
      rid: this.rid,
      kind: this.kind,
      items: (Array.isArray(items) ? items : [items]).map(
        (i) => "rid" in i ? [i.rid, i.kind] : i
      )
    });
  }
  /**
   * Add a menu item to the beginning of this menu.
   *
   * ## Platform-spcific:
   *
   * - **macOS:** Only {@linkcode Submenu}s can be added to a {@linkcode Menu}.
   */
  async prepend(items) {
    return invoke("plugin:menu|prepend", {
      rid: this.rid,
      kind: this.kind,
      items: (Array.isArray(items) ? items : [items]).map(
        (i) => "rid" in i ? [i.rid, i.kind] : i
      )
    });
  }
  /**
   * Add a menu item to the specified position in this menu.
   *
   * ## Platform-spcific:
   *
   * - **macOS:** Only {@linkcode Submenu}s can be added to a {@linkcode Menu}.
   */
  async insert(items, position) {
    return invoke("plugin:menu|insert", {
      rid: this.rid,
      kind: this.kind,
      items: (Array.isArray(items) ? items : [items]).map(
        (i) => "rid" in i ? [i.rid, i.kind] : i
      ),
      position
    });
  }
  /** Remove a menu item from this menu. */
  async remove(item) {
    return invoke("plugin:menu|remove", {
      rid: this.rid,
      kind: this.kind,
      item: [item.rid, item.kind]
    });
  }
  /** Remove a menu item from this menu at the specified position. */
  async removeAt(position) {
    return invoke("plugin:menu|remove_at", {
      rid: this.rid,
      kind: this.kind,
      position
    }).then(itemFromKind2);
  }
  /** Returns a list of menu items that has been added to this menu. */
  async items() {
    return invoke("plugin:menu|items", {
      rid: this.rid,
      kind: this.kind
    }).then((i) => i.map(itemFromKind2));
  }
  /** Retrieves the menu item matching the given identifier. */
  async get(id) {
    return invoke("plugin:menu|get", {
      rid: this.rid,
      kind: this.kind,
      id
    }).then((r) => r ? itemFromKind2(r) : null);
  }
  /**
   * Popup this menu as a context menu on the specified window.
   *
   * If the position, is provided, it is relative to the window's top-left corner.
   */
  async popup(at, window2) {
    let atValue = null;
    if (at) {
      atValue = {
        type: at instanceof PhysicalPosition ? "Physical" : "Logical",
        data: at
      };
    }
    return invoke("plugin:menu|popup", {
      rid: this.rid,
      kind: this.kind,
      window: window2?.label ?? null,
      at: atValue
    });
  }
  /**
   * Sets the app-wide menu and returns the previous one.
   *
   * If a window was not created with an explicit menu or had one set explicitly,
   * this menu will be assigned to it.
   */
  async setAsAppMenu() {
    return invoke("plugin:menu|set_as_app_menu", {
      rid: this.rid
    }).then((r) => r ? new _Menu(r[0], r[1]) : null);
  }
  /**
   * Sets the window menu and returns the previous one.
   *
   * #### Platform-specific:
   *
   * - **macOS:** Unsupported. The menu on macOS is app-wide and not specific to one
   * window, if you need to set it, use {@linkcode Menu.setAsAppMenu} instead.
   */
  async setAsWindowMenu(window2) {
    return invoke("plugin:menu|set_as_window_menu", {
      rid: this.rid,
      window: window2?.label ?? null
    }).then((r) => r ? new _Menu(r[0], r[1]) : null);
  }
};
export {
  CheckMenuItem,
  IconMenuItem,
  Menu,
  MenuItem,
  NativeIcon,
  PredefinedMenuItem,
  Submenu
};

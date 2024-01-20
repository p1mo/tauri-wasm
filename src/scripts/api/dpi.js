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
export {
  LogicalPosition,
  LogicalSize,
  PhysicalPosition,
  PhysicalSize
};

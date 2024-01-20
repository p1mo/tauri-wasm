// tauri-v2/tooling/api/src/core.ts
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
export {
  Position,
  moveWindow
};

//! 
//! Version: **autostart-v2.0.0-rc.0**
//! 
//! link to plugin: [tauri-plugin-autostart](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/autostart)
//!

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn disable() -> crate::Result<()> {
    let raw = base::disable().await?;

    Ok(raw)
}

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn enable() -> crate::Result<()> {
    let raw = base::enable().await?;

    Ok(raw)
}

/// Returns a bool checking if autostart is enabled.
#[inline(always)]
pub async fn is_enabled() -> crate::Result<bool> {
    let raw = base::is_enabled().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

mod base {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(module = "/src/scripts/plugins/autostart.js")]
    extern "C" {
        #[wasm_bindgen(catch)]
        pub async fn disable() -> Result<(), JsValue>;
        #[wasm_bindgen(catch)]
        pub async fn enable() -> Result<(), JsValue>;
        #[wasm_bindgen(catch, js_name = "isEnabled")]
        pub async fn is_enabled() -> Result<JsValue, JsValue>;
    }
}
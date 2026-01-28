//! 
//! Version: **opener-v2.5.3**
//! 
//! link to plugin: [tauri-plugin-opener](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/opener)
//!


/// Returns the binary extension.
#[inline(always)]
pub async fn open_path(path: String, with: Option<String>) -> crate::Result<()> {
    let raw = base::open_path(path, with).await?;
    Ok(serde_wasm_bindgen::from_value(raw)?)
}



/// Returns the operating system Hostname.
#[inline(always)]
pub async fn open_url(path: String, with: Option<String>) -> crate::Result<()> {
    let raw = base::open_url(path, with).await?;
    Ok(serde_wasm_bindgen::from_value(raw)?)
}

/// Returns the operating system Local.
#[inline(always)]
pub async fn reveal_item_in_dir(path: String) -> crate::Result<()> {
    let raw = base::reveal_item_in_dir(path).await?;
    Ok(serde_wasm_bindgen::from_value(raw)?)
}

mod base {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(module = "/src/scripts/plugins/opener.js")]
    extern "C" {
        #[wasm_bindgen(catch, js_name = "openPath")]
        pub async fn open_path(path: String, with: Option<String>) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "openUrl")]
        pub async fn open_url(url: String, with: Option<String>) -> Result<JsValue, JsValue>;
        #[wasm_bindgen(catch, js_name = "revealItemInDir")]
        pub async fn reveal_item_in_dir(path: String) -> Result<JsValue, JsValue>;
    }
}

#[inline(always)]
pub async fn get_matches() -> crate::Result<bool> {
    let raw = base::get_matches().await?;

    Ok(serde_wasm_bindgen::from_value(raw)?)
}

mod base {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen(module = "/src/scripts/plugins/cli.js")]
    extern "C" {
        #[wasm_bindgen(catch, js_name = "getMatches")]
        pub async fn get_matches() -> Result<JsValue, JsValue>;
    }
}
pub mod console {
    use wasm_bindgen::prelude::*;

    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = console, js_name = clear)]
        pub fn clear();
        #[wasm_bindgen(js_namespace = console, js_name = debug)]
        pub fn debug(s: &str);
        #[wasm_bindgen(js_namespace = console, js_name = error)]
        pub fn error(s: &str);
        #[wasm_bindgen(js_namespace = console, js_name = info)]
        pub fn info(s: &str);
        #[wasm_bindgen(js_namespace = console, js_name = log)]
        pub fn log(s: &str);
        #[wasm_bindgen(js_namespace = console, js_name = warn)]
        pub fn warn(s: &str);
    }
}
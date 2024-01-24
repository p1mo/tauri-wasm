#! node

import { build } from "esbuild";

import * as tools from "./build-tools.js";

const DIR_API       = "tauri-v2/tooling/api/src";
const DIR_PLUGINS   = "tauri-plugins/plugins";

const OUT_API       = "src/scripts/api";
const OUT_PLUGINS   = "src/scripts/plugins";

const REPLACEMENTS  = [
    [ "@tauri-apps/api/core",   "tauri-v2/tooling/api/src/core.ts"   ],
    [ "@tauri-apps/api/path",   "tauri-v2/tooling/api/src/path.ts"   ],
    [ "@tauri-apps/api/event",  "tauri-v2/tooling/api/src/event.ts"  ],
    [ "@tauri-apps/api/window", "tauri-v2/tooling/api/src/window.ts" ]
];

const ESBUILD_CONF  = {
    logLevel    : "info",
    bundle      : true,
    format      : "esm",
    //platform    : "browser",
    loader      : { ".ts" : "ts" }
};


try {

    const BUILD_START = new Date();
    
    //await tools.deleteDirs([ OUT_API, OUT_PLUGINS ]);

    console.log("[build] API started.");
    
    await build(Object.assign(ESBUILD_CONF, {
        entryPoints : await tools.readers.api(DIR_API),
        outdir      : OUT_API,
    }));
    
    console.log("\n[build] PLUGINS started.");
    
    await build(Object.assign(ESBUILD_CONF, {
        entryPoints : await tools.readers.plugins(DIR_PLUGINS),
        outdir      : OUT_PLUGINS,
        plugins     : [ tools.replaceImports(REPLACEMENTS) ]
    }));
    
    // END
    console.log("\nTotal size:", tools.formatBytes((await tools.dirSize(OUT_API)) + (await tools.dirSize(OUT_PLUGINS))));  
    console.log("Finshed in:", tools.formatMS((new Date()) - BUILD_START), "\n");

} catch (error) {

    console.error("Error:", error);
    process.exit(1);

}
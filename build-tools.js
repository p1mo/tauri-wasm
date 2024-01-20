import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { existsSync } from 'node:fs';
import { readdir, rm, stat } from 'node:fs/promises';

const makePath = (name = "") => {
    return join(dirname(fileURLToPath(import.meta.url)), name);
};

export const readers = {
    api : async (source = "", r = []) => {
        let ts_files = (await readdir(source)).map(name => {
            const path = join(source, name);
            if(!existsSync(path)) return null;
            if(!path.endsWith(".ts")) return null;
            if(path.includes("index.ts")) return null;
            if(path.includes("global.d.ts")) return null;
            return [ name.replace(".ts", ""), path ];
        }).filter(v => v !== null);
        for (let i = 0; i < ts_files.length; i++) {
            r.push({ out : ts_files[i][0], in : ts_files[i][1] })      
        }
        return r;
    },
    plugins : async (source = "", r = []) => {
        let ts_files = (await readdir(source)).map(name => {
            const path = join(source, name, "guest-js/index.ts");
            if(existsSync(path)){
                return [ name, path ];
            }
        }).filter(v => v !== undefined);
        for (let i = 0; i < ts_files.length; i++) {
            r.push({ out : ts_files[i][0], in : ts_files[i][1] })      
        }
        return r;
    }
};

export const replaceImports = function (replacements = []) {
    return {
        name: 'replacer',
        setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
                for (const [ f, t ] of replacements) {
                    if (args.path.includes(f)) {
                        return { path : args.path.replace(f, makePath(t)) };
                    }
                }
            });
        },
    };
};

export const deleteDirs = async (dirs = [], log = true) => {
    for (const dir of dirs) {
        if(existsSync(dir)){
            await rm(dir, { recursive: true, force: true });
            if(log) console.log(`[deleted][${!existsSync(dir)}]`, dir);
        }
    }
};



// Not Important

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

export const dirSize = async (folderPath) => {
    let totalSize = 0;
    try {
        const files = await readdir(folderPath);
        for (const file of files) {
            const filePath = join(folderPath, file);
            const stats = await stat(filePath);
            if (stats.isDirectory()) {
                totalSize += await dirSize(filePath);
            } else {
                totalSize += stats.size;
            }
        }
        return totalSize;
    } catch (err) {
        throw err;
    }
};

export const formatMS = (milli) => {
    if (isNaN(milli) || milli < 0) {
        return 'Invalid input';
    }
    return [
        { label: 'h',   ms: 3600000 },
        { label: 'min', ms: 60000 },
        { label: 'sec', ms: 1000 },
        { label: 'ms',  ms: 1 }
    ].map(({ label, ms }) => {
        const value = Math.floor(milli / ms);
        if (value) {
            milli %= ms;
            return `${value} ${label}`;
        }
    }).filter(Boolean).join(', ');
};
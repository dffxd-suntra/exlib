import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import cleanup from "rollup-plugin-cleanup";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import pkgInfo from "./package.json" assert { type: "json" };

export default {
    input: pkgInfo.main,
    output: {
        name: "Exlib",
        file: "dist/exlib.min.js",
        format: "umd"
    },
    plugins: [
        json(),
        typescript(),
        commonjs(),
        nodeResolve(),
        terser(),
        cleanup({ comments: "none" })
    ]
};
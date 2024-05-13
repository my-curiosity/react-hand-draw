import { defineConfig } from "vite";
import { resolve } from "path";
import { patchCssModules } from "vite-css-modules";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        patchCssModules(),
        libInjectCss(),
        react(),
        dts({ include: ["lib"], rollupTypes: true })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "lib/main.ts"),
            formats: ["es"]
        },
        rollupOptions: {
            external: ["react", "react/jsx-runtime"]
        },
        copyPublicDir: false
    }
});

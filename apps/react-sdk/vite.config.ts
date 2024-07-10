import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // 컴포넌트 타입 생성
    }),
    tsconfigPaths(),
  ],
  build: {
    lib: {
      entry: "src/index.tsx",
      name: "react-sdk",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      output: {
        format: "es",
        name: "react-sdk",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});

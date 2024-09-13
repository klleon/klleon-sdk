import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import litcss from 'rollup-plugin-lit-css';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true, // 컴포넌트 타입 생성
    }),
    litcss({
      include: ['**/*.css'],
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'KlleonSDK',
      formats: ['umd'],
      fileName: (format) => `klleon-sdk.${format}.js`,
    },
  }
})

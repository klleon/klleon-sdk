import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true, // 컴포넌트 타입 생성
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

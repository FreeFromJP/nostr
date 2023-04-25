import typescript from '@rollup/plugin-typescript';
import {uglify} from 'rollup-plugin-uglify'

export default {
  input: 'src/index.ts',
  output: {
      file: 'dist/src/index.js',
      format: 'es'
  },
  plugins: [typescript({ module: 'esnext' }), uglify()]
};

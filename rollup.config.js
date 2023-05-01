/* eslint no-use-before-define: 0 */
import typescript from '@rollup/plugin-typescript'
import { uglify } from 'rollup-plugin-uglify'
import del from 'rollup-plugin-delete'

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'es',
    },
    external: ['nostr-tools'],
    plugins: [
        typescript({
            module: 'esnext',
            exclude: ['node_modules/**', 'test/*', 'testHelper/*'],
        }),
        uglify({
            compress: {
                drop_console: true,
            },
            output: {
                beautify: true,
            },
        }),
        del({ targets: 'dist/*' }),
    ],
}

import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import ignore from 'rollup-plugin-ignore'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/nomnoml.js',
    format: 'umd',
    name: 'nomnoml',
    globals: { graphre: 'graphre' },
  },
  external: ['graphre'],
  plugins: [
    ignore(['fs', 'path', 'ignore']),
    typescript({
      target: 'es2021',
      removeComments: true,
      noUnusedLocals: true,
      noImplicitAny: true,
      strictNullChecks: true,
      moduleResolution: 'node',
      sourceMap: true,
      include: ['src/*.ts'],
    }),
    nodeResolve(),
    commonjs({ include: ['dist/**'] }),
  ],
}

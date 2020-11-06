import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import ignore from "rollup-plugin-ignore";

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/nomnoml.js',
    format: 'umd',
    name: 'nomnoml',
    globals: { 'graphre': 'graphre' }
  },
  external: ['graphre'],
  plugins: [
    ignore(['fs', 'path', 'ignore']),
    typescript({
      target: 'es6',
      removeComments: true,
      noUnusedLocals: true,
      noImplicitAny: true,
      noUnusedLocals: true,
      removeComments: true,
      moduleResolution: 'node'
    }),
    nodeResolve(),
    commonjs({ include: ['dist/**'] })
  ]
};
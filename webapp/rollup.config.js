import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import ignore from 'rollup-plugin-ignore'
import gitVersion from 'rollup-plugin-git-version'

export default {
  input: 'webapp/index.ts',
  external: ['react', 'react-dom', 'jszip'],
  output: {
    file: 'dist/webapp.js',
    format: 'iife',
    name: 'WebApp',
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      jszip: 'JSZip',
    },
  },
  plugins: [
    ignore(['fs', 'path']),
    typescript({
      module: 'es6',
      target: 'es2020',
      noUnusedLocals: true,
      noImplicitAny: true,
      strictNullChecks: true,
      jsx: 'react',
    }),
    gitVersion(),
    nodeResolve({ preferBuiltins: true }),
    commonjs({ include: ['node_modules/**', 'dist/**'] }),
    terser({ output: { comments: false } }),
  ],
}

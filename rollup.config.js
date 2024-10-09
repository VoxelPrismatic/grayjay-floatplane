const resolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const copy = require('rollup-plugin-copy');
const del = require('rollup-plugin-delete');

const dest = './build'; // Output folder

module.exports = {
  input: 'src/Grayjay.ts', // Entry file
  output: {
    file: `${dest}/FloatplaneScript.js`,
    format: 'cjs', // Use IIFE format for browser compatibility
    sourcemap: false
  },
  plugins: [
    del({ targets: `${dest}/*` }), // Clean up the dist folder before building
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    copy({
      targets: [
        { src: 'FloatplaneConfig.json', dest },
        { src: 'floatplane.png', dest }
      ]
    })
  ]
};

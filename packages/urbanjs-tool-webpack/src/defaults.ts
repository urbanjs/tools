import {isAbsolute, join} from 'path';
import {GlobalConfiguration} from 'urbanjs-tools-core';
import * as minimatch from 'minimatch';
import {WebpackConfig} from './types';

export function getDefaults(globals: GlobalConfiguration): WebpackConfig {
  const processCwd = process.cwd();

  const jsLoaders = [];
  const tsLoaders = [];

  if (globals.babel !== false) {
    const babelLoader = {
      loader: require.resolve('babel-loader'),
      options: globals.babel
    };

    tsLoaders.push(babelLoader);
    jsLoaders.push(babelLoader);
  }

  if (globals.typescript !== false) {
    tsLoaders.push({
      loader: require.resolve('ts-loader'),
      options: {
        compilerOptions: globals.typescript
      }
    });
  }

  return {
    clean: true,
    cache: true,
    context: processCwd,
    entry: './src',

    output: {
      path: join(processCwd, 'dist'),
      filename: 'index.js',
      libraryTarget: 'commonjs'
    },

    target: 'node',
    devtool: 'source-map', // generate production supported source map

    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false
    },

    plugins: [],

    resolve: {
      extensions: ['.js', '.ts', '.tsx']
    },

    resolveLoader: {
      modules: [// used loaders might have dependencies installed only in urbanjs
        'node_modules/urbanjs-tools/node_modules',
        'node_modules'
      ]
    },

    externals: [
      (context, request, callback) => {
        const isSourceFile = isAbsolute(request) || /^\..+/.test(request);
        callback(null, !isSourceFile);
      }
    ],

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: (filePath) => globals.ignoredSourceFiles.some(glob => minimatch(filePath, glob)),
          use: tsLoaders
        },
        {
          test: /\.js$/,
          exclude: (filePath) => globals.ignoredSourceFiles.some(glob => minimatch(filePath, glob)),
          use: jsLoaders
        }
      ]
    }
  };
}

'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.webpack.register(gulp, 'webpack', {
  entry: './index.js',
  output: {
    path: './dist',
    filename: 'index.js',
    libraryTarget: 'commonjs'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [{
        loader: require.resolve('babel-loader'),
        options: { presets: ['babel-preset-es2015'] }
      }]
    }]
  }
});

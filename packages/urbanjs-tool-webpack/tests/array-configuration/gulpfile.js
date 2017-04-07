'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.webpack.register(gulp, 'webpack', [
  {
    entry: './index.js',
    output: {
      path: './dist',
      filename: 'index.js',
      libraryTarget: 'commonjs'
    }
  },
  {
    entry: './index.js',
    output: {
      path: './dist',
      filename: 'index2.js',
      libraryTarget: 'commonjs'
    }
  }
]);
'use strict';

const gulp = require('gulp');
const task = require('../../index');

task.register(gulp, 'npmInstall', {
  global: true,
  dependencies: {
    'node-uuid': '1.4.7'
  }
});
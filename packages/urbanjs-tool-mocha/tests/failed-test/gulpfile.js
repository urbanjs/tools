'use strict';

const gulp = require('gulp');
const tools = require('@tamasmagedli/urbanjs-tools');

tools.tasks.mocha.register(gulp, 'mocha', {
  files: 'index-test.js'
});

'use strict';

const _ = require('lodash');
const del = require('del');
const npmInstall = require('./npm-install');
const pkg = require('../package.json');
const utils = require('./lib/utils');

function buildConfig(parameters, globals) {
  const defaults = require('./jest-defaults');

  if (globals && !globals.babel) {
    globals.babel = require('./lib/global-babel');
  }

  return utils.mergeParameters(defaults, parameters);
}

/**
 * @module tasks/jest
 */
module.exports = {

  /**
   * @function
   * @description This task is responsible for running the jest unit tests.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/jest.Parameters} parameters The parameters of the task
   * @param {Object} [globals] The global configuration store of the tasks
   *                           Globals are used to set up defaults
   * @param {Object} globals.babel The babel configuration to use in babel-loader
   *
   * @example
   * register(
   *   require('gulp'),
   *   'jest',
   *   { rootDir: require('path').join(__dirname + 'src') }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    const installDependenciesTaskName = taskName + '-install-dependencies';
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: _.pick(pkg.devDependencies, [
        'babel-core',
        'babel-polyfill',
        'babel-preset-es2015',
        'babel-preset-react',
        'babel-preset-stage-0',
        'jest-cli'
      ])
    });

    const cleanUpTaskName = taskName + '-clean';
    gulp.task(cleanUpTaskName, [installDependenciesTaskName], (done) => {
      del(['coverage'], { force: true }).then(() => {
        done();
      });
    });

    gulp.task(taskName, [installDependenciesTaskName, cleanUpTaskName], (done) => {
      const jest = require('jest-cli');
      const config = buildConfig(parameters, globals);

      jest.runCLI(
        { config },
        config.rootDir,
        success => done(!success)
      );
    });
  }
};

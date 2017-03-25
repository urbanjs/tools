'use strict';

const _ = require('lodash');
const npmInstall = require('../npm-install/index');
const path = require('path');
const pkg = require('../../../package.json');
const configHelper = require('../../utils/helper-config');
const streamHelper = require('../../utils/helper-stream');
const dependencyHelper = require('../../utils/helper-dependencies');

function buildConfig(parameters, globals, processOptionPrefix) {
  const defaults = require('./defaults');

  if (globals.sourceFiles) {
    defaults.files = globals.sourceFiles;
  } else {
    globals.sourceFiles = defaults.files; // eslint-disable-line no-param-reassign
  }

  return configHelper.mergeParameters(defaults, parameters, processOptionPrefix);
}

/**
 * @module tasks/eslint
 */
module.exports = {

  dependencies: _.pick(pkg.devDependencies,
    [
      'babel-eslint',
      'eslint-config-airbnb',
      'eslint-plugin-import',
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-react',
      'gulp-eslint'
    ].concat(
      dependencyHelper.streamHelper
    )
  ),

  /**
   * @function
   * @description This task is responsible for linting JS.
   *
   * @param {external:gulp} gulp The gulp instance to use
   * @param {string} taskName The name of the task
   * @param {module:tasks/eslint.Parameters} parameters The parameters of the task
   * @param {module:main.GlobalConfiguration} [globals] The global configuration
   *
   * @example
   * register(
   *   require('gulp'),
   *   'eslint',
   *   {
    *     configFile: require('path').join(__dirname + '.eslintrc'),
    *     extensions: ['.js'],
    *     files: require('path').join(__dirname, 'src/*.js')
    *   }
   * );
   */
  register(gulp, taskName, parameters, globals) {
    globals = globals || {}; // eslint-disable-line no-param-reassign

    const installDependenciesTaskName = `${taskName}-install-dependencies`;
    npmInstall.register(gulp, installDependenciesTaskName, {
      dependencies: this.dependencies
    }, globals);

    const validate = (config) => {
      const eslint = require('gulp-eslint');

      const stream = gulp.src(config.files)
        .pipe(streamHelper.streamIf(
          file => configHelper.getFileExtensionRegExp(config.extensions).test(file.path),
          eslint(_.omit(config, 'files'))
        ))
        .pipe(eslint.format());

      return config.fix
        ? stream
        : stream.pipe(eslint.failAfterError());
    };

    gulp.task(
      taskName,
      [installDependenciesTaskName],
      () => validate(buildConfig(parameters, globals, taskName))
    );

    gulp.task(`${taskName}:fix`, [installDependenciesTaskName], (done) => {
      const filesByFolderPath = {};
      const config = buildConfig(parameters, globals, taskName);

      gulp.src(config.files)
        .on('error', err => done(err))
        .on('data', (file) => {
          const folderPath = path.dirname(file.path);
          filesByFolderPath[folderPath] = filesByFolderPath[folderPath] || [];
          filesByFolderPath[folderPath].push(file.path);
        })
        .on('end', () => {
          Promise.all(
            Object.keys(filesByFolderPath)
              .map(folderPath => new Promise((resolve, reject) => {
                validate(Object.assign({}, config, {
                  files: filesByFolderPath[folderPath],
                  fix: true
                }))
                  .pipe(streamHelper.streamIf(
                    file => file.eslint && file.eslint.fixed,
                    gulp.dest(folderPath)
                  ))
                  .on('error', err => reject(err))
                  .on('end', () => resolve())
                  .on('data', () => {
                  });
              }))
          ).then(() => done(), err => done(err));
        });
    });
  }
};
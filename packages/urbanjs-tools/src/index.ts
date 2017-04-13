import 'reflect-metadata';
import {join} from 'path';
import {
  IGulp,
  TYPE_DRIVER_GULP,
  ILoggerService,
  IToolParameters,
  IConfigService,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_CONFIG,
  GlobalConfiguration
} from '@tamasmagedli/urbanjs-tools-core';
import {container} from './container';
import {
  IToolService,
  TYPE_TOOL_SERVICE
} from './types';
import {UrbanjsToolsError} from './errors';

const loggerService = container.get<ILoggerService>(TYPE_SERVICE_LOGGER);
const toolService = container.get<IToolService>(TYPE_TOOL_SERVICE);
const configService = container.get<IConfigService>(TYPE_SERVICE_CONFIG);

configService.setGlobalConfiguration({
  typescript: require('../tsconfig.json').compilerOptions, //tslint:disable-line
  babel: {
    babelrc: false,
    extends: join(__dirname, '../.babelrc')
  },
  sourceFiles: [
    '!**/+(node_modules|bower_components|vendor|dist)/**/*',
    '!**/*.min.js',
    'bin/**/*.js',
    'src/**/*.+(js|ts|tsx)',
    'gulp/**/*.js',
    'gulpfile.js'
  ].map(globPath => `${globPath[0] === '!' ? '!' : ''}${join(process.cwd(), globPath.replace(/^!/, ''))}`)
});

export {container};

export interface IRegistrableGulpTool {
  register(gulp: IGulp, taskName: string, parameters: IToolParameters): void;
}

export const getTool = (toolName: string): IRegistrableGulpTool => ({
  register: (gulp: IGulp, taskName: string, parameters: IToolParameters) => {
    container.snapshot();

    try {
      container.bind(TYPE_DRIVER_GULP).toConstantValue(gulp);
      toolService.initializeTool(container, toolName, taskName, parameters);
    } catch (e) {
      if (!(e instanceof UrbanjsToolsError)) {
        loggerService.error('Unexpected error\n', e);
      }

      throw e;
    } finally {
      container.restore();
    }
  }
});

export const tools: { [key: string]: IRegistrableGulpTool } = global.hasOwnProperty('Proxy')
  ? new Proxy({}, {get: (target: Object, toolName: string) => getTool(toolName)})

  // Proxy is not supported in node@4, add partial backward compatible solution
  : <{ [key: string]: IRegistrableGulpTool }>[
    'babel',
    'retire',
    'mocha',
    'nsp',
    'check-dependencies',
    'check-file-names',
    'conventional-changelog',
    'tslint',
    'eslint',
    'webpack'
  ].reduce((acc: Object, toolName: string) => ({...acc, [toolName]: getTool(toolName)}), {});

export const tasks = tools;

export const initializeTools = (gulp: IGulp, parametersByToolName: Object) => {
  Object.keys(parametersByToolName).forEach(toolName => {
    getTool(toolName).register(gulp, toolName, parametersByToolName[toolName]);
  });
};

export const initializeTasks = (gulp: IGulp, parametersByToolNames: Object) => {
  loggerService.warn('.initializeTasks() api is deprecated. Please use .initializeTools() instead.');
  return initializeTools(gulp, parametersByToolNames);
};

export const setupInMemoryTranspile = () => {
  throw new Error('Not implemented yet');
};

export const getGlobalConfiguration = (): GlobalConfiguration => configService.getGlobalConfiguration();

export const setGlobalConfiguration = (configuration) => configService.setGlobalConfiguration(configuration);

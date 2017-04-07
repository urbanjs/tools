import {TransformOptions as BabelTransformOptions} from '@types/babel-core';
import {Params as BaseTSCompilerOptions} from '@types/gulp-typescript';

export const TYPE_CONFIG_LOGGER = Symbol('TYPE_CONFIG_LOGGER');
export const TYPE_SERVICE_LOGGER = Symbol('TYPE_SERVICE_LOGGER');
export const TYPE_SERVICE_FILE_SYSTEM = Symbol('TYPE_SERVICE_FILE_SYSTEM');
export const TYPE_SERVICE_SHELL = Symbol('TYPE_SERVICE_SHELL');
export const TYPE_SERVICE_CONFIG = Symbol('TYPE_SERVICE_CONFIG');
export const TYPE_SERVICE_TASK = Symbol('TYPE_SERVICE_TASK');
export const TYPE_SERVICE_CLI_SERVICE = Symbol('TYPE_SERVICE_CLI_SERVICE');
export const TYPE_SERVICE_TRACE = Symbol('TYPE_SERVICE_TRACE');
export const TYPE_SERVICE_STREAM = Symbol('TYPE_SERVICE_STREAM');
export const TYPE_SERVICE_TRANSPILE = Symbol('TYPE_SERVICE_TRANSPILE');
export const TYPE_TOOL = Symbol('TYPE_TOOL');

export type Constructor<T> = new(...args: any[]) => T; //tslint:disable-line

export type CLIServiceOptions = {
  allowUnknown?: boolean;
  messages: {
    usage: string;
  };
  options: {
    name: string;
    type: string;
    description: string;
    aliases?: string[];
    enum?: string[];
    required?: boolean;
  }[];
  commands: {
    name: string;
    description: string;
  }[];
};

export interface ICLIService {
  parseArgs<T extends { [key: string]: string | number | boolean }>(args: string[], options: CLIServiceOptions): T;
  showHelp(options: CLIServiceOptions): void;
}

export interface IFileSystemService {
  remove(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
}

export type LoggerConfig = {
  debug: boolean;
  info: boolean;
  error: boolean;
  warning: boolean;
};

export type LogMessage = any; //tslint:disable-line

export interface ILoggerService {
  debug(...msgs: LogMessage[]): void;
  error(...msgs: LogMessage[]): void;
  info(...msgs: LogMessage[]): void;
  warn(...msgs: LogMessage[]): void;
}

export interface ITraceService {
  track(target: Object): void;
}

export interface IStreamService {
  mergeStreams(streamA: NodeJS.ReadWriteStream, streamB: NodeJS.ReadWriteStream): NodeJS.ReadWriteStream;
  streamIf<T extends Object>(predicate: (input: T) => boolean,
                             stream: NodeJS.ReadWriteStream,
                             options: { ignoreError: boolean });
}

export type TSCompilerOptions = BaseTSCompilerOptions & { extends?: string };

export {BabelTransformOptions};

export type GlobalConfiguration = {
  typescript: TSCompilerOptions;
  babel: BabelTransformOptions;
  sourceFiles: string[];
};

export type IToolParameters = { [key: string]: string | number | boolean | Object };

export interface ITool<T extends IToolParameters> {
  register(taskName: string, parameters: T): void;
}

export type ShellCommandOptions = {
  cwd?: string;
  env?: Object;
  allowToFail?: boolean;
  expectToFail?: boolean;
  expectToLog?: RegExp | string | (RegExp | string)[];
};

export type ShellCommandResult = { stdout: string, stderr: string };

export interface IShellService {
  runCommand(command: string, options?: ShellCommandOptions): Promise<ShellCommandResult>;
  runCommandsInSequence(commands: (string | ShellCommandOptions)[],
                        options?: ShellCommandOptions): Promise<ShellCommandResult[]>;
}

export type TaskDependencies = (string | string[])[];

export interface ITaskService {
  addTask(taskName: string, dependencies: TaskDependencies, handler?: () => Promise<void>): void;
  runTask(taskName: string): Promise<void>;
}

export interface IConfigService {
  mergeParameters<T extends IToolParameters>(defaults: T,
                                             parameters: T,
                                             cliOptionPrefix?: string): T;
  getGlobalConfiguration(): GlobalConfiguration;
  setGlobalConfiguration(configuration: GlobalConfiguration): void;
}

export interface ITranspileService {
  transpile(content: string, filename: string): string;
  installSourceMapSupport();
}

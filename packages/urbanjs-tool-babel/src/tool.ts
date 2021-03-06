import {inject, injectable} from 'inversify';
import * as babelCore from 'babel-core';
import * as gulp from 'gulp';
import * as babel from 'gulp-babel';
import * as sourcemaps from 'gulp-sourcemaps';
import * as gulpTs from 'gulp-typescript';
import {omit} from 'lodash';
import * as ts from 'typescript';
import {
  ITool,
  IConfigService,
  ILoggerService,
  ITaskService,
  IStreamService,
  IFileSystemService,
  TYPE_SERVICE_CONFIG,
  TYPE_SERVICE_STREAM,
  TYPE_SERVICE_FILE_SYSTEM,
  TYPE_SERVICE_LOGGER,
  TYPE_SERVICE_TASK,
  track,
  ITraceService,
  TYPE_SERVICE_TRACE
} from 'urbanjs-tools-core';
import {getDefaults} from './defaults';
import {BabelConfig} from './types';

@injectable()
export class Babel implements ITool<BabelConfig> {
  private configService: IConfigService;
  private taskService: ITaskService;
  private loggerService: ILoggerService;
  private fsService: IFileSystemService;
  private streamService: IStreamService;

  constructor(@inject(TYPE_SERVICE_CONFIG) configService: IConfigService,
              @inject(TYPE_SERVICE_TASK) taskService: ITaskService,
              @inject(TYPE_SERVICE_LOGGER) loggerService: ILoggerService,
              @inject(TYPE_SERVICE_FILE_SYSTEM) fsService: IFileSystemService,
              @inject(TYPE_SERVICE_STREAM) streamService: IStreamService,
              @inject(TYPE_SERVICE_TRACE) traceService: ITraceService) {
    this.loggerService = loggerService;
    this.configService = configService;
    this.taskService = taskService;
    this.fsService = fsService;
    this.streamService = streamService;
    traceService.track(this);
  }

  @track()
  public register(taskName: string, parameters: BabelConfig) {
    this.taskService.addTask(taskName, [], async () => {
      const globals = this.configService.getGlobalConfiguration();
      const config = this.configService.mergeParameters<BabelConfig>(
        {
          ...getDefaults(globals),
          babel: globals.babel
        },
        parameters,
        taskName
      );

      if (config.clean) {
        await this.fsService.remove(config.outputPath);
      }

      let stream = gulp.src(config.files);
      if (config.sourcemap !== false) {
        stream = stream.pipe(sourcemaps.init(config.sourcemap));
      }

      let tsConfig = globals.typescript;
      let dtsPipe;
      if (tsConfig !== false) {
        if (tsConfig.extends) {
          tsConfig = gulpTs.createProject(tsConfig.extends, omit(tsConfig, 'extends')).config.compilerOptions;
        }

        const tsPipe = gulpTs({
          ...tsConfig,
          typescript: ts,
          inlineSourceMap: true
        });
        dtsPipe = tsPipe.dts.pipe(gulp.dest(config.outputPath));

        stream = stream.pipe(this.streamService.streamIf(
          (file: { path: string }) => /\.tsx?$/.test(file.path),
          tsPipe,
          {ignoreError: config.emitOnError !== false}
        ));
      }

      if (config.babel !== false) {
        stream = stream.pipe(this.streamService.streamIf(
          (file: { path: string }) => babelCore.util.canCompile(file.path),
          babel(config.babel),
          {ignoreError: config.emitOnError !== false}
        ));

        if (config.sourcemap !== false) {
          stream = stream.pipe(this.streamService.streamIf(
            (file: { path: string }) => babelCore.util.canCompile(file.path),
            sourcemaps.write('.', config.sourcemap || {}),
            {ignoreError: config.emitOnError !== false}
          ));
        }
      }

      stream = stream.pipe(gulp.dest(config.outputPath));

      await new Promise((resolve, reject) => {
        if (dtsPipe) {
          stream = this.streamService.mergeStreams(stream, dtsPipe);
        }

        stream
          .on('data', () => true)
          .on('end', () => resolve())
          .on('error', (err) => reject(err));
      });
    });

    const watchTaskName = `${taskName}:watch`;
    this.taskService.addTask(watchTaskName, [], async () => {
      const globals = this.configService.getGlobalConfiguration();
      const config = this.configService.mergeParameters<BabelConfig>(getDefaults(globals), parameters, taskName);
      gulp.watch(config.files, () => this.taskService.runTask(taskName));
    });
  }
}

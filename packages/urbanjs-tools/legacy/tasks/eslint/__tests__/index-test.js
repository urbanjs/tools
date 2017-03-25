'use strict';

import { join } from 'path';
import { runCommand, runCommands, extendJasmineTimeout } from '../../../utils/helper-tests';
import { writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('ESLint task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  it('should pass with valid source', () =>
    runCommand(['gulp eslint', { cwd: join(__dirname, 'valid-project') }])
  );

  it('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp eslint', {
      cwd: join(__dirname, 'global-configuration'),
      expectToFail: true,
      expectToContain: 'space-before-function-paren'
    }])
  );

  it('should use default configuration without specific parameters', () =>
    runCommand(['gulp eslint', { cwd: join(__dirname, 'default-configuration') }])
  );

  it('should be able to fix the fixable issues', async () => {
    const projectName = 'fix-task';
    const projectPath = join(__dirname, projectName);
    const fixableContent = 'export default function method () {\n};';

    await writeFile(join(__dirname, projectName, 'index-invalid.js'), fixableContent);
    await runCommands([
      ['gulp eslint:fix'],
      ['gulp eslint']
    ], { cwd: projectPath });
  });

  it('should allow to configure file extensions', () =>
    runCommand(['gulp eslint', {
      cwd: join(__dirname, 'file-extensions'),
      expectToFail: true,
      expectToContain: 'space-before-function-paren'
    }])
  );

  it('should support command line options', () =>
    runCommand(['gulp eslint --eslint.files="index-invalid.js"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToContain: 'space-before-function-paren'
    }])
  );
});
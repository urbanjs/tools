'use strict';

import { join } from 'path';
import { runCommand, extendJasmineTimeout } from '../../../utils/helper-tests';
import { exists, writeFile } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('JSDoc task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  it('should be able to generate documentation', async () => {
    const projectName = 'valid-project';
    await runCommand(['gulp jsdoc', { cwd: join(__dirname, projectName) }]);

    const documentationExists = await exists(join(
      __dirname, projectName, 'help/module-main.html'));
    expect(documentationExists).toBe(true);
  });

  it('should clean the output folder automatically', async () => {
    const projectName = 'clean-output-folder';
    const filePath = join(__dirname, `${projectName}/help/asd.txt`);

    await writeFile(filePath, '');
    await runCommand(['gulp jsdoc', { cwd: join(__dirname, projectName) }]);

    const fileExists = await exists(filePath);
    expect(fileExists).toBe(false);
  });

  it('should not fail if source input is empty', async () => {
    await runCommand(['gulp jsdoc', {
      cwd: join(__dirname, 'missing-source-files')
    }]);
  });

  it('should fail if required parameters are missing', () =>
    runCommand(['gulp jsdoc', {
      cwd: join(__dirname, 'missing-parameters'),
      expectToFail: true,
      expectToContain: 'Config file need to define the output folder'
    }])
  );

  it('should fail if config file is unparsable', () =>
    runCommand(['gulp jsdoc', {
      cwd: join(__dirname, 'unparsable-config-file'),
      expectToFail: true,
      expectToContain: 'Config file cannot be found/parsed'
    }])
  );

  it('should use global configuration if parameters are not defined', () =>
    runCommand(['gulp jsdoc', {
      cwd: join(__dirname, 'global-configuration')
    }])
  );

  it('should use default configuration without specific parameters', () =>
    runCommand(['gulp jsdoc', {
      cwd: join(__dirname, 'default-configuration')
    }])
  );

  it('should be able to handle typescript source', async () => {
    const projectName = 'typescript-source';
    await runCommand(['gulp jsdoc', { cwd: join(__dirname, projectName) }]);

    const documentationExists = await exists(join(
      __dirname, projectName, 'help/module-main.html'));
    expect(documentationExists).toBe(true);
  });

  it('should support command line options', () =>
    runCommand(['gulp jsdoc --jsdoc.configFile="jsdoc.json"', {
      cwd: join(__dirname, 'cli-options'),
      expectToFail: true,
      expectToContain: 'Config file need to define the output folder'
    }])
  );
});

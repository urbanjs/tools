'use strict';

import { join } from 'path';
import { runCommand, runCommands, extendJasmineTimeout } from '../../../utils/helper-tests';
import { exists, isSymlink, remove } from '../../../utils/helper-fs';

jest.unmock('../../../utils/helper-fs');

describe('NPM install task', () => {
  extendJasmineTimeout(jasmine, beforeEach, afterEach);

  it('should be able to install package locally', async () => {
    const projectName = 'installation-local';
    const packageFilePath = `${projectName}/node_modules/left-pad/package.json`;

    await remove(join(__dirname, projectName, 'node_modules'));
    await runCommand(['gulp npmInstall', { cwd: join(__dirname, projectName) }]);

    const packageExists = await exists(join(__dirname, packageFilePath));
    expect(packageExists).toBe(true);
  });

  it('should be able to install package globally', async () => {
    const projectName = 'installation-global';
    await runCommands([
      ['npm uninstall -g uuid', { allowToFail: true }],
      ['gulp npmInstall', { cwd: join(__dirname, projectName) }],
      ['uuid']
    ]);
  });

  it('should be able to link globally installed packages', async () => {
    const projectName = 'linking';
    const packagePath = `${projectName}/node_modules/uuid`;

    await remove(join(__dirname, projectName, 'node_modules'));
    await runCommands([
      ['npm install -g uuid@3.0.0'],
      ['gulp npmInstall', { cwd: join(__dirname, projectName) }]
    ]);

    const packageIsSymlink = await isSymlink(join(__dirname, packagePath));
    expect(packageIsSymlink).toBe(true);
  });

  it('should link globally installed packages automatically', async () => {
    const projectName = 'default-configuration';
    const packagePath = `${projectName}/node_modules/uuid`;

    await remove(join(__dirname, projectName, 'node_modules'));
    await runCommands([
      ['npm install -g uuid@3.0.0'],
      ['gulp npmInstall', { cwd: join(__dirname, projectName) }]
    ]);

    const packageIsSymlink = await isSymlink(join(__dirname, packagePath));
    expect(packageIsSymlink).toBe(true);
  });

  it('should use global configuration if parameters are not defined', async () => {
    const projectName = 'global-configuration';
    const packagePath = `${projectName}/node_modules/uuid`;

    await remove(join(__dirname, projectName, 'node_modules'));
    await runCommands([
      ['npm install -g uuid@3.0.0'],
      ['gulp npmInstall', { cwd: join(__dirname, projectName) }]
    ]);

    const packageIsSymlink = await isSymlink(join(__dirname, packagePath));
    expect(packageIsSymlink).toBe(false);
  });

  it('should debounce separate installations automatically', async () => {
    const projectName = 'installation-throttling';

    await remove(join(__dirname, `${projectName}/node_modules`));
    await runCommand(['gulp npmInstall', {
      cwd: join(__dirname, projectName),
      expectToContain: 'Installing missing dependencies...\nleft-pad@1.1.0 uuid@3.0.0'
    }]);
  });

  it('should ignore packages with unsuitable version (reinstall)', async () => {
    const projectName = 'mismatch-version';

    await runCommands([
      ['npm install'],
      ['gulp npmInstall']
    ], { cwd: join(__dirname, projectName) });

    const pkg = require(join(__dirname, `${projectName}/node_modules/uuid/package.json`)); // eslint-disable-line
    expect(pkg.version).toBe('3.0.0');
  });

  it('should be able to find suitable locally installed packages (skip)', async () => {
    const projectName = 'skip-locally-installed-package';

    await remove(join(__dirname, `${projectName}/node_modules`));
    await runCommands([
      ['npm install'],
      ['gulp npmInstall', {
        expectToContain: 'Installing missing dependencies...\nleft-pad@1.1.0\n'
      }]
    ], { cwd: join(__dirname, projectName) });
  });
});

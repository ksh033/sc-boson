const { yParser, chalk } = require('@umijs/utils');
const { join } = require('path');
const exec = require('./utils/exec');
const execa = require('execa');
const inquirer = require('inquirer');
const getPackages = require('./utils/getPackages');
const isNextVersion = require('./utils/isNextVersion');
const cwd = process.cwd();
const args = yParser(process.argv);
const lernaCli = require.resolve('lerna/cli');
 exec(
    'node',
    [
      [lernaCli],
      'version',
      '--yes',
      '--exact',
    
    ],

    {
      shell: false,
    },
  );
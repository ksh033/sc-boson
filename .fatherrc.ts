import { readdirSync } from 'fs';
import { join } from 'path';

// utils must build before core
// runtime must build before renderer-react
// components dependencies order: form -> table -> list
const headPkgs: string[] = ['element'];
const tailPkgs = readdirSync(join(__dirname, 'packages')).filter(
  (pkg) => pkg.charAt(0) !== '.' && !headPkgs.includes(pkg),
);

export default {
  cjs: { type: 'babel', lazy: true },
  esm: {
    type: 'babel',
    importLibToEs: true,
  },
  cssModules: true,

  pkgs: ['element', 'utils', 'schema', 'layout', 'clientplugin'],
  extraBabelPlugins: [
    ['babel-plugin-import', { libraryName: 'antd', libraryDirectory: 'es', style: true }, 'antd'],
    [require('./scripts/replaceLib')],
  ],
};

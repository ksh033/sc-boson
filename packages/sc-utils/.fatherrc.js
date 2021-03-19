export default {
  entry: './src/index.js',
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  cssModules: {
    scopeBehaviour: 'global',
    generateScopedName: '[name]',
  },
  // cssModules: true,
  extractCSS: true,
  lessInBabelMode: true,
}

var path = require('path')

export default {
  entry: './src/index.ts',
  target: 'node',
  esm: 'babel',
  cjs: 'babel',
  // disableTypeCheck: true,
  // cssModules: {
  //   scopeBehaviour: "global",
  //   generateScopedName: '[name]',
  // },
  // cssModules: true,
  // extractCSS: true,
  lessInBabelMode: {
    paths: [path.join(__dirname, 'node_modules')],
    javascriptEnabled: true,
  },
}

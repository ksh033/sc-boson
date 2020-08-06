import { defineConfig } from 'dumi';

export default defineConfig({
  mode: 'site',
  title: '自定义组件库',
  // devtool: 'source-map',
  //dynamicImport: {},
  manifest: {},
  //links: [{ rel: "manifest", href: "/asset-manifest.json" }],
  hash: true,
  resolve: {
    // includes: ['docs', 'packages/hooks/src', 'packages/use-request'],
  },

  menus: {},
  navs: {
    'zh-CN': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/hooks' },
      { title: '更新日志', path: 'https://github.com/umijs/hooks/releases' },
    ],
  },
  extraBabelPlugins: [
    [
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ],
  ],
  // more config: https://d.umijs.org/config
});

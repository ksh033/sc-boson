//import nodeResolve from 'rollup-plugin-node-resolve';
//import commonjs from 'rollup-plugin-commonjs';
//mport babel from 'rollup-plugin-babel';

export default {
  target: "browser",
  umd: {
    globals: {
      loadjs: "loadjs",
      axios: "axios"
    }
  },
  esm: { type: "babel" },
  cjs: "babel",
  disableTypeCheck: true,
  doc: {
    title: "sc-js-sdk",
    // repository: 'https://github.com/umijs/hooks',
    // theme: 'docz-theme-umi-hooks',
    ignore: [
      "readme.md",
      "changelog.md",
      "readme_zh-CN.md",
      "contributing.md",
      "license.md",
      "__template__/*.mdx"
    ],
    // dest: '.doc/zh-cn',
    // base: '/zh-cn',
    files: "./src/**/*.{md,markdown,mdx}"
    // themeConfig: {
    //     codemirrorTheme: 'docz-light',
    //     menus: [
    //         { title: '发布日志', link: 'https://github.com/umijs/hooks/releases' },
    //         { title: 'Github', link: 'https://github.com/umijs/hooks' },
    //     ],
    // },
  }
};

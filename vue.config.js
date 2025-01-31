const path = require('path')
const CompressionPlugin = require('compression-webpack-plugin')
const webpack = require('webpack')

function resolve(dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  // 是否使用包含运行时编译器的 Vue 构建版本。设置为 true 后你就可以在 Vue 组件中使用 template 选项了 https://cli.vuejs.org/zh/config/#runtimecompiler
  runtimeCompiler: true,
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463
   */
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // qiankuan打包时放开
  // outputDir: "../dist/main",
  // 多入口配置
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    },
    mapPage: {
      entry: 'src/map-page/map-main.js',
      template: 'public/map.html',
      filename: 'map.html',
      title: '地图选点服务'
    }
  },
  // 打包app时放开该配置
  // publicPath:'/',
  configureWebpack: config => {
    // 生产环境取消 console.log
    if (process.env.NODE_ENV === 'production') {
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))

    // 生产环境，开启js\css压缩
    if (process.env.NODE_ENV === 'production') {
      // 压缩图片, 插件安装：yarn add image-webpack-loader --dev
      config.module
        .rule('images')
        .use('image-webpack-loader')
        .loader('image-webpack-loader')
        .options({
          disable: true, // webpack@4.x
          bypassOnDebug: true // webpack@3.x
        })
        .end()
      // 优化moment.js, 忽略/moment/locale下的所有文件，这里会影响到datepicker组件的国际化，可以参考这里优化：https://blog.csdn.net/qq_17175013/article/details/86845624
      // config.plugin('ignorePlugin').use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
      // 开启js\css压缩
      config.plugin('compressionPlugin').use(new CompressionPlugin({
        test: /\.(js|ts|css|less|scss)$/, // 匹配文件名
        threshold: 10240, // 对超过10k的数据压缩
        deleteOriginalAssets: false // 不删除源文件
      }))
      // 如果想要输出后的html文件包含双引号的script，开启这个插件
      // config.plugin('html').tap((args) => {
      //   args[0].minify = {
      //     ...args[0].minify,
      //     removeAttributeQuotes: false
      //   }
      //   return args
      // })
    }

    // 配置 webpack 识别 markdown、sql 为普通的文件
    config.module
      .rule('markdown and sql')
      .test(/\.(md|sql)$/)
      .use()
      .loader('file-loader')
      .end()

    // 编译vxe-table包里的es6代码，解决IE11兼容问题
    config.module
      .rule('vxe')
      .test(/\.js$/)
      .include
        .add(resolve('node_modules/vxe-table'))
        .add(resolve('node_modules/vxe-table-plugin-antd'))
        .end()
      .use()
      .loader('babel-loader')
      .end()
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */
          'primary-color': '#1890FF',
          'link-color': '#1890FF',
          'border-radius-base': '4px'
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    port: 3300,
    // hot: true,
    // disableHostCheck: true,
    // 禁止eslint控制台输出
    overlay: {
        warnings: false,
        errors: false
    },
    // headers: {
    //     'Access-Control-Allow-Origin': '*',
    // },
    proxy: {
     /* '/api': {
        target: 'https://mock.ihx.me/mock/5baf3052f7da7e07e04a5116/antd-pro', //mock API接口系统
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '/jeecg-boot': ''  //默认所有请求都加了jeecg-boot前缀，需要去掉
        }
      }, */
      /* 注意：jeecgboot前端做了改造，此处不需要配置跨域和后台接口（只需要改.env相关配置文件即可）
          issues/3462 很多人此处做了配置，导致刷新前端404问题，请一定注意 */
      '/jeecg-boot': {
        target: process.env.VUE_APP_API_BASE_URL,
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/jeecg-boot': ''
        }
      },
      '/main': {
        target: process.env.VUE_APP_API_BASE_URL,
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/main': ''
        }
      },
      '/iserver': {
        target: process.env.VUE_APP_SUPERMAP_ISERVER,
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/iserver': ''
        }
      }
    }
  },

  lintOnSave: false
}

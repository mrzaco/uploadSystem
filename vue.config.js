/*
 * @Author: cc
 * @Date: 2021-01-25 16:38:03
 * @LastEditTime: 2021-01-27 13:48:11
 * @LastEditors: cwx
 * @FilePath: \uploadSystem\vue.config.js
 * @Description:
 */
const path = require("path");
const devurl = "http://172.16.25.25:56021/";
function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  devServer: {
    proxy: {
      "/": {
        target: devurl,
        changeOrigin: true,
        ws: true,
        secure: false
      }
    }
  },
  publicPath: "./",
  assetsDir: "./",
  productionSourceMap: false,
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("tim", resolve("src/tim.js"));
    // 删除预加载
    config.plugins.delete("preload");
    config.plugins.delete("prefetch");
    // 压缩代码
    config.optimization.minimize(true);
    // 分割代码
    config.optimization.splitChunks({
      chunks: "all"
    });
  },
  css: {
    // extract: true,
    sourceMap: false,
    loaderOptions: {
      stylus: {
        "resolve url": true,
        // 自定义主题场景
        import: [path.resolve(__dirname, "./src/assets/css/base.styl")]
      }
    }
  }
};

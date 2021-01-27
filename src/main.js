/*
 * @Author: cc
 * @Date: 2021-01-25 10:31:37
 * @LastEditTime: 2021-01-26 15:55:29
 * @LastEditors: zy
 * @FilePath: \file-upload\src\main.js
 * @Description:
 */
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import SparkMD5 from "spark-md5";
Vue.prototype.$SparkMD5 = SparkMD5;
import tool from "./plugins/tools";
Vue.prototype.tool = tool;
Vue.config.productionTip = false;
Vue.use(ElementUI);
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

/*
 * @Author: cc
 * @Date: 2021-01-25 10:31:37
 * @LastEditTime: 2021-01-25 11:13:02
 * @LastEditors: cc
 * @FilePath: \file-upload\src\router\index.js
 * @Description:
 */
import Vue from "vue";
import VueRouter from "vue-router";
import upload from "../views/Upload.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "upload",
    component: upload
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;

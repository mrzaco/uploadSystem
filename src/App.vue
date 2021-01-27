<!--
 * @Author: cc
 * @Date: 2021-01-25 10:31:37
 * @LastEditTime: 2021-01-25 15:49:17
 * @LastEditors: cc
 * @FilePath: \file-upload\src\App.vue
 * @Description: 
-->
<template>
  <div id="app">
    <div id="nav">
      <!-- <router-link to="/">文件上传</router-link> | -->
      <!-- <router-link to="/about">About</router-link> -->
    </div>
    <router-view />
  </div>
</template>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

<!--
 * @Author: cc
 * @Date: 2021-01-25 10:31:37
 * @LastEditTime: 2021-01-27 14:43:53
 * @LastEditors: zy
 * @FilePath: \uploadSystem\src\views\Upload.vue
 * @Description:
-->
<template>
  <div class="home">
    <div>
      <input type="file" @change="handleFileChange" />
      <el-button @click="handleUpload">上传</el-button>
    </div>
    <div>
      <!-- <div>计算文件 hash</div>
      <el-progress :percentage="hashPercentage"></el-progress> -->
      <div>总进度</div>
      <el-progress type="circle" :percentage="uploadPercentage"></el-progress>
    </div>
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
  </div>
</template>

<script>
var idStorage = {
  fetch: function() {
    return JSON.parse(sessionStorage.getItem("ID") || "[]");
  }
};
var tenantIdStorage = {
  fetch: function() {
    return JSON.parse(sessionStorage.getItem("TENANTID") || "[]");
  }
};
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
const SIZE = 1 * 1024 * 1024; // 切片大小
export default {
  name: "Upload",
  components: {
    // HelloWorld
  },
  data: () => ({
    container: {
      file: null
    },
    data: [],
    chunks: 0,
    params: {
      userId: "0211243A0D694FBC95A041C82E772EAB",
      appCode: "oss",
      companyId: "onair",
      type: "video/mp4",
      ID: idStorage.fetch(),
      TENANTID: tenantIdStorage.fetch()
    }
  }),
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      this.tool
        .md5(file, SIZE)
        .then(res => {
          // 获取到文件的md5
          console.log("md5=" + res);
          this.md5Code = res;
        })
        .catch(res => {
          // 处理异常
          console.error(res);
        });
      Object.assign(this.$data, this.$options.data()); // 还原初始data对象
      this.container.file = file;
    },
    /**
     * [request description] 发送请求
     * @param   {[type]}  url          [url description]
     * @param   {[type]}  method       [method description]
     * @param   {[type]}  post         [post description]
     * @param   {[type]}  data         [data description]
     * @param   {[type]}  headers      [headers description]
     * @param   {[type]}  requestList  [requestList description]
     * @return  {[type]}               [return description]
     */
    request({
      url,
      method = "post",
      data,
      headers = {},
      onProgress = e => e,
      requestList
    }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = onProgress;
        xhr.open(method, url);
        Object.keys(headers).forEach(key => {
          xhr.setRequestHeader(key, headers[key]);
        });
        xhr.send(data);
        xhr.onload = e => {
          if (requestList) {
            const xhrIndex = requestList.findIndex(item => {
              item === xhr;
            });
            requestList.splice(xhrIndex, 1);
          }
          resolve({
            data: e.target.response
          });
        };
      });
    },
    /**
     * [createFileChunk description] 生成文件切片
     * @param   {[type]}  file  [file description]
     * @param   {[type]}  size  [size description]
     * @param   {[type]}  SIZE  [SIZE description]
     * @return  {[type]}        [return description]
     */
    createFileChunk(file, size = SIZE) {
      const fileChunkList = [];
      let cur = 0;
      while (cur < file.size) {
        fileChunkList.push({ file: file.slice(cur, cur + size) });
        cur += size;
      }
      return fileChunkList;
    },
    /**
     * [uploadChunks description] 上传切片
     * @return  {[type]}  [return description]
     */
    async uploadChunks() {
      const requestList = this.data
        .map(({ file, index }) => {
          const formData = new FormData();
          formData.append("chunks", this.data.length);
          formData.append("file", file);
          formData.append("chunk", index);
          formData.append("size", file.size);
          formData.append("md5", this.md5Code);
          formData.append("name", this.container.file.name);
          Object.keys(this.params).forEach(key => {
            formData.append(key, this.params[key]);
          });
          return { formData, index };
        })
        .map(({ formData, index }) => {
          this.doUploadChunk(formData, index);
        });
      await Promise.all(requestList); // 并发切片
      await this.mergeRequest();
    },
    /**
     * [doUploadChunk description] 执行每个切片上传
     * @param   {[type]}  formData  [formData description]
     * @param   {[type]}  index     [index description]
     * @return  {[type]}            [return description]
     */
    async doUploadChunk(formData, index) {
      this.request({
        url: "https://ys-web.xjmty.com/upload/fileUpload",
        method: "POST",
        data: formData,
        onProgress: this.createProgressHandler(this.data[index])
      });
    },
    /**
     * [handleUpload description] 处理上传
     * @return  {[type]}  [return description]
     */
    async handleUpload() {
      if (!this.container.file) return;
      const fileChunkList = this.createFileChunk(this.container.file);
      this.data = fileChunkList.map(({ file }, index) => ({
        file: file,
        chunk: index,
        index,
        hash: this.container.file.name + "-" + index, // 文件名+数组下标
        size: file.size,
        percentage: 0
      }));
      await this.uploadChunks();
    },
    /**
     * [createProgressHandler description] 创建进度
     * @param   {[type]}  item  [item description]
     * @return  {[type]}        [return description]
     */
    createProgressHandler(item) {
      return e => {
        item.percentage = parseInt(String((e.loaded / e.total) * 100));
      };
    },
    /**
     * [packageParams description] 组装参数（key/value形式）
     * @param   {[type]}  data  [data description]
     * @return  {[type]}        [return description]
     */
    packageParams(data) {
      if (typeof data == "object") {
        var str = "";
        for (var key in data) {
          str += key + "=" + data[key] + "&";
        }
        data = str.replace(/&$/, "");
      }
      return data;
    },
    async mergeRequest() {
      await this.request({
        url: "https://ys-web.xjmty.com/upload/fileUploadCheck",
        headers: {
          "Content-type": "application/x-www-form-urlencoded"
        },
        data: this.packageParams({
          status: "chunksMerge",
          name: "d7639694dbfa3f38c6bb2826d0d29d17",
          chaunks: this.data.length,
          appCode: "oss",
          companyId: "onair",
          userId: "0211243A0D694FBC95A041C82E772EAB",
          ext: "mp4"
        })
      });
    }
  },
  computed: {
    uploadPercentage() {
      if (!this.container.file || !this.data.length) return 0;
      const loaded = this.data
        .map(item => item.size * item.percentage)
        .reduce((acc, cur) => acc + cur);
      return parseInt((loaded / this.container.file.size).toFixed(2));
    }
  }
};
</script>

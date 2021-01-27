<!--
 * @Author: cc
 * @Date: 2021-01-25 10:31:37
 * @LastEditTime: 2021-01-26 18:18:28
 * @LastEditors: zy
 * @FilePath: \file-upload\src\views\Upload.vue
 * @Description: 
-->
<template>
  <div class="home">
    <div>
      <input type="file" @change="handleFileChange" />
      <el-button @click="handleUpload">上传</el-button>
    </div>
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
  </div>
</template>

<script>
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
    md5Code: "",
    params: {
      userId: "0211243A0D694FBC95A041C82E772EAB",
      appCode: "appCode",
      companyId: "onair",
      type: "video/mp4"
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
     *
     * @return  {[type]}               [return description]
     */
    request({ url, method = "post", data, headers = {}, requestList }) {
      return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        -Object.keys(headers).forEach(key => {
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
      var myDate = new Date();
      var mytime = myDate.getTime(); //获取当前时间
      const requestList = this.data
        .map(({ chunk, hash }) => {
          const formData = new FormData();
          // formData.append("chunk", chunk);
          formData.append("file", chunk);
          formData.append("size", "806251");
          formData.append("hash", hash);
          formData.append("userId", "0211243A0D694FBC95A041C82E772EAB");
          formData.append("appCode", "oss");
          formData.append("companyId", "onair");
          formData.append("type", "video/mp4");
          formData.append("id", hash);
          formData.append("uniqueSymbol", this.params.userId + mytime);
          formData.append("md5", this.md5Code);
          // formData.append("filename", this.container.file.name);
          formData.append("name", this.container.file.name);
          return { formData };
        })
        .map(async ({ formData }) => {
          this.request({
            url: "https://ys-web.xjmty.com/upload/fileUpload",
            method: "POST",
            data: formData
          });
        });
      await Promise.all(requestList); // 并发切片
    },
    async handleUpload() {
      if (!this.container.file) return;
      const fileChunkList = this.createFileChunk(this.container.file);
      this.data = fileChunkList.map(({ file }, index) => ({
        chunk: file,
        hash: this.container.file.name + "-" + index // 文件名+数组下标
      }));
      await this.uploadChunks();
    }
  }
};
</script>

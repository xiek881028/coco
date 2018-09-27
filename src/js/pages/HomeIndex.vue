<template lang="pug">
.fileBox
  .tableBox
    Collapse.collapse(v-if="fileList.length" v-model="activeCollapse")
      Panel.item(v-for="item in fileList" :hide-arrow="true" :class="{hasErr: item.isDir}" :name="item.idName" :key="item.id")
        .title
          Icon.arrow(type="ios-arrow-forward")
          ButtonGroup.btnGroup(size="small")
            Button(ghost @click.stop="qrcode(item.url)")
              BaseIcon.qrcode(type="icon-erweima")
              | 生成二维码
            Button(ghost icon="md-link" @click.stop="copy(item.url)") 复制链接
            Button(ghost icon="md-folder-open" @click.stop="openFile(item.path)") 定位文件
        .content(slot="content")
          Tag.tag(color="red") {{item.isDir ? '文件夹' : '文件'}}名称：{{item.name}}
          Tag.tag(color="orange" v-if="!item.isDir") 文件大小：{{item.size}}
          Tag.tag(color="blue") 修改时间：{{item.lastModified}}
          Tag.tag(color="cyan") 路径：{{item.path}}
  .infoBox(v-if="ip.length")
    .label
      | IP地址：
    .selectBox
      Select.ipSelect(v-model="selectIp")
        Option(v-for="item in ip" :label="`${item.address} (${item.name})`" :key="item.address" :value="item.address")
    Icon.refresh(type="md-refresh" @click="refreshIp")
  .upload
    .uploadBox
      .dropBox(ref="dropBox" :class="{hover:isHover}" @click="activeDrop" @drop="dropStart" @dragenter="dragHover(true)" @dragleave="dragHover(false)")
        | 将文件拖到此处，或
        span 点击上传文件
        input.fileInput(type="file" ref="dropInput" @change="clickUploadFile" multiple="multiple")
  Modal.file_modal(
    v-model="modalIsShow"
    title="二维码"
  )
    Alert(type="warning" show-icon) 请确保设备处于相同的局域网内，同时请使用手机自带的扫码工具。微信、淘宝等第三方app扫码后无法下载文件。
    img.code(:src="qrcodeSrc")
</template>

<script>
const { shell, clipboard, } = nodeRequire("electron");
const remote = nodeRequire("electron").remote;
const win = remote.getCurrentWindow();
const net = nodeRequire("http");
const os = nodeRequire("os");
const fs = nodeRequire("fs-extra");
const url = nodeRequire("url");
const querystring = nodeRequire("querystring");
const qrCode = nodeRequire("qrcode");

import { Icon, Collapse, Panel, Tag, ButtonGroup, Button, Modal, Alert, Select, Option, } from "iview";
import BaseIcon from './components/BaseIcon.vue';
import dateFormat from "cainfoharbor-utils/dateFormat";
import filesize from "filesize";
export default {
  components: {
    Icon,
    Collapse,
    Panel,
    Tag,
    ButtonGroup,
    Button,
    BaseIcon,
    Modal,
    Alert,
    Select,
    Option,
  },
  data() {
    return {
      ip: [],
      isHover: false,
      fileList: [],
      activeCollapse: [],
      id: 0,
      showTips: false,
      tipsTxt: "",
      service: null,
      timer: null,
      columns: [
        {title: '名称', key: 'name'},
        {title: '大小', key: 'size'},
        {title: '修改日期', key: 'lastModified'},
      ],
      modalIsShow: false,
      qrcodeSrc: '',
      selectIp: '',
    };
  },

  mounted() {
    this.getIp();

    //访问服务后的业务逻辑
    this.server = net
      .createServer((req, res) => {
        console.log(req);
        let queryId = req.url.replace("/", ""),
          idJson;
        for (let i = 0, max = this.fileList.length; i < max; i++) {
          if (this.fileList[i].id == queryId) {
            idJson = this.fileList[i];
            break;
          }
        }
        if (idJson) {
          let stream = fs.createReadStream(idJson.path);
          stream.on("error", function() {
            res.writeHeader(404);
            res.end();
          });
          //写入头部type为流文件 确定支持chrome、firefox、小米3、苹果
          res.writeHeader(200, {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename=${querystring.escape(idJson.name)}${req.headers["user-agent"].indexOf("Android") != -1 ? "" : `;filename*=utf-8''${querystring.escape(idJson.name)}`}`,
          });
          //返回文件内容
          stream.pipe(res);
        } else {
          res.writeHeader(404);
          res.end();
        }
      })
      .on("error", err => {
        throw err;
      });

    //随机监听一个空闲端口
    this.server.listen(() => {
      console.log('监听端口：' ,this.server.address().port);
    });

    document.ondragleave = e => {
      e.preventDefault();
    };
    document.ondrop = e => {
      e.preventDefault();
    };
    document.ondragenter = e => {
      e.preventDefault();
    };
    document.ondragover = e => {
      e.preventDefault();
    };
  },

  methods: {
    getIp() {
      let ip = [];
      const network = os.networkInterfaces();
      //获取内网地址
      Object.keys(network).map(item => {
        for (let i = 0, max = network[item].length; i < max; i++) {
          let address = network[item][i].address;
          if (!/^(127)/.test(address) && /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(address) && network[item][i].family == "IPv4") {
            ip.push({
              address,
              name: item,
            });
          }
        }
      });
      this.ip = [...ip];
      this.selectIp = ip[0].address;
    },
    refreshIp() {
      this.getIp();
      this.$Message.success('IP地址更新成功！');
    },
    dropStart(e) {
      this.uploadFile(e, "drop");
    },
    dragHover(bool) {
      this.isHover = bool;
    },
    clickUploadFile(e) {
      this.uploadFile(e, "click");
    },
    uploadFile(e, mode) {
      let files = mode == "drop" ? e.dataTransfer.files : e.target.files;
      this.isHover = false;
      e.preventDefault();
      if(files.length > 50){
        this.$Notice.error({
          title: '溢出错误',
          desc: '单次导入文件数量最多为50个',
        });
        return;
      }
      this.fileList = [];
      setTimeout(() => {
        if (files.length) {
          this.fileList = Object.keys(files).map(item => {
            let stats = fs.statSync(files[item].path);
            //加入id标识文件唯一
            files[item].id = this.id;
            this.id += 1;
            //文件夹过滤
            if (!stats.isDirectory()) {
              files[item].isDir = false;
            } else {
              files[item].isDir = true;
            }
            let _item = files[item];
            return {
              isDir: _item.isDir,
              path: _item.path,
              name: _item.name,
              lastModified: dateFormat('yyyy-MM-dd HH:mm:ss', new Date(+_item.lastModified)),
              id: _item.id,
              idName: `item${_item.id}`,
              size: filesize(_item.size),
              url: `:${this.server.address().port}/${files[item].id}`,
            };
          });
          this.activeCollapse = this.fileList.map(item => item.idName);
        }
      }, 100);
    },
    openFile(path, e) {
      shell.showItemInFolder(path);
    },
    del(item, e) {
      for (let i = 0, max = this.fileList.length; i < max; i++) {
        if (this.fileList[i].id == item.id) {
          this.fileList.splice(i, 1);
          break;
        }
      }
    },
    copy(url){
      clipboard.writeText(`http://${this.selectIp}${url}`);
      this.$Message.success('复制成功！');
    },
    qrcode(url) {
      //生成二维码
      qrCode.toDataURL(`http://${this.selectIp}${url}`, {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 200,
      })
      .then(src => {
        this.qrcodeSrc = src;
        this.modalIsShow = true;
      })
      .catch(err => {
        this.$Message.error('二维码生成失败！');
      })
      ;
    },
    activeDrop() {
      this.$refs.dropInput.click();
    },
  }
};
</script>

<style lang="scss">
@import "../../css/config";

.fileBox {
  display: flex;
  flex-direction: column;
  flex: auto;
  .tableBox {
    flex: 1;
    background: $color-bg;
    cursor: default;
    user-select: none;
    overflow: auto;
    .collapse{
      border-radius: 0;
      border: none;
      .item{
        background-color: $primary-color;
        &.hasErr{
          background-color: $color-err;
        }
        .title{
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100%;
          .btnGroup{
            margin-right: 16px;
            button{
              display: flex;
              align-items: center;
              padding-bottom: 1px;
              &:hover{
                color: $white;
                border-color: $white;
                background-color: mix($white, $primary-color, 40%);
              }
            }
            .qrcode{
              margin-right: 7px;
            }
          }
          .arrow{
            color: $white;
            font-size: 16px;
            transition: transform .2s ease-in-out;
          }
        }
        &.ivu-collapse-item-active{
          .title{
            .arrow{
              transform: rotate(90deg);
            }
          }
        }
        .ivu-collapse-content{
          border-radius: 0;
          background-color: mix($white, $black, 92%);
        }
        .content{
          .tag{
            height: auto;
            word-break:break-all;
          }
        }
      }
    }
  }
  .infoBox{
    height: 50px;
    background: #595957;
    z-index: 4;
    display: flex;
    flex: 0 1 50px;
    padding: 0 10px;
    align-items: center;
    .label{
      margin-right: 10px;
    }
    .selectBox{
      flex: auto;
    }
    .refresh{
      font-size: 22px;
      margin-left: 10px;
      cursor: pointer;
    }
  }
  .upload {
    height: 200px;
    background: $color-bg-base;
    z-index: 3;
    display: flex;
    flex-direction: column;
    flex: 0 1 200px;
    .uploadBox {
      flex: 0 1 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      .dropBox {
        display: block;
        width: 80%;
        padding: 0 20px;
        height: 140px;
        line-height: 140px;
        border: 2px dashed $primary-color;
        font-size: $font-size-base * 1.5;
        text-align: center;
        color: $white;
        cursor: pointer;
        span {
          pointer-events: none;
          color: $primary-color;
        }
        &.hover,
        &:hover {
          border-color: $white;
        }
        .fileInput {
          display: none;
        }
      }
    }
  }
}
.file_modal{
  .ivu-modal{
    top: 40px;
  }
  .code{
    display: block;
    margin: 0 auto;
  }
}
</style>

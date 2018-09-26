<template lang="pug">
.fileBox
  //- ul.list(ref="ulList")
  //-   li(v-for="item in fileList" :class="{hasErr:item.notDir}")
  //-     .imgBox(ref="qrcode")
  //-       img(:src="item.url")
  //-     .info
  //-       .name(:title="item.name") {{item.name}}
  //-     .opt
  //-       span.del() 删除
  //-       span.gps(@click="openFile(item.path)") 定位文件
  .tableBox
    Collapse.collapse(v-if="fileList.length" v-model="activeCollapse")
      Panel.item(v-for="item in fileList" :hide-arrow="true" :class="{hasErr: item.isDir}" :name="item.idName" :key="item.id")
        .title
          Icon.arrow(type="ios-arrow-forward")
          ButtonGroup.btnGroup(size="small")
            Button(ghost)
              BaseIcon.qrcode(type="icon-erweima")
              | 生成二维码
            Button(ghost icon="md-link" @click.stop="copy(item.url)") 复制链接
            Button(ghost icon="md-folder-open" @click.stop="openFile(item.path)") 定位文件
            Button(ghost icon="md-trash" @click.stop="del(item)") 删除
        .content(slot="content")
          Tag.tag(color="red") {{item.isDir ? '文件夹' : '文件'}}名称：{{item.name}}
          Tag.tag(color="orange" v-if="!item.isDir") 文件大小：{{item.size}}
          Tag.tag(color="blue") 修改时间：{{item.lastModified}}
          Tag.tag(color="cyan") 路径：{{item.path}}
  .upload
    .uploadBox
      .dropBox(ref="dropBox" :class="{hover:isHover}" @click="activeDrop" @drop="dropStart" @dragenter="dragHover(true)" @dragleave="dragHover(false)")
        | 将文件拖到此处，或
        span 点击上传文件
        input.fileInput(type="file" ref="dropInput" @change="clickUploadFile" multiple="multiple")
  //- .toTips(:class="{toShow:showTips}")
    .closeBtn(@click="closeTip") 关闭
    .contxt
      i.fa.fa-times-circle
      | {{tipsTxt}}
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
const network = os.networkInterfaces();

import { Icon, Collapse, Panel, Tag, ButtonGroup, Button, } from "iview";
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
  },
  data() {
    return {
      ip: "",
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
    };
  },

  mounted() {
    //获取内网地址
    Object.keys(network).map(item => {
      for (let i = 0, max = network[item].length; i < max; i++) {
        if (/^(192)/.test(network[item][i].address)) {
          this.ip = network[item][i].family == "IPv4" ? network[item][i].address : "127.0.0.1";
        }
      }
    });

    //访问服务后的业务逻辑
    this.server = net
      .createServer((req, res) => {
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
      console.log(this.ip + ":" + this.server.address().port);
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
              // //生成二维码
              // qrCode.toDataURL(
              //   `http://${this.ip}:${this.server.address().port}/${files[item].id}`,
              //   {
              //     errorCorrectionLevel: "M",
              //     margin: 1,
              //     scale: 4,
              //     color: {
              //       dark: "000000ff"
              //     }
              //   },
              //   (err, url) => {
              //   }
              // );
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
              url: `http://${this.ip}:${this.server.address().port}/${files[item].id}`,
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
      clipboard.writeText(url);
      this.$Message.success('复制成功！');
    },
    // totips(txt) {
    //   clearTimeout(this.timer);
    //   this.showTips = true;
    //   this.tipsTxt = txt;
    //   this.timer = setTimeout(() => {
    //     this.closeTip();
    //   }, 3000);
    // },
    // closeTip() {
    //   this.showTips = false;
    // },
    activeDrop() {
      this.$refs.dropInput.click();
    }
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
  // ul {
  //   margin: 0;
  //   padding: 0;
  //   flex: auto;
  //   overflow-y: auto;
  //   padding-bottom: 20px;
  //   display: flex;
  //   flex-wrap: wrap;
  //   li {
  //     list-style-type: none;
  //     margin: 20px 0 0 20px;
  //     height: 260px;
  //     width: 175px;
  //     box-sizing: border-box;
  //     background: $white;
  //     display: flex;
  //     flex-direction: column;
  //     .imgBox {
  //       width: 175px;
  //       height: 175px;
  //       margin: 0 auto;
  //       box-sizing: border-box;
  //       padding: 5px;
  //       img {
  //         width: 100%;
  //         height: 100%;
  //         display: block;
  //       }
  //     }
  //     .opt {
  //       text-align: center;
  //       span {
  //         font-size: 12px;
  //         line-height: 16px;
  //         height: 16px;
  //         color: $white;
  //         text-align: center;
  //         display: inline-block;
  //         margin: 0 7px;
  //         padding: 2px;
  //         width: 55px;
  //         border-radius: 2px;
  //         cursor: pointer;
  //       }
  //       .del {
  //         background-color: #d9534f;
  //       }
  //       .gps {
  //         background-color: #337ab7;
  //       }
  //     }
  //     .info {
  //       overflow: hidden;
  //       .name {
  //         margin: 0 10px 5px;
  //         font-size: 18px;
  //         line-height: 24px;
  //         word-break: break-all;
  //         height: 48px;
  //         overflow: hidden;
  //         cursor: default;
  //         color: #333;
  //       }
  //     }
  //   }
  // }
  // .toTips {
  //   position: fixed;
  //   font-size: $font-size-base;
  //   left: 0;
  //   right: 0;
  //   bottom: 150px;
  //   box-sizing: border-box;
  //   color: $white;
  //   height: 30px;
  //   line-height: 30px;
  //   z-index: 2;
  //   overflow: hidden;
  //   padding: 0 10px;
  //   transition: all 0.5s;
  //   background: #be1100;
  //   &.toShow {
  //     transition: all 0.5s;
  //     bottom: 180px;
  //   }
  //   .contxt {
  //     overflow: hidden;
  //     i {
  //       font-size: 16px;
  //       vertical-align: middle;
  //       margin-right: 8px;
  //     }
  //   }
  //   .closeBtn {
  //     float: right;
  //     text-align: center;
  //     padding: 0 15px;
  //     border: 1px solid $white;
  //     height: 20px;
  //     line-height: 18px;
  //     box-sizing: border-box;
  //     font-size: 12px;
  //     margin: 5px 0 5px 20px;
  //     cursor: pointer;
  //   }
  // }
}
</style>

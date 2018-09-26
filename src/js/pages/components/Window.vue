<template lang="pug">
.window
  .header
    .headBox
      h1 coco
      .btnBox
        .iconBox(@click="minsize")
          Icon(type="md-remove" size="14")
        .iconBox(@click="maxsize")
          Icon(type="ios-browsers-outline" size="14")
        .iconBox.close(@click="appClose")
          Icon(type="md-close" size="14")
  .content
    router-view
  .footer
    | by xiek
    .btnBox
      Icon(type="md-home" size="14" @click="openUrl('http://bagazhu.com')")
      Icon(type="logo-github" size="14" @click="openUrl('https://github.com/xiek881028/coco')")
</template>

<script>
const { shell } = nodeRequire("electron");
const remote = nodeRequire("electron").remote;
const win = remote.getCurrentWindow();

import { Icon } from "iview";

export default {
  components: {
    Icon
  },
  methods: {
    appClose() {
      remote.app.quit();
    },
    maxsize() {
      win[win.isMaximized() ? "unmaximize" : "maximize"]();
    },
    minsize() {
      win.minimize();
    },
    openUrl(url) {
      shell.openExternal(url);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/css/_common.scss";

.window {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .header {
    background: $color-bg-base;
    height: 31px;
    .headBox{
      margin-top: 3px;
      display: flex;
      justify-content: space-between;
      -webkit-app-region: drag;
      .btnBox {
        text-align: right;
        display: flex;
        justify-content: flex-end;
        .iconBox {
          align-items: center;
          justify-content: center;
          -webkit-app-region: no-drag;
          i {
            color: rgba(255, 2552, 255, 0.5);
            padding: 3px 5px 0;
          }
          &:hover {
            background: rgba(255, 255, 255, 0.3);
            i {
              color: #fff;
            }
            &.close {
              background: #eb2f3f;
            }
          }
        }
      }
      h1 {
        padding-left: 10px;
        font-size: $font-size-base;
        font-weight: normal;
        line-height: 25px;
      }
    }
  }
  .content {
    display: flex;
    flex: 1;
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $primary-color;
    padding: 0 10px;
    .btnBox {
      display: flex;
      align-items: center;
      i {
        cursor: pointer;
        margin: 0 3px;
      }
    }
  }
}
</style>

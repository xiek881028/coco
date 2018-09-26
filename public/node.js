/*!
 * node
 * xiekai <xk285985285@.qq.com>
 * create: 2018/09/13
 * since: 0.0.1
 */
'use strict';
const fs = require('fs-extra');
const path = require('path');

module.exports.default = module.exports = {

  // 循环指定目录，输出目录内所有文件列表的数组
  // file 文件名或文件夹名
  // loop 是否循环遍历所有子目录
  fileTree: function (file, loop = true) {
    let fileList = [];
    function walk(file) {
      //如果入参是文件，直接加入数组返回
      if (!fs.statSync(file).isDirectory()) {
        fileList.push(file);
        return;
      }
      let dirlist = fs.readdirSync(file);
      dirlist.forEach(function (item) {
        let itemPath = path.resolve(file, item);
        if (fs.statSync(itemPath).isDirectory() && loop) {
          walk(itemPath);
        } else {
          fileList.push(itemPath);
        }
      });
    };
    walk(file);
    return fileList;
  },
}

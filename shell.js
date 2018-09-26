/*!
 * shell
 * xiekai <xk285985285@.qq.com>
 * create: 2017/11/30
 * update: 2017/12/11
 * since: 0.0.2
 */
'use strict';

const path = require('path');
const fs = require('fs-extra');
const dateFormat = require('cainfoharbor-utils/dateFormat');
const publicFn = require('./public/index');
const publicFn_node = require('./public/node');
const argv = require('yargs').argv;

/*
	key-value形式
	key: 包名，必须对应真实包名
	name: 文件夹名,不填以key值建立文件夹 unrequired
	path: 资源路径，不填默认node_modules unrequired
	assets: 资源列表,可以为字符串或数组,内容可为文件或文件夹 required
*/
const assets = {
  vue: { assets: { js: ['dist/vue.min.js', 'dist/vue.js'] } },
  'vue-router': { assets: { js: ['dist/vue-router.min.js', 'dist/vue-router.js'] } },
  // axios: { assets: { js: ['dist/axios.min.js', 'dist/axios.js'] } },
  // vuex: { assets: { js: 'dist/vuex.min.js' } },
};

/* release时需要忽略的dist中的文件或文件夹 */
const shellignore = ['assets', 'images'];

const outPath = 'dist';

const today = dateFormat('yyyy-MM-dd', new Date());

if (argv.h) {
  console.log(``);
  console.log(`查看帮助： npm run shell -- --h`);
  console.log(`开发环境初始化： npm run shell -- --init`);
  console.log(`添加页面模块： npm run shell -- --add --name <name>`);
  console.log(`删除页面模块： npm run shell -- --del --name <name>`);
  console.log(``);
}

if (argv.init) {
  console.log(`开始导入 assets, 配置列表在shell.js顶部的assets变量`);
  const distPath = path.resolve(__dirname, outPath);
  const assetsPath = path.resolve(distPath, 'assets');

  //dist不存在则创建
  let exists = fs.pathExistsSync(distPath);
  !exists && fs.ensureDirSync(distPath);
  //创建assets文件夹
  fs.emptyDirSync(assetsPath);
  addAssets();

  function addAssets() {
    //循环资源列表
    Object.keys(assets).map(params => {
      //设置资源文件夹名
      let dirName = assets[params].name || params;
      //创建资源文件夹
      fs.ensureDirSync(path.resolve(assetsPath, dirName));
      //设定资源路径
      const ASSETS_PATH = assets[params].path || 'node_modules';
      //循环资源文件
      Object.keys(assets[params].assets).map(assetObject => {
        //获取单个资源文件下的一个资源类型
        let _asset = assets[params].assets[assetObject];
        if (publicFn.isArray(_asset)) {
          //根据资源类型建立文件夹
          fs.ensureDirSync(path.resolve(assetsPath, dirName, assetObject));
          _asset.map(item => {
            //判断资源是文件还是文件夹来决定复制路径
            let copyPath = fs.statSync(path.resolve(__dirname, ASSETS_PATH, params, item)).isDirectory() ? '' : path.parse(item).base;
            //将资源从源路径复制到assets文件夹指定位置内
            fs.copySync(path.resolve(__dirname, ASSETS_PATH, params, item), path.resolve(assetsPath, dirName, assetObject, copyPath));
            console.log(`完成导入 ${params}/${assetObject} -> ${item}`);
          });
        } else if (typeof (_asset) == 'string') {
          //获取单个资源文件下的一个资源类型
          fs.ensureDirSync(path.resolve(assetsPath, dirName, assetObject));
          //判断资源是文件还是文件夹来决定复制路径
          let copyPath = fs.statSync(path.resolve(__dirname, ASSETS_PATH, params, _asset)).isDirectory() ? '' : path.parse(_asset).base;
          //将资源从源路径复制到assets文件夹指定位置内
          fs.copySync(path.resolve(__dirname, ASSETS_PATH, params, _asset), path.resolve(assetsPath, dirName, assetObject, copyPath));
          console.log(`完成导入 ${params}/${assetObject} -> ${_asset}`);
        };
      });
    });
  };
}

if (argv.add) {
  if (!argv.name || !argv.name.length) {
    console.error(`错误: 页面名称不能为空!`);
  } else {
    argv.name.split(',').map(name => {
      let same = 0;
      publicFn_node.fileTree(path.resolve(__dirname, 'src/html')).map(item => {
        if (name == path.parse(item).name) same = 1;
        return;
      });
      if (same) {
        console.error(`错误: ${name} 页面已存在!`);
      } else {
        fs.outputFileSync(path.resolve(__dirname, 'src/js/pages', `${name}.vue`),
          `/*!
* ${name}
* create: ${today}
* since: 0.0.1
*/

<template lang="pug">
</template>

<script>
export default {

components: {},

props: {},

data() {
  return {};
},

computed: {},

watch: {},

methods: {},

mounted() {},
}
</script>

<style lang="scss" scoped>
</style>`
        );
        console.log(`${name}.vue 创建成功 `);
      }
    });
  }
}

if (argv.del) {
  if (!argv.name || !argv.name.length) {
    console.error(`错误: 页面名称不能为空!`);
  } else {
    argv.name.split(',').map(name => {
      publicFn_node.fileTree(path.resolve(__dirname, 'src/js/pages')).map(item => {
        if (name == path.parse(item).name) {
          try {
            fs.removeSync(item);
            console.log(`${path.parse(item).base} 删除成功`);
          } catch (error) {
            throw error;
          }
          return;
        }
      });
    });
  }
}

if (argv.release) {
  let delPath = [];
  removeItem(shellignore, path.resolve(__dirname, outPath));

  function removeItem(ignore, findPath) {
    // 当前层忽略的路径数组
    let floorPathignore = [];
    // 忽略的源文件对象
    let ignoreObj = {};
    // 当前层级深度
    let basePathLen = findPath.split(path.sep).length;
    // 循环忽略数组
    ignore.map(item => {
      let itemPath = path.resolve(findPath, item);
      // 分割忽略文件路径
      let itemPathArr = itemPath.split(path.sep);
      if (itemPathArr[basePathLen] != undefined) {
        //忽略文件在当前层级的路径
        let nowPathIgnore = path.resolve(findPath, itemPathArr[basePathLen]);
        //当前层已经处理，不打入待处理对象
        if (nowPathIgnore != itemPath) {
          //新建待处理对象值为数组
          if (ignoreObj[nowPathIgnore] == undefined) {
            ignoreObj[nowPathIgnore] = [];
          }
          //将待处理对象打入
          ignoreObj[nowPathIgnore].push(itemPath);
        }
        floorPathignore.push(nowPathIgnore);
      }
    });
    // 需要进一步处理的文件路径数组
    let sum = publicFn.mathArr(publicFn_node.fileTree(path.resolve(findPath), false), floorPathignore, 'sum');
    // 一定会删除的文件路径数组
    let diff = publicFn.mathArr(publicFn_node.fileTree(path.resolve(findPath), false), sum);
    //循环需要进一步处理的文件对象
    Object.keys(ignoreObj).map(item => {
      removeItem(ignoreObj[item], item);
    });
    delPath.push(...diff);
  }
  delPath.map(item => {
    fs.removeSync(item);
  });
}

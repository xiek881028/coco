COCO 是一个基于局域网的内网传输软件，基于electron制作。

其原理是通过监听PC上一个随机的端口建立一个本地http服务，另一设备访问PC上对应端口接收文件。

## 注意事项
两台设备必须处于同一个局域网环境下。

## 连接失败
如果确定在同一局域网却一直连接失败，可能是因为防火墙阻拦所致。
### win10
控制面板 -> Windows Defender 防火墙 -> 允许应用或功能通过Windows Defender 防火墙 -> 更改设置
允许应用通过防火墙即可。

## 快速开始
```sh
# 安装依赖
cnpm i

# 前端项目依赖资源包引入
npm run shell -- --init

# 编译前台模板（开发 or 生产）
npm start
或
npm run release

# 启动electron（开发）
npm run el

# 发布应用(测试包)
npm run pack
# 发布应用(正式包)
npm run build
```

## 许可证（License）
MIT

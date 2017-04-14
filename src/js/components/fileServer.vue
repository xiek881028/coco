<template lang="pug">
div(class="fileBox")
	ul(class="list")
		li(v-for="item in fileList" v-bind:class="{hasErr:item.notDir}")
			div(class="box")
				div(class="img" ref="qrcode")
					img(v-bind:src="item.url")
				div(class="info")
					div(class="name" v-bind:title="item.name") {{item.name}}
				div(class="opt")
					span(class="del" v-on:click="del(item)") 删除
					span(class="gps" v-on:click="openFile(item.path)") 定位文件
	div(class="upload")
		span(ref="dropBox" v-bind:class="{hover:isHover}") 请将文件拖曳到此区域
</template>

<script>
// import getVideo from './video.vue';
const {shell} = nodeRequire('electron').remote;
const net = nodeRequire('http');
const os = nodeRequire('os');
const fs = nodeRequire('fs');
const url = nodeRequire('url');
const querystring = nodeRequire('querystring');
const qrCode = nodeRequire('qrcode');
const network = os.networkInterfaces();

export default {

	// components: {
	// 	getVideo,
	// },

	data: ()=>{
		return {
			ip : String,
			isHover: false,
			fileList: [],
			id: 0,
		}
	},

	mounted: function(){
		//获取内网地址
		Object.keys(network).map((item)=>{
			for(let i=0,max=network[item].length; i<max; i++){
				/^(192)/.test(network[item][i].address) && network[item][i].family == 'IPv4' ? this.ip = network[item][i].address:'';
			};
		});

		//访问服务后的业务逻辑
		let server = net.createServer((req,res) => {
			let queryId = querystring.parse(url.parse(req.url).query).id,
				idJson;
			for(let i=0,max=this.fileList.length; i<max; i++){
				if(this.fileList[i].id == queryId){
					idJson = this.fileList[i];
					break;
				};
			};
			if(idJson){
				let stream = fs.createReadStream(idJson.path);
				stream.on("error",function(){
					res.writeHeader(404);
					res.end();
				});
				//写入头部type为流文件 确定支持chrome、firefox、IE
				res.writeHeader(200,{
					'Content-Type': 'application/force-download',
					'Content-Disposition': 'attachment; filename='+ querystring.escape(idJson.name) + ';filename*=utf-8\'\'' + querystring.escape(idJson.name),
				});
				//返回文件内容
				stream.pipe(res);
			}else{
				res.writeHeader(404);
				res.end();
			};
		}).on('error', (err) => {
			throw err;
		});

		//随机监听一个空闲端口
		server.listen(() => {
			console.log(this.ip + ':' + server.address().port);
		});

		document.ondragleave = (e)=>{
			e.preventDefault();
		};
		document.ondrop = (e)=>{
			e.preventDefault();
		};
		document.ondragenter = (e)=>{
			e.preventDefault();
		};
		document.ondragover = (e)=>{
			e.preventDefault();
		};
		//拖入后释放
		this.$refs.dropBox.addEventListener('drop',(e)=>{
			let file = e.dataTransfer.files,
				fileArr = [];
			e.preventDefault();
			this.isHover = false;
			if(file.length){
				Object.keys(file).map((item)=>{
					//加入id标识文件唯一
					file[item].id = this.id;
					this.id += 1;
					fs.stat(file[item].path,(err, stats)=>{
						//文件夹过滤
						if(!stats.isDirectory()){
							file[item].notDir = false;
							//生成二维码
							qrCode.toDataURL('http://' + this.ip + ':' + server.address().port + '?id=' + file[item].id, {
								errorCorrectionLevel:'M',
								margin:1,
								scale:4,
								color:{
									dark: '000000ff',
								},
							}, (err, url)=>{
								file[item].url = url;
								this.fileList.unshift(file[item]);
								console.log(this.fileList);
							});
						};
					});
				});
			};
		});
		//拖入
		this.$refs.dropBox.addEventListener('dragenter',(e)=>{
			this.isHover = true;
		});
		//拖出
		this.$refs.dropBox.addEventListener('dragleave',(e)=>{
			this.isHover = false;
		});
	},

	methods :{
		mathSize: function(size){
			let carry = size/1024,
				capacity = ['byte',''],
				_size;
			if(carry>1024){
				_size = this.mathSize(carry);
			}else if(carry < 1){
				_size = size;
			}else{
				_size = (Math.floor(carry*100)/100).toFixed(2);
			};
			return _size;
		},
		openFile: function(path){
			shell.showItemInFolder(path);
		},
		del: function(item){
			for(let i=0,max=this.fileList.length; i<max; i++){
				if(this.fileList[i].id == item.id){
					this.fileList.splice(i,1);
					break;
				};
			};
		},
	},

};
</script>

<style lang="scss" scoped>
@import '../../css/config';

.fileBox{
	position:absolute;
	top:0;
	bottom:0;
	left:0;
	right:0;
}

.fileBox .upload{
	position:fixed;
	bottom:0;
	left:0;
	right:0;
	height:180px;
	background:#333;
}

.fileBox .upload span{
	display:block;
	width:80%;
	margin:0 auto;
	box-sizing:border-box;
	padding:0 20px;
	height:140px;
	margin-top:20px;
	border:3px dashed #a3a3a3;
	font-size:32px;
	line-height:140px;
	text-align:center;
	color:#a3a3a3;
	overflow:hidden;
}

.fileBox .upload span.hover{
	color:#fff;
	border-color:#fff;
}

.fileBox ul{
	position:absolute;
	top:0;
	left:0;
	right:0;
	bottom:180px;
	margin:0 20px 0 0;
	padding:0 0 20px 0;
	overflow-y:auto;
}

.fileBox ul li{
	list-style-type:none;
	margin:20px 0 0 20px;
	height:260px;
	overflow:hidden;
	float:left;
	width:175px;
	box-sizing:border-box;
	background:#fff;
}

.fileBox ul li .img{
	display:block;
	width:175px;
	height:175px;
	margin:0 auto;
}

.fileBox ul li .img img{
	width:100%;
	height:100%;
	display:block;
}

.fileBox ul li .opt{
	text-align:center;
}

.fileBox ul li .opt span{
	font-size:12px;
	line-height:16px;
	height:16px;
	color:#fff;
	text-align:center;
	display:inline-block;
	margin:0 7px;
	padding:2px;
	width:55px;
	border-radius:2px;
	cursor:pointer;
}

.fileBox ul li .opt .del{
	background-color:#d9534f;
}

.fileBox ul li .opt .gps{
	background-color:#337ab7;
}

.fileBox ul li .info{
	overflow:hidden;
}

.fileBox ul li .info .name{
	margin:0 10px 5px;
	font-size:18px;
	line-height:24px;
	word-break:break-all;
	height:48px;
	overflow:hidden;
	cursor:default;
	color:#333;
}

</style>

<template lang="pug">
div(class="fileBox")
	ul(class="list")
		li(v-for="item in fileList" v-bind:class="{hasErr:item.notDir}")
			div(class="box")
				div(class="opt")
					span(class="del") 删除
					span(class="gps") 定位文件
				div(class="img" ref="qrcode")
					img(v-bind:src="item.url")
				div(class="info")
					div(class="name" v-bind:title="item.name") {{item.name}}
	div(class="upload")
		span(ref="dropBox" v-bind:class="{hover:isHover}") 请将文件拖曳到此区域
</template>

<script>
// import getVideo from './video.vue';
const remote = nodeRequire('electron').remote;
const net = nodeRequire('http');
const os = nodeRequire('os');
const fs = nodeRequire('fs');
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
			let stream = fs.createReadStream('networkFile' + req.url);
			stream.on("error",function(){
				res.writeHeader(404);
				res.end();
			});
			//写入头部type为流文件
			res.writeHeader(200,{
				'Content-Type': 'application/octet-stream',
			});
			//返回文件内容
			stream.pipe(res);
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
					fs.stat(file[item].path,(err, stats)=>{
						if(!stats.isDirectory()){
							file[item].notDir = false;
							console.log(file[item]._size);
							qrCode.toDataURL(file[item].path, {
								errorCorrectionLevel:'M',
								margin:1,
								scale:4,
								color:{
									dark: '000000ff',
								},
							}, (err, url)=>{
								file[item].url = url;
								this.fileList.push(file[item]);
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
	margin:0;
	padding:0;
	overflow-y:auto;
}

.fileBox ul li{
	list-style-type:none;
	margin:0 20px;
	height:150px;
	overflow:hidden;
	border-bottom:1px solid #a3a3a3;
}

.fileBox ul li>.box{
	padding:0 22px;
	height:100%;
}

.fileBox ul li:last-child{
	border-bottom:none;
}

.fileBox ul li .img{
	display:block;
	float:right;
	width:128px;
	height:128px;
	margin:11px 30px 0;
	background:#fff;
}

.fileBox ul li .img img{
	width:100%;
	height:100%;
	display:block;
}

.fileBox ul li .opt{
	display:block;
	float:right;
	width:80px;
	margin-top:28px;
}

.fileBox ul li .opt span{
	line-height:16px;
	height:16px;
	color:#fff;
	text-align:center;
	display:block;
	padding:3px 5px;
	width:60px;
	margin:0 auto;
	margin-top:18px;
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
	margin-top:28px;
	font-size:24px;
	line-height:32px;
	word-break:break-all;
	height:96px;
	overflow:hidden;
	cursor:default;
}

</style>

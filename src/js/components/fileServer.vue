<template lang="pug">
div(class="fileBox")
	ul(class="list")
		li(v-for="item in fileList")
			div(class="img")
			div(class="opt")
			div(class="info")
				div {{item.name}}
				div {{item.path}}
				div {{item.size}}
	div(class="upload")
		span(ref="dropBox" v-bind:class="{hover:isHover}") 请将文件拖曳到此区域
</template>

<script>
// import getVideo from './video.vue';
const remote = nodeRequire('electron').remote;
const net = nodeRequire('http');
const os = nodeRequire('os');
const fs = nodeRequire('fs');
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
		let _this = this;
		//获取内网地址
		Object.keys(network).map(function(item){
			for(let i=0,max=network[item].length; i<max; i++){
				/^(192)/.test(network[item][i].address) && network[item][i].family == 'IPv4' ? _this.ip = network[item][i].address:'';
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
			let file = e.dataTransfer.files;
			e.preventDefault();
			this.isHover = false;
			if(file.length){
				Object.keys(file).map((item)=>{
					this.fileList.push(file[item]);
					console.log(file[item]);
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
		mathSize: function(){
			console.log(1);
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
}

.fileBox ul li{
	list-style-type:none;
	margin:0 20px;
	overflow:hidden;
	border-bottom:1px solid #a3a3a3;
}

.fileBox ul li .img{
	display:block;
	float:right;
	width:130px;
	height:130px;
	margin:10px;
}

</style>

<template lang="pug">
div(class="window")
	div(class="title")
		div(class="btnBox")
			i(class="fa fa-times close" v-on:click="appClose")
			i(class="fa fa-window-maximize" v-on:click="maxsize")
			i(class="fa fa-window-minimize" v-on:click="minsize")
		h1 {{title}}
	div(class="content")
		slot
</template>

<script>
const remote = nodeRequire('electron').remote;
const win = remote.getCurrentWindow();

export default {

	props: {
		title: String
	},

	methods :{
		appClose(){
			remote.app.quit()
		},
		maxsize(){
			win[win.isMaximized()?'unmaximize':'maximize']();
		},
		minsize(){
			win.minimize();
		},
	},

};
</script>

<style lang="scss" scoped>
@import '../../css/config';

.window{
	position:absolute;
	top:0;
	bottom:0;
	left:0;
	right:0;
}

.window>.title {
	background:#3d3d3d;
	position:fixed;
	top:0;
	left:0;
	right:0;
	height:25px;
	line-height:30px;
	overflow:hidden;
	z-index:9999;
	-webkit-app-region: drag;

	.btnBox{
		float:right;
		width:80px;
		height:100%;
		text-align:right;
		overflow:hidden;
		box-sizing:border-box;
		margin-right:5px;

		i{
			font-size:11px;
			float:right;
			color:rgba(255,2552,255,.5);
			padding:8px 5px 0;
			height:100%;
			box-sizing:border-box;
			-webkit-app-region: no-drag;

			&.close{
				padding-top:5px;
				font-size:14px;
			}

			&:hover{
				color:#fff;
				background:rgba(255,255,255,.3);
			}
		}
	}

	h1{
		padding-left:10px;
		font-size:14px;
		margin:0;
		overflow:hidden;
		height:25px;
		line-height:25px;
		font-weight:normal;
	}
}

.window>.content{
	position:fixed;
	top:25px;
	bottom:0;
	left:0;
	right:0;
	overflow:auto;
}

</style>

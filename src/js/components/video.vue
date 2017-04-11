<template lang="pug">
div(class="videoBox")
	video(ref="video")
</template>

<script>
export default {

	props: {
	},

	mounted: function(){
		let _this = this;
		navigator.mediaDevices.getUserMedia({video:true})
		.then(function(media){
			var video = _this.$refs.video;
			video.src = window.URL.createObjectURL(media);
			video.play();
		});
	},

	methods :{
	},

};
</script>

<style lang="scss" scoped>
@import '../../css/config';

.videoBox{
	position:absolute;
	top:0;
	bottom:0;
	left:0;
	right:0;
}

.videoBox video{
	display:block;
	width:100%;
	height:100%;
}

</style>

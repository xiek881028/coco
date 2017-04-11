<template lang="pug">
div(class="demo")
	p {{cpu}}
	iframe(src="./video.html" ref="iframe")
	button(v-on:click="closeIframe") 关闭
</template>

<script>
import getVideo from './video.vue';

const os = nodeRequire('os');
export default {

	components: {
		getVideo,
	},

	data: ()=>{
		return {
			cpu: os.cpus()
		}
	},

	mounted: function(){
	},

	methods :{
		closeIframe: function(){
			let iframe = this.$refs.iframe;
			console.log(iframe.parentNode);
			iframe.parentNode.removeChild(iframe);
		},
	},

};
</script>

<style lang="scss" scoped>
@import '../../css/config';

iframe{
	border:0;
}

</style>

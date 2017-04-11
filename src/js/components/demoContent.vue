<template lang="pug">
div(class="demo")
	p {{cpu}}
	iframe(src="./video.html")
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

	props: {
	},

	mounted: function(){
	},

	methods :{
	},

};
</script>

<style lang="scss" scoped>
@import '../../css/config';

iframe{
	border:0;
}

</style>

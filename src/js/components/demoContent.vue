<template lang="pug">
div(class="demo")
</template>

<script>
// import getVideo from './video.vue';
const remote = nodeRequire('electron').remote;
const net = nodeRequire('net');
const os = nodeRequire('os');

export default {

	// components: {
	// 	getVideo,
	// },

	data: ()=>{
		return {
		}
	},

	mounted: function(){
		let server = net.createServer((req,res) => {
			console.log(req.localAddress);
			console.log(os.networkInterfaces());
		}).on('error', (err) => {
			throw err;
		});

		// grab a random port.
		server.listen(() => {
			console.log('opened server on', server.address());
		});
	},

	methods :{
	},

};
</script>

<style lang="scss" scoped>
@import '../../css/config';

</style>

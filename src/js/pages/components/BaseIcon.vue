/*!
* BaseLayout
* create: 2017-12-06
* since: 0.0.1
*/

<template lang="pug">
  svg.icon(aria-hidden="true")
    use(:xlink:href="`#${type}`")
</template>

<script>
import '@/assets/iconfont/iconfont';
export default{
  props: {
    type: String
  }
}
</script>

<style lang="scss" scoped>
.icon{
  width: 1em; height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  box-sizing: content-box;
}
</style>

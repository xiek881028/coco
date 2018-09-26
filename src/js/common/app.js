/*!
 * common
 * create: 2017/11/30
 * since: 0.0.1
 */
'use strict';

// Css
import '@/css/_reset.scss';
import '@/css/_theme.less';
import '@/css/_common.scss';

import Vue from 'vue';
import { Message } from 'iview';
import pages from '../pages';
import Window from '../pages/components/Window.vue';

if(process.env.NODE_ENV === 'production'){
  window.console.log = function() {};
}

Message.config({
  duration: 2,
  top: 30,
});
Vue.prototype.$Message = Message;

new Vue({
  el: '#app',
  router: pages,
  components: {
    Window
  },
  data: {
    Bus: new Vue(),
  },
});


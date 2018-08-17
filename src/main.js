import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
// import '@/locale';
import 'iview/dist/styles/iview.css';
import util from '@/libs/util.js';

// import VueI18n from 'vue-i18n';
// import util from './libs/util';
// Vue.use(VueI18n);
Vue.use(iView);

Vue.prototype.util = util;

Vue.prototype.$config = require('../build/config.json');

Vue.filter('num', function (value) {
    if (!value) return 0;
    else return Number(value);
});

Vue.filter('wan', function (value) {
    if (!value) return '';
    return value / 10000;
});

Vue.prototype.round = function (num) {
    let digit = Math.pow(10, 8); // 精度小数点8位
    return Math.round(num * digit) / digit;
};

// a是对象 b是对象属性 c是参考值 d是格式化系数
Vue.prototype.formatValue = function (a, b, c, d) {
    a[b] = this.round(c * d || 0);
};

import Echo from 'laravel-echo';
window.io = require('socket.io-client');

window.Echo = new Echo({
    broadcaster: 'socket.io',
    host: '192.168.33.10:6001'
});

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        // 此处主要是菜单高亮处 在main.vue中才是菜单过滤
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        // util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    }
});

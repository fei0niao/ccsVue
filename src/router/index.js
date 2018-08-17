import Vue from 'vue';
import iView from 'iview';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import {routers, otherRouter, appRouter, noAuthRouters} from './router';

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    // mode: 'history',
    base: '/admin/',
    routes: routers
};

export const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    iView.LoadingBar.start();
    Util.title(to.meta.title);
    if (Cookies.get('locking') === '1' && to.name !== 'locking') { // 判断当前是否是锁定状态
        next({
            replace: true,
            name: 'locking'
        });
    } else if (Cookies.get('locking') === '0' && to.name === 'locking') {
        next(false);
    } else {
        if (!Cookies.get('token') && to.name !== 'login') { // 判断是否已经登录且前往的页面不是登录页
            next({
                name: 'login'
            });
            // next();
        } else if (Cookies.get('token') && to.name === 'login') { // 判断是否已经登录且前往的是登录页
            Cookies.remove('token');
            Cookies.remove('refresh_token');
            Cookies.remove('access');
            next();
        } else {
            let NoNeedAuth = noAuthRouters.find(child => {
                if (child.children) {
                    return child.children.find(subChild => {
                        return subChild.name === to.name;
                    });
                }
                return child.name === to.name;
            });
            if (NoNeedAuth) {
                return next();
            }
            let permission = JSON.parse(localStorage.permission);
            if (permission.indexOf(to.name) > -1) {
                return next();
            } else {
                next({
                    replace: true,
                    name: 'error-403'
                });
            }
        }
    }
});

router.afterEach((to) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    iView.LoadingBar.finish();
    window.scrollTo(0, 0);
});

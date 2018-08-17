import axios from 'axios';
import semver from 'semver';
import packjson from '../../package.json';
import Cookies from 'js-cookie';
const config = require('../../build/config.json');

let util = {};
util.title = function (title) {
    title = title || '';//浏览器标题名称
    window.document.title = '';
};
util.ajaxUrl = config.env === 'development'
    ? config.developmentApiUrl
    : config.env === 'production'
        ? config.productionApiUrl
        : 'https://debug.url.com';
const VERSION = '201802061000';
util.headers = function () {
    let token = Cookies.get('token');
    let Authorization = token ? 'Bearer ' + token : '';
    return {'Authorization': Authorization, 'X-CustomHeader': VERSION};
}
util.ajax = function (vm) {
    // todo以后要把create移到函数外面去 避免每次都实例
    let axiosInstance = axios.create({
        baseURL: util.ajaxUrl,
        timeout: 30000,
        headers: util.headers()
    });
    // 添加一个请求拦截器
    axiosInstance.interceptors.request.use(function (config) {
        vm.loading = true;
        return config;
    }, function (e) {
        return Promise.reject(e.response);
    });
    // 添加一个响应拦截器
    axiosInstance.interceptors.response.use(function (res) {
        vm.loading = false;
        return res.data;
    }, function (e) {
        vm.loading = false;
        console.log(e.response);
        if (e.response.status == 401) {
            if (vm.$route.name == 'login') {
                vm.$Notice.info({title: '账号或密码错误！', desc: '', duration: 4});
            } else {
                vm.$store.commit('logout', vm);
                vm.$store.commit('clearOpenedSubmenu');
                vm.$router.push({name: 'login'});
                vm.$Notice.info({title: '登录已失效,请重新登录!', desc: '', duration: 4});
            }
        } else if (e.response.status == 403) {
            vm.$Notice.info({title: '你没有权限!', desc: '', duration: 4});
            vm.$router.replace({name: 'homeIndex'}); //跳转到首页
            //vm.$router.go(-1);
            util.initLoginInfo(vm).then(res => {
                vm.$store.commit('updateMenulist'); //无刷新更新
                vm.$store.commit('clearAllTags');
                // location.reload(true); //强制更新
            });
        } else if (msgs[e.response.status]) vm.$Notice.info({title: msgs[e.response.status], desc: '', duration: 4});
        else vm.$Notice.info({title: '网络错误！', desc: '', duration: 4});
        return Promise.reject(e.response); // promise reject这里可以被后面执行到的catch到错误
    });
    return axiosInstance;
};

util.initLoginInfo = function (vm) {
    return util.ajax(vm).post('v1/loginInfo').then(res => {
        vm.$store.commit('clearAllTags');
        vm.$store.commit('setUserInfo', JSON.stringify(res.data.userInfo));
        vm.$store.commit('setPermission', JSON.stringify(res.data.permission));
        vm.$store.commit('setSystemParam', JSON.stringify(res.data.systemParam));
    });
};

util.valid = function (vm, ref) {
    if (!ref) return Promise.resolve(true);
    return vm.$refs[ref].validate((valid) => {
        vm.okloading = false;
        vm.$nextTick(() => {
            vm.okloading = true;
        });
    });
};

const msgs = {
    400: '语义有误，当前请求无法被服务器理解,请求参数有误',
    401: '登录已失效,请重新登录!',
    429: '网络请求次数太频繁了',
    404: '请求失败，请求所希望得到的资源未被在服务器上发现',
    405: '请求行中指定的请求方法不能被用于请求相应的资源',
    412: '图像验证码错误,服务器在验证在请求的头字段中给出先决条件时，没能满足其中的一个或多个',
    500: '请求失败，请与管理员联系',
    777: '请求超时或网络故障'
};

util.notice = function (vm, res) {
    let status = res.status;
    if (!status) vm.$Notice.warning({title: '失败', desc: res.msg, duration: 4});
    else vm.$Notice.success({title: '成功', desc: res.msg, duration: 4});
};

// arr为需要obj中的字段集合 返回新的对象
util.objFilter = function (obj, arr) {
    let newObj = {};
    arr.forEach(function (value) {
        newObj[value] = obj[value];
    });
    return newObj;
};

util.toTree = function toTree(data) {
    // 将数据存储为 以 id 为 KEY 的 map 索引数据列
    let map = {};
    data.forEach(function (item) {
        // 删除 所有 children,以防止多次调用
        delete item.children;
        map[item.id] = item;
    });
    // console.log(map);
    let val = [];
    data.forEach(function (item) {
        // 以当前遍历项，的pid,去map对象中找到索引的id
        let parent = map[item.pid];
        // 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
        if (parent) {
            (parent.children || (parent.children = [])).push(item);
        } else {
            //如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
            val.push(item);
        }
    });
    return val;
};

// 时间格式化
util.dateFMT = function (fmt, date) {
    if (!date) date = new Date(); // 如果没传入date对象 则new一个
    let o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds(), // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

util.permission = function (item) {
    if (!localStorage.permission) return false;
    let permission = JSON.parse(localStorage.permission);
    return permission.indexOf(item) > -1;
};

util.inOf = function (arr, targetArr) {
    let res = true;
    arr.forEach(item => {
        if (targetArr.indexOf(item) < 0) {
            res = false;
        }
    });
    return res;
};

util.oneOf = function (ele, targetArr) {
    if (targetArr.indexOf(ele) >= 0) {
        return true;
    } else {
        return false;
    }
};

util.showThisRoute = function (itAccess, currentAccess) {
    if (typeof itAccess === 'object' && Array.isArray(itAccess)) {
        return util.oneOf(currentAccess, itAccess);
    } else {
        return itAccess === currentAccess;
    }
};

util.getRouterObjByName = function (routers, name) {
    if (!name || !routers || !routers.length) {
        return null;
    }
    // debugger;
    let routerObj = null;
    for (let item of routers) {
        if (item.name === name) {
            return item;
        }
        routerObj = util.getRouterObjByName(item.children, name);
        if (routerObj) {
            return routerObj;
        }
    }
    return null;
};

util.handleTitle = function (vm, item) {
    return item.meta.title;
};

util.setCurrentPath = function (vm, name) {
    let title = '';
    let isOtherRouter = false;
    vm.$store.state.app.routers.forEach(item => {
        if (item.children.length === 1) {
            if (item.children[0].name === name) {
                title = util.handleTitle(vm, item);
                if (item.name === 'otherRouter') {
                    isOtherRouter = true;
                }
            }
        } else {
            item.children.forEach(child => {
                if (child.name === name) {
                    title = util.handleTitle(vm, child);
                    if (item.name === 'otherRouter') {
                        isOtherRouter = true;
                    }
                }
            });
        }
    });
    let currentPathArr = [];
    if (name === 'homeIndex') {
        currentPathArr = [
            {
                meta: {title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'homeIndex'))},
                path: '',
                name: 'homeIndex'
            }
        ];
    } else if ((name.indexOf('Index') >= 0 || isOtherRouter) && name !== 'homeIndex') {
        currentPathArr = [
            {
                meta: {title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'homeIndex'))},
                path: '/home',
                name: 'homeIndex'
            },
            {
                meta: {title: title},
                path: '',
                name: name
            }
        ];
    } else {
        let currentPathObj = vm.$store.state.app.routers.filter(item => {
            if (item.children.length <= 1) {
                return item.children[0].name === name;
            } else {
                let i = 0;
                let childArr = item.children;
                let len = childArr.length;
                while (i < len) {
                    if (childArr[i].name === name) {
                        return true;
                    }
                    i++;
                }
                return false;
            }
        })[0];
        if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
            currentPathArr = [
                {
                    meta: {title: '首页'},
                    path: '',
                    name: 'homeIndex'
                }
            ];
        } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
            currentPathArr = [
                {
                    meta: {title: '首页'},
                    path: '/home',
                    name: 'homeIndex'
                },
                {
                    meta: {title: currentPathObj.meta.title},
                    path: '',
                    name: name
                }
            ];
        } else {
            let childObj = currentPathObj.children.filter((child) => {
                return child.name === name;
            })[0];
            currentPathArr = [
                {
                    meta: {title: '首页'},
                    path: '/home',
                    name: 'homeIndex'
                },
                {
                    meta: {title: currentPathObj.meta.title},
                    path: '',
                    name: currentPathObj.name
                },
                {
                    meta: {title: childObj.meta.title},
                    path: currentPathObj.path + '/' + childObj.path,
                    name: name
                }
            ];
        }
    }
    vm.$store.commit('setCurrentPath', currentPathArr);

    return currentPathArr;
};

util.openNewPage = function (vm, name, argu, query) {
    let pageOpenedList = vm.$store.state.app.pageOpenedList;
    let openedPageLen = pageOpenedList.length;
    let i = 0;
    let tagHasOpened = false;
    while (i < openedPageLen) {
        if (name === pageOpenedList[i].name) { // 页面已经打开
            vm.$store.commit('pageOpenedList', {
                index: i,
                argu: argu,
                query: query
            });
            tagHasOpened = true;
            break;
        }
        i++;
    }
    if (!tagHasOpened) {
        let tag = vm.$store.state.app.tagsList.filter((item) => {
            if (item.children) {
                return name === item.children[0].name;
            } else {
                return name === item.name;
            }
        });
        tag = tag[0];
        if (tag) {
            tag = tag.children ? tag.children[0] : tag;
            if (argu) {
                tag.argu = argu;
            }
            if (query) {
                tag.query = query;
            }
            vm.$store.commit('increateTag', tag);
        }
    }
    vm.$store.commit('setCurrentPageName', name);
};

// 如果在地址栏输入的是一级菜单则默认打开其第一个二级菜单的页面
util.toDefaultPage = function (routers, name, route, next) {
    let len = routers.length;
    let i = 0;
    let notHandle = true;
    while (i < len) {
        if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
            route.replace({
                name: routers[i].children[0].name
            });
            notHandle = false;
            next();
            break;
        }
        i++;
    }
    if (notHandle) {
        next();
    }
};

util.fullscreenEvent = function (vm) {
    // 权限菜单过滤相关
    vm.$store.commit('updateMenulist');
    // 全屏相关
};

util.checkUpdate = function (vm) {
    axios.get('https://api.github.com/repos/iview/iview-admin/releases/latest').then(res => {
        let version = res.data.tag_name;
        vm.$Notice.config({
            duration: 0
        });
        if (semver.lt(packjson.version, version)) {
            vm.$Notice.info({
                title: 'iview-admin更新啦',
                desc: '<p>iView-admin更新到了' + version + '了，去看看有哪些变化吧</p><a style="font-size:13px;" href="https://github.com/iview/iview-admin/releases" target="_blank">前往github查看</a>'
            });
        }
    });
};

export default util;

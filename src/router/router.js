import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/login.vue')
};

// *号匹配 到404 很妙~
export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/error-page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: () => import('@//views/error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: () => import('@/views/error-page/500.vue')
};


export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/main-components/lockscreen/components/locking-page.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        {path: 'home',  meta: {title: '主页'}, name: 'homeIndex', component: () => import('@/views/home/home.vue')},
        {path: 'ownspace',  meta: {title: '个人中心'}, name: 'ownspaceIndex', component: () => import('@/views/own-space/own-space.vue')},
        {path: 'message', meta: {title: '消息中心'}, name: 'messageIndex', component: () => import('@/views/message/message.vue')}
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/agent',
        icon: 'ios-world-outline',
        name: 'agent',
        redirect: '/agent/agentList',
        meta: {
            title: '机构管理'
        },
        component: Main,
        children: [
            {
                path: 'agentList', name: 'agentList', meta: {title: '机构列表',keepAlive: true},
                component: () => import('@/views/agent/agentList.vue')
            },
            {
                path: 'create', name: 'agentCreate', meta: {name: 'agentList', title: '创建机构'},
                component: () => import('@/views/agent/agentCreate.vue')
            },
            {
                path: 'update/:id', name: 'agentUpdate', meta: {name: 'agentList', title: '修改机构配置'},
                component: () => import('@/views/agent/agentUpdate.vue')
            },
        ]
    },
    {
        path: '/system',
        icon: 'gear-b',
        name: 'system',
        redirect: '/system/holidayList',
        meta: {
            title: '系统管理'
        },
        component: Main,
        children: [
            {
                path: 'holidayList', name: 'holidayList', meta: {title: '节假日管理',keepAlive: true},
                component: () => import('@/views/system/holidayList.vue')
            },
            {
                path: 'stockList', name: 'stockList', meta: {title: '股票代码',keepAlive: true},
                component: () => import('@/views/system/stockList.vue')
            },
            {
                path: 'systemParamList', name: 'paramList', meta: {title: '系统设置',keepAlive: true},
                component: () => import('@/views/system/paramList.vue')
            },
            /*{path: 'riskList', name: 'riskList', title: '风控模板',
             component: () => import('@/views/my-components/text-editor/text-editor.vue')}*/
        ]
    },
    {
        path: '/role',
        icon: 'locked',
        name: 'role',
        redirect: '/role/adminList',
        meta: {
            title: '权限管理'
        },
        component: Main,
        children: [
            {
                path: 'adminList', name: 'adminList', meta: {title: '用户管理',keepAlive: true},
                component: () => import('@/views/system/adminList.vue')
            },
            {
                path: 'roleList', name: 'roleList', meta: {title: '角色管理',keepAlive: true},
                component: () => import('@/views/system/roleList.vue')
            },
            {
                path: 'permissionList', name: 'permissionList', meta: {title: '权限列表',keepAlive: true},
                component: () => import('@/views/system/permissionList.vue')
            },
            {
                path: 'rolePermission', name: 'rolePermission', meta: {title: '权限配置',keepAlive: true},
                component: () => import('@/views/system/rolePermission.vue')
            }
        ]
    },
    {
        path: '/customer',
        icon: 'person-add',
        name: 'customer',
        redirect: '/customer/list',
        meta: {
            title: '客户管理'
        },
        component: Main,
        children: [
            {
                path: 'list', name: 'customerList', meta: {title: '客户列表',keepAlive: true},
                component: () => import('@/views/customer/customerList.vue')
            },
            {
                path: 'contractCreate/:id', name: 'contractCreate', meta: {name: 'customerList', title: '开合约'},
                component: () => import('@/views/customer/contractCreate.vue')
            },
            {
                path: 'msgList', name: 'customerMsgList', meta: {title: '短信管理',keepAlive: true},
                component: () => import('@/views/customer/customerMsgList.vue')
            },
        ]
    },
    {
        path: '/contract',
        icon: 'compose',
        name: 'contract',
        redirect: '/contract/list',
        meta: {
            title: '合约管理'
        },
        component: Main,
        children: [
            {
                path: 'list', name: 'contractList', meta: {title: '操盘合约',keepAlive: true},
                component: () => import('@/views/contract/contractList.vue')
            },
            {
                path: 'closedList', name: 'closedContractList', meta: {name: 'contractList', title: '已关闭合约',keepAlive: true},
                component: () => import('@/views/contract/closedContractList.vue')
            },
            {
                path: 'update/:id', name: 'contractUpdate', meta: {name: 'contractList', title: '修改合约'},
                component: () => import('@/views/contract/contractUpdate.vue')
            },
            {
                path: 'capitalPoolList', name: 'capitalPoolList', meta: {title: '资金池管理',keepAlive: true},
                component: () => import('@/views/contract/capitalPoolList.vue')
            },
            {
                path: 'parentAccountList', name: 'parentAccountList', meta: {title: '操盘母账户管理',keepAlive: true},
                component: () => import('@/views/contract/parentAccountList.vue')
            },
            {
                path: 'xrdrList', name: 'xrdrList', meta: {title: '除权降息管理',keepAlive: true},
                component: () => import('@/views/contract/xrdrList.vue')
            },
        ]
    },
    {
        path: '/trade',
        icon: 'social-usd',
        name: 'trade',
        redirect: '/trade/todayEntrustList',
        meta: {
            title: '交易管理'
        },
        component: Main,
        children: [
            {
                path: 'todayEntrustList', name: 'todayEntrustList', meta: {title: '当日委托',keepAlive: true},
                component: () => import('@/views/trade/todayEntrustList.vue')
            },
            {
                path: 'todayDealList', name: 'todayDealList', meta: {title: '当日成交',keepAlive: true},
                component: () => import('@/views/trade/todayDealList.vue')
            },
            {
                path: 'historyEntrustList', name: 'historyEntrustList', meta: {title: '历史委托',keepAlive: true},
                component: () => import('@/views/trade/historyEntrustList.vue')
            },
            {
                path: 'historyDealList', name: 'historyDealList', meta: {title: '历史成交',keepAlive: true},
                component: () => import('@/views/trade/historyDealList.vue')
            },
            {
                path: 'tradeFlowList', name: 'tradeFlowList', meta: {title: '资金流水',keepAlive: true},
                component: () => import('@/views/trade/tradeFlowList.vue')
            },
            {
                path: 'holdingList', name: 'holdingList', meta: {title: '持仓股份',keepAlive: true},
                component: () => import('@/views/trade/holdingList.vue')
            },
            {
                path: 'retrieveStockList', name: 'retrieveStockList', meta: {title: '系统分配',keepAlive: true},
                component: () => import('@/views/trade/retrieveStockList.vue')
            },
            {
                path: 'riskLogList', name: 'riskLogList', meta: {title: '风控日志',keepAlive: true},
                component: () => import('@/views/trade/riskLogList.vue')
            },
            {
                path: 'parentAccountSellList', name: 'parentAccountSellList', meta: {title: '母账户系统卖出',keepAlive: true},
                component: () => import('@/views/trade/parentAccountSellList.vue')
            },
            {
                path: 'parentAccountBuyList', name: 'parentAccountBuyList', meta: {title: '母账户系统买入',keepAlive: true},
                component: () => import('@/views/trade/parentAccountBuyList.vue')
            },
            {
                path: 'tradeFeeList', name: 'tradeFeeList', meta: {title: '佣金统计',keepAlive: true},
                component: () => import('@/views/trade/tradeFeeList.vue')
            },
            {
                path: 'platformFlowList', name: 'platformFlowList', meta: {title: '平台资金',keepAlive: true},
                component: () => import('@/views/trade/platformFlowList.vue')
            }
        ]
    },
    /*
     {
     path: '/error-page',
     icon: 'android-sad',
     title: '错误页面',
     name: 'errorpage',
     component: Main,
     children: [
     {path: 'index', title: '错误页面', name: 'errorpageIndex', component: () => import('@/views/error-page/error-page.vue')}
     ]
     }*/
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];

// 不需要角色权限判断的路由
export const noAuthRouters = [
    loginRouter,
    otherRouter,
    locking,
    page500,
    page403,
    page404
];
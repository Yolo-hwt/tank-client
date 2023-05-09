// 该文件专门用于创建整个应用的路由器
import { createWebHashHistory, createRouter } from 'vue-router'
//引入组件
const menuView = () => import('@/pages/menuView')
const matchView = () => import('@/pages/matchView')
const localGame = () => import("@/pages/localGame")
//创建并暴露一个路由器
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: [
        {
            name: 'menu',
            path: '/menu',
            component: menuView,
            meta: { title: '菜单' },

        },
        {
            name: 'match',
            path: '/match',
            component: matchView,
            meta: { title: '匹配' },

        },
        {
            name: 'localgame',
            path: '/localgame',
            component: localGame,
            meta: { title: '本地游戏' },

        },

        {
            path: '/',
            redirect: { name: 'menu' }
        },

    ]
})

export default router
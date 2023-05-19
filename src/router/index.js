// 该文件专门用于创建整个应用的路由器
import { createWebHashHistory, createRouter } from 'vue-router'
//引入组件
const menuView = () => import('@/pages/menuView')
const matchView = () => import('@/pages/matchView')
const localGame = () => import("@/pages/localGame")
const adventureGame = () => import("@/pages/adventureGame")
const multiplayerGame = () => import("@/pages/multiplayerGame")
const gameWin = () => import("@/pages/gameWin")
const gameLose = () => import("@/pages/gameLose")
//创建并暴露一个路由器
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes: [
        {
            name: 'menu',
            path: '/menupage',
            component: menuView,
            meta: { title: '菜单' },

        },
        {
            name: 'match',
            path: '/matchpage',
            component: matchView,
            meta: { title: '匹配' },

        },
        {
            name: 'localgame',
            path: '/localgamepage',
            component: localGame,
            meta: { title: '本地游戏' },

        },
        {
            name: 'adventuregame',
            path: '/adventuregamepage',
            component: adventureGame,
            meta: { title: '双人冒险' },

        },
        {
            name: 'multiplayergame',
            path: '/multiplayergamepage',
            component: multiplayerGame,
            meta: { title: '多人对战' },

        },
        {
            name: 'gamewin',
            path: '/gamewinpage',
            component: gameWin,
            meta: { title: '获胜界面' },

        },
        {
            name: 'gamelose',
            path: '/gamelosepage',
            component: gameLose,
            meta: { title: '失败界面' },

        },

        {
            path: '/',
            redirect: { name: 'menu' }
        },

    ]
})

export default router
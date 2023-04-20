import { createApp } from 'vue'
import App from './App.vue'
//引入mitt
// import mitt from 'mitt'
//引入css
import "@/assets/css/default.css"
//引入helper
import "@/utils/Helper"
const app = createApp(App)

// const bus = mitt()
// //挂载事件总线，相当于Vue2中的:Vue.prototype.$bus = bus
// app.config.globalProperties.$bus = bus
app.mount('#app');

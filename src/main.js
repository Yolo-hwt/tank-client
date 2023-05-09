import { createApp } from 'vue'
import App from './App.vue'
//引入router
import router from './router'
//引入css
import "@/assets/css/default.css"
//引入helper
import "@/utils/Helper"

const app = createApp(App)
app.use(router)
app.mount('#app');

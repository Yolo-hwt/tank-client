<template>
    <h1>game win</h1>
    <button @click="backToHomePage()">返回主页</button>
</template>
    
<script>
//   import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
export default {
    name: "gameWin",
    setup() {
        let router = useRouter();
        function backToHomePage() {
            //清空计时器
            //返回菜单界面
            router.push({ name: 'menu' })
        }
        return {
            backToHomePage
        }
    }
}
</script>
    
<style></style>
    
<template>
  <div class="main clearfix">
    <router-view></router-view>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount } from 'vue';
import{useRouter}from 'vue-router'
// hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
import {GAME_MODE}from "@/hook/globalParams"
export default {
  name: "App",
  setup() {
    let router = useRouter();
    function appEventsOn() {
      eventBus.on("routeToPage", (type) => {
        menuItemClickHandler(type);
          });
    }
    function appEventsOff() {
      eventBus.off("routeToPage");
    }
    function menuItemClickHandler(type) {
      if (type != undefined || type != null) {
        switch (type) {
          case GAME_MODE.LOCAL_GAME: {//单机模式
            // console.log(type);
            router.push({ name: "localgame" });
            break;
          }
          case GAME_MODE.ADVENTURE_GAME: {//双人冒险
            // console.log(type);
            router.push({ name: "match" });
            break;
          }
          case GAME_MODE.MULTIPLAER_GAME: {//多人对战
            // console.log(type);
            break;
          }

          default:
            break;
        }
      }
     
    }
    onMounted(() => {
      appEventsOn()
    });
    onBeforeUnmount(() => {
      appEventsOff()
    })
    return {
      menuItemClickHandler
    };
  },
};
</script>

<style>

</style>

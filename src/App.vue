<template>
  <div class="main clearfix">
    <router-view></router-view>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
// hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
import { GAME_MODE } from "@/hook/globalParams"
export default {
  name: "App",
  setup() {
    let router = useRouter();
    let userName = ref("xxx");
    const host = "127.0.0.1";
    const port = "1024";
    function appEventsOn() {
      eventBus.on("routeToPage", (type) => {
        menuItemClickHandler(type);
      });
      eventBus.on("updateUserName", (name) => {
        userName.value = name;
      })
      eventBus.on("sendAppName", (target) => {
        switch (target) {
          case "menuView": {
            eventBus.emit("menuViewGetUserName", userName.value)
            break;
          }
          default:
            break;
        }
      })

    }
    function appEventsOff() {
      eventBus.off("routeToPage");
      eventBus.off("updateUserName");
      eventBus.off("sendAppName");
    }
    function menuItemClickHandler(type) {
      if (userName.value == undefined || userName.value == "") {
        alert("先给自己起个名吧！");
        return;
      }
      if (type != undefined || type != null) {
        switch (type) {
          case GAME_MODE.LOCAL_GAME: {//单机模式
            // console.log(type);
            const content = { name: userName.value, mode: GAME_MODE.LOCAL_GAME, host, port };
            router.push({
              name: "localgame",
              path: "localgamepage",
              query: content
            });
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
      menuItemClickHandler,
      userName
    };
  },
};
</script>

<style></style>

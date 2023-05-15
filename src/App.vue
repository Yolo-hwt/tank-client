<template>
  <div class="main clearfix">
    <router-view></router-view>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
// hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
import { GAME_MODE } from "@/hook/globalParams"
export default {
  name: "App",
  setup() {
    let router = useRouter();
    let userName = ref("xxx");
    let wsClientInstance = reactive({ test: 111 });
    function appEventsOn() {
      //页面跳转
      eventBus.on("routeToPage", (type) => {
        menuItemClickHandler(type);
      });
      //更新用户名
      eventBus.on("updateUserName", (name) => {
        userName.value = name;
      })
      //发送当前用户名
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

      //获取client连接
      eventBus.on("sendAppWsClient", (target) => {
        switch (target) {
          case "matchView": {
            // console.log('send match');
            eventBus.emit("matchViewGetWsClient", wsClientInstance)
            break;
          }
          case "adventure": {
            eventBus.emit("adventureViewGetWsClient", wsClientInstance)
            break;
          }
          default:
            break;
        }
      })
      //更新wsClient
      eventBus.on("updateAppWsClient", (ws) => { wsClientInstance = ws; console.log("app wsclient update", ws); })
    }
    function appEventsOff() {
      eventBus.off("routeToPage");
      eventBus.off("updateUserName");
      eventBus.off("sendAppName");
      eventBus.off("updateAppWsClient");
    }
    //菜单点击跳转
    function menuItemClickHandler(type) {
      if (userName.value == undefined || userName.value == "" || userName.value == "xxx") {
        alert("先给自己起个名吧！");
        return;
      }
      if (type != undefined || type != null) {
        switch (type) {
          case GAME_MODE.LOCAL_GAME: {//单机模式
            // console.log(type);
            const content = { mode: GAME_MODE.LOCAL_GAME };
            router.push({
              name: "localgame",
              path: "/localgamepage",
              query: content
            });
            break;
          }
          case GAME_MODE.ADVENTURE_GAME: {//双人冒险
            // console.log(type);
            const content = { name: userName.value, mode: GAME_MODE.ADVENTURE_GAME };
            router.push({
              name: "match",
              path: "/matchpage",
              query: content
            });
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
      userName,
      wsClientInstance
    };
  },
};
</script>

<style></style>

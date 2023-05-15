<template>
  <div class="menu-container">
    <div class="menu-header">
      <i class="iconfont icon-game"></i>
      <p>{{ userNameTemp }}</p>
    </div>
    <div class="menu-items">
      <menu-item :menuItemInfo="MenuObj[0]" />
      <menu-item :menuItemInfo="MenuObj[1]" />
      <menu-item :menuItemInfo="MenuObj[2]" />
    </div>
    <div class="menu-random-name">
      <div class="menu-random-input">
        <input type="text" v-model="menuUserName">
        <button @click="submitUserName()">submit</button>
      </div>
      <a class="menu-random-item" @click="getRandomName()">想不到好名字？点我随机一个吧</a>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import menuItem from '@/components/menuItem.vue';
import { GAME_MODE } from "@/hook/globalParams"
//eventbus
import { eventBus } from '@/hook/eventBus';
//随机游戏名函数引入
import { generateRandomGameName } from "@/hook/randomGameId";
export default {
  components: { menuItem },
  name: "menuView",
  setup() {
    let userNameTemp = ref("");
    let menuUserName = ref("");
    let MenuObj = [
      { index: 0, type: GAME_MODE.LOCAL_GAME, title: "单机游戏", width: "160px", height: "60px" },
      { index: 1, type: GAME_MODE.ADVENTURE_GAME, title: "双人冒险", width: "160px", height: "60px" },
      { index: 2, type: GAME_MODE.MULTIPLAER_GAME, title: "多人对战", width: "160px", height: "60px" }
    ];

    //提交游戏名
    function submitUserName() {
      if (menuUserName.value == "") {
        alert("游戏id不能为空喔！");
        return;
      }
      if (menuUserName.value.length > 10) {
        alert("id最大限制10字符！");
        //清空文本框
        menuUserName.value = "";
        return;
      }
      eventBus.emit("updateUserName", menuUserName.value);
      userNameTemp.value = menuUserName.value
      //清空文本框
      menuUserName.value = "";
      // alert("hello!" + userNameTemp.value + "开始游戏吧");
    }
    //获取随机id
    function getRandomName() {
      const name = generateRandomGameName();
      menuUserName.value = name;
    }
    //事件总线
    function eventsOn() {
      eventBus.on("menuViewGetUserName", (name) => {
        userNameTemp.value = name;
      })
    }
    function eventsOff() {
      eventBus.off("menuViewGetUserName")
    }
    //mounted
    onMounted(() => {
      eventsOn();
      //通知app下发username
      eventBus.emit("sendAppName", "menuView");
    });
    onUnmounted(() => {
      eventsOff()
    })


    return {
      MenuObj,
      menuUserName,
      userNameTemp,
      submitUserName,
      getRandomName
    };
  },
};
</script>
  
<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  width: 512px;
  height: 448px;
  background: url("../assets/images/tank-menu.jpg") no-repeat;
  /* padding-top: 80px; */
  /* background: url("../assets/images/tank-menu2.jpg") no-repeat; */
}

.menu-header {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  transform: translateX(-25px);
  font-size: 20px;
  color: pink;
}

.menu-header .iconfont {
  font-size: 35px;
}

.menu-header i {
  margin-right: 10px;
}

.menu-header p {
  text-decoration: underline;
}

.menu-items {
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  /* position: absolute;
  right: 0; */
  transform: translate(-15px, -20px);
}

.menu-random-name {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* position: absolute;
  left: 0;
  bottom: 0; */
  /* padding: 0 0 20px 20px; */
}

.menu-random-item {
  font-size: 13px;
  color: rgb(215, 207, 169);
  text-decoration: underline;
}

.menu-random-item:hover {
  color: rgb(244, 219, 79);
  cursor: pointer;
}

.menu-random-input {
  margin-bottom: 10px;
}

.menu-random-input input {
  height: 30px;
  width: 200px;
  font-size: 15px;
  border: 2px solid rgb(146, 142, 120);
  border-top: none;
  border-left: none;
  border-right: none;
  border-radius: 10%;
  background-color: rgba(255, 255, 255, .2);
  padding-left: 10px;
  color: pink;
}

.menu-random-input button {
  height: 25px;
  width: 60px;
  font-size: 15px;
  border: 2px solid rgb(146, 142, 120);
  border-radius: 10%;
  background-color: rgba(244, 219, 79, .5);
  margin-left: 15px;
}

.menu-random-input button:hover {
  background-color: rgb(244, 219, 79);
  cursor: pointer;
}
</style>
  
<template>
  <div class="match-main-container">
    <div class="match-back-container">
      <i class="iconfont icon-back" @click="clickBackToHome()"></i>
    </div>
    <div class="match-psd-container">
      <passWordItem v-for="(item, index) in psdInstances" :key="item.id" :width="psdWidth" :height="psdHeight"
        :focus="item.fcous" v-model:value="psdInstances[index].value" />
    </div>
    <div class="match-head-container">
      <headPortrait v-for=" player in isReadyPlayers" :key="player.index" :width="headWidth" :height="headHeight"
        :title="player.name" />
    </div>
    <div class="match-btn-container">
      <button class="match-btn-item" id="matchComfirmBtn" :disabled="btnIsDisabled.confirm"
        @click="btnConfirmClick()">确认匹配</button>
      <button class="match-btn-item" id="matchCancelBtn" :disabled="btnIsDisabled.cancel"
        @click="btnCancelClick()">取消匹配</button>
    </div>
    <div class="match-tips-container">
      <p :style="{ color: curTipInstance.color }">tips: {{ curTipInstance.info }}</p>
    </div>
  </div>
</template>

<script>
import headPortrait from "@/components/headPortrait.vue";
import passWordItem from "@/components/passWordItem.vue";
import { computed, reactive, watch, ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from 'vue-router';
//事件总线
import { eventBus } from '@/hook/eventBus';
//instance
import { generateGameInstance } from "@/hook/instance"
//全局参数
import { host, port, STATE, GAME_MODE } from "@/hook/globalParams"
//socketGameLogic
import {
  connectWebSocket,
} from "@/gameLogic/online/socketGameLogic";
export default {
  components: { headPortrait, passWordItem },
  name: "matchView",
  setup() {
    let router = useRouter();
    let route = useRoute();
    let routeQuery = {};
    let wsUrlTemp = "";
    let wsClientTemp = {};
    let matchStatus = ref("");
    //按钮dom
    let confirmBtn = null;
    let cancelBtn = null;
    //按钮控制
    let btnIsDisabled = reactive({ confirm: true, cancel: true });
    //固定数据
    const headWidth = "80px";
    const headHeight = "80px";
    const psdWidth = "100px";
    const psdHeight = "100px";
    //玩家信息
    let players = reactive([
      {
        index: 0,
        name: "player1",
        isReady: true
      },
      {
        index: 1,
        name: "player2",
        isReady: false
      },
      {
        index: 2,
        name: "player3",
        isReady: false
      },
      {
        index: 3,
        name: "player4",
        isReady: false
      }
    ]);
    //密码框原型数据
    let psdInstances = reactive([
      { id: "psd1", value: "-1", fcous: true },
      { id: "psd2", value: "-1", fcous: false },
      { id: "psd3", value: "-1", fcous: false },
      { id: "psd4", value: "-1", fcous: false }
    ]);
    //tips
    let matchTimes = ref(15);
    let matchTimer = null;
    const tipColors = { safe: "#7bed9f", wait: "#eccc68" }
    const matchTips = {
      init: "输入房间号，确认匹配，等待游戏开始",
      wait: "匹配中，请稍后..." + matchTimes.value + "s",
      success: "匹配成功！即将进入游戏......",
    }
    //当前的提示信息原型
    let curTipInstance = reactive({ color: tipColors.safe, info: matchTips.init });

    /**
     * @field computed
     */
    //就绪状态玩家
    let isReadyPlayers = computed(() => {
      return players.filter((item) => {
        if (item.isReady) {
          return true;
        } else {
          return false;
          // return true;
        }
      })
    });
    //房间号
    let matchCodes = computed(() => {
      let codes = "";
      for (let i = 0; i < psdInstances.length; i++) {
        codes += psdInstances[i].value;
      }
      return codes;
    });

    /**
     * @field watch
     */
    function matchSuccess() {
      //禁用按钮
      btnIsDisabled.confirm = true;
      btnIsDisabled.cancel = true;
      //清除timer
      clearInterval(matchTimer);
      //提示匹配成功
      tipsSuccess();
      //跳转adventure游戏界面
      if (routeQuery.mode == GAME_MODE.ADVENTURE_GAME) {
        router.push({
          name: "adventuregame",
          path: "/adventuregamepage",
          query: { name: routeQuery.name }
        });
      } else if (routeQuery.mode == GAME_MODE.MULTIPLAER_GAME) {
        router.push({
          name: "multiplayergame",
          path: "/multiplayergamepage",
          query: { name: routeQuery.name }
        });
      }

    }
    function matchFailed() {
      //清空密码框
      psdInstances.forEach((element, index) => {
        if (index == 0) {
          psdInstances[index].fcous = true;
        } else {
          psdInstances[index].fcous = false;
        }
        psdInstances[index].value = "-1";
      });
      // console.log(psdInstances);
      //重新监视密码框
      psdValueWatcher = watch(psdInstances, psdValueWatcherCallBack);
      //清除计时器
      clearInterval(matchTimer);
      //按钮
      btnIsDisabled.confirm = false;
      confirmBtn.textContent = "确认匹配";
      btnIsDisabled.cancel = true;
      //重置tips
      tipsInit();
    }
    //监视匹配状态
    watch(matchStatus, (newValue) => {
      if (newValue == true) {//匹配成功
        matchSuccess();
      } else if (newValue == false) {//匹配失败
        matchFailed();
      }
    })

    //密码框自动跳转下一个
    const psdValueWatcherCallBack = (newValue, oldValue) => {
      // console.log("watch");
      if (matchCodes.value.includes("-1") || matchCodes.value.length < 4) {
        for (let i = 0; i < psdInstances.length - 1; i++) {
          if (newValue[i].value != "-1" && newValue[i].value != "" && newValue[i].fcous == true && newValue[i + 1].fcous == false) {
            newValue[i].fcous = false;
            newValue[i + 1].fcous = true;
            break;
          }
        }
      }
      // } else {
      //   // console.log("stop watch");
      //   psdValueWatcher();
      // }
    }
    let psdValueWatcher = watch(psdInstances, psdValueWatcherCallBack);
    //
    //当最终输入组合的code没有-1标识时候，允许匹配按钮
    let btnComfirmWatcher = watch(matchCodes, (newValue) => {
      // console.log("watch matchCodes", newValue);
      if (!newValue.includes("-1") && newValue.length == 4) {
        btnIsDisabled.confirm = false;
        // btnComfirmWatcher();//取消监测
      } else {
        btnIsDisabled.confirm = true;
      }
    })

    /**
      * @field function
      */
    //初始化数据
    function initData() {
      routeQuery = Object.assign({}, route.query);
      const { name, mode } = routeQuery;
      players[0].name = name;
      wsUrlTemp = `ws://${host}:${port}/ws/?name=${name}&mode=${mode}`;
      confirmBtn = document.getElementById("matchComfirmBtn");
      cancelBtn = document.getElementById("matchCancelBtn");
    }
    //返回菜单主页
    function clickBackToHome() {
      //清空计时器
      clearInterval(matchTimer);
      //返回菜单界面
      router.push({ name: 'menu' })
    }
    //事件总线挂载
    function eventsOn() {
      eventBus.on("matchViewUpdatePlayers", (dataobj) => {
        let match = false;
        for (let i = 0; i < dataobj.length; i++) {
          match = dataobj[i]?.match ?? false;
          // console.log(match);
          if (i == 0) {
            matchStatus.value = match;
          }
          if (match == true) {
            const { index, name, state } = dataobj[i];
            players[index].name = name;
            players[index].isReady = state;
          }
        }
      });
    }
    function eventsOff() {
      eventBus.off("matchViewUpdatePlayers");
    }
    //tips方法
    function tipsInit() {
      curTipInstance.info = matchTips.init;
      curTipInstance.color = tipColors.safe;
    }
    function tipsWait() {
      curTipInstance.info = matchTips.wait;
      curTipInstance.color = tipColors.wait;
    }
    function tipsSuccess() {
      curTipInstance.info = matchTips.success;
      curTipInstance.color = tipColors.safe;
    }
    //双人游戏请求服务器连接
    function adventureGameRequest(wsUrl) {
      let gameInstance = generateGameInstance();
      //初始化游戏对象，设置游戏状态为等待
      gameInstance.clientName = routeQuery.name;
      // gameInstance.gameState = STATE.GAME_STATE_WAIT;
      gameInstance.gameMode = GAME_MODE.ADVENTURE_GAME;
      //连接服务器
      wsClientTemp = connectWebSocket(wsClientTemp, wsUrl, gameInstance);
      //更新app组件中的wsclient
      eventBus.emit("updateAppWsClient", wsClientTemp);
    }
    //多人游戏请求服务器连接
    function multiplayerGameRequest(wsUrl) {
      let gameInstance = generateGameInstance();
      //初始化游戏对象，设置游戏状态为等待
      gameInstance.clientName = routeQuery.name;
      // gameInstance.gameState = STATE.GAME_STATE_WAIT;
      gameInstance.gameMode = GAME_MODE.MULTIPLAER_GAME;
      //连接服务器
      wsClientTemp = connectWebSocket(wsClientTemp, wsUrl, gameInstance);
      //更新app组件中的wsclient
      eventBus.emit("updateAppWsClient", wsClientTemp);
    }
    //确认匹配
    function btnConfirmClick() {
      //更新url
      const wsUrl = wsUrlTemp + "&code=" + matchCodes.value;
      // console.log("url:", wsUrlTemp);
      //按钮
      btnIsDisabled.confirm = true;
      btnIsDisabled.cancel = false;
      //更改文字为匹配中
      confirmBtn.textContent = "匹配中"
      //更新提示信息
      tipsWait();
      //取消密码框监视
      psdValueWatcher();
      //计时匹配
      matchTimer = setInterval(() => {
        if (matchTimes.value == 0) {
          matchTimes.value = 15;
          clearInterval(matchTimer)
        } else {
          matchTimes.value--;
        }
        curTipInstance.info = "匹配中，请稍后..." + matchTimes.value + "s";
      }, 1000);
      //请求服务器匹配
      if (routeQuery.mode == GAME_MODE.ADVENTURE_GAME) {
        adventureGameRequest(wsUrl);
      } else if (routeQuery.mode == GAME_MODE.MULTIPLAER_GAME) {
        multiplayerGameRequest(wsUrl);
      }
    }
    //取消匹配按钮
    function btnCancelClick() {
      wsClientTemp.close();
      //清空密码框
      psdInstances.forEach((element, index) => {
        if (index == 0) {
          psdInstances[index].fcous = true;
        } else {
          psdInstances[index].fcous = false;
        }
        psdInstances[index].value = "-1";
      });
      // console.log(psdInstances);
      //重新监视密码框
      psdValueWatcher = watch(psdInstances, psdValueWatcherCallBack);
      //清除计时器
      clearInterval(matchTimer);
      //按钮
      btnIsDisabled.confirm = false;
      confirmBtn.textContent = "确认匹配";
      btnIsDisabled.cancel = true;
      //重置tips
      tipsInit();
    }
    /**
    * @field hook
    */
    onMounted(() => {
      initData();
      eventsOn();
    })
    onBeforeUnmount(() => {
      eventsOff();
    });
    return {
      isReadyPlayers,
      psdInstances,
      headWidth,
      headHeight,
      psdWidth,
      psdHeight,
      clickBackToHome,
      matchCodes,
      curTipInstance,
      btnIsDisabled,
      btnConfirmClick,
      btnCancelClick,
      wsClientTemp
    };
  },
};
</script>
  
<style>
.match-main-container {
  display: flex;
  flex-direction: column;
  width: 512px;
  height: 448px;
  padding: 0 30px;
  background: url("../assets/images/tank-menu.jpg") no-repeat;
}

.match-back-container {
  flex: 1;
  display: flex;
  align-items: center
}

.match-back-container .iconfont {
  font-size: 30px
}

.match-back-container .iconfont:hover {
  color: pink;
  cursor: pointer;
}

.match-psd-container {
  flex: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-head-container {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.match-btn-container {
  flex: 2;
  display: flex;
  padding: 0 120px;
  justify-content: space-between;
  align-items: center;
}

.match-btn-item {
  padding: 8px 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid black;
  border-radius: 10%;
  background-color: rgba(244, 219, 79, .8);
}

.match-btn-item:hover {
  background-color: #eccc68;
}

.match-btn-item:disabled {
  cursor: not-allowed;
  color: gray;
  background-color: rgba(255, 255, 255, .5);
}

.match-tips-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px
}
</style>

  
<template>
  <!-- <div class="main clearfix"> -->
  <div id="canvasDiv">
    <canvas id="wallCanvas"></canvas>
    <canvas id="tankCanvas"></canvas>
    <canvas id="grassCanvas"></canvas>
    <canvas id="overCanvas"></canvas>
    <canvas id="stageCanvas"></canvas>
  </div>
  <!-- </div> -->
</template>
  
<script>
//vue相关引入
import { onMounted, onBeforeUnmount, reactive } from "vue";
import { useRoute } from 'vue-router';
//全局参数引入
import { STATE, KEYBOARD, GAME_MODE } from "@/hook/globalParams";
const { GAME_STATE_WAIT } = STATE;
const { LOCAL_GAME, ONLINE_GAME } = GAME_MODE;
//instance
import { generateGameInstance } from "@/hook/instance"

//本地游戏逻辑方法引入
import {
  initObject,
  initScreen,
  localkeydownEventHandler,
  localKeyupEventHandler,
  localGameLoop,
} from "@/gameLogic/local/localGameLogic";
//在线游戏逻辑方法引入
import {
  connectWebSocket,
  reconnectWebSocket,
  onlineKeyEventHandler,
} from "@/gameLogic/online/socketGameLogic";
import { onlineGameLoop } from "@/gameLogic/online/onlineGameLoop"

//hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
//socket参数引入
import { KEY_EVENT_TYPE } from "@/socket/socketMessage";
const { KEY_EVENT_DOWN, KEY_EVENT_UP } = KEY_EVENT_TYPE;
export default {
  name: "localGame",
  setup() {
    let route = useRoute();
    //客户端信息
    let client = reactive({
      name: "test",
      host: "127.0.0.1",
      port: "1024",
      wsUrl: "ws://127.0.0.1:1024/ws/?name=test",
      wsSocket: {}
    })
    //游戏全局对象
    const gameInstance = reactive(generateGameInstance());
    //初始化游戏参数，返回游戏连接地址
    function initGame(routeQuery) {
      const { mode } = routeQuery;
      gameInstance.gameMode = mode;
      if (mode == GAME_MODE.LOCAL_GAME) {
        return;
      }
      const { name, host, port } = routeQuery;
      client.name = name;
      gameInstance.clientName = name;
      client.host = host;
      client.port = port;
      client.wsUrl = `ws://${host}:${port}/ws/?name=${name}&mode=${mode}`;
    }
    //事件监听
    function eventsOn() {
      //线上游戏事件监听
      if (gameInstance.gameMode == ONLINE_GAME) {
        //接收重连消息
        eventBus.on("reconnect", () => {
          reconnectWebSocket(client.wsSocket);
        });
        //发送数据到服务器
        eventBus.on("sendtoserver", (data) => {
          client.wsSocket.sendMsg(data);
        });
      }
    }
    //事件卸载
    function eventsOff() {
      if (gameInstance.gameMode == ONLINE_GAME) {
        eventBus.off("reconnect");
        eventBus.off("sendmsg");
      }
    }
    //键盘事件监听器
    //根据gameMode参数来动态判断本地或线上游戏
    const keyDownHandler = (e, gameInstance, KEYBOARD) => {
      if (gameInstance.gameMode == ONLINE_GAME) {
        //联网游戏模式
        onlineKeyEventHandler(e, KEY_EVENT_DOWN, client.name);
      } else if (gameInstance.gameMode == LOCAL_GAME) {
        //单机游戏模式
        localkeydownEventHandler(e, gameInstance, KEYBOARD);
      }
    }
    const keyUpHandler = (e, gameInstance) => {
      if (gameInstance.gameMode == ONLINE_GAME) {
        //联网游戏模式
        onlineKeyEventHandler(e, KEY_EVENT_UP, client.name);
      } else if (gameInstance.gameMode == LOCAL_GAME) {
        //单机游戏模式
        localKeyupEventHandler(e, gameInstance);
      }
    }
    function keyEventListener(gameInstance, KEYBOARD) {
      //键盘按下事件
      document.addEventListener("keydown", (e) => keyDownHandler(e, gameInstance, KEYBOARD));
      //键盘回上事件
      document.addEventListener("keyup", (e) => keyUpHandler(e, gameInstance));
    }
    //移除事件监听
    function removeKeyEventListener() {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    }
    //清除游戏循环
    function clearGameLoop() {
      clearInterval(gameInstance.localGameLoopId);
      clearInterval(gameInstance.onlineGameLoopId);
      gameInstance.localGameLoopId = null;
      gameInstance.onlineGameLoopId = null;
    }
    //开始游戏
    //根据gameMode动态判断
    //线上游戏连接服务器，本地游戏开启游戏循环
    function startGame(gameMode, gameInstance) {
      if (gameMode == ONLINE_GAME) {
        clearGameLoop()
        //在线游戏模式则连接服务器
        //游戏状态改为wait，权限交由服务器控制
        gameInstance.gameState = GAME_STATE_WAIT;
        client.wsSocket = connectWebSocket(client.wsSocket, client.wsUrl, gameInstance);
        if (client.wsSocket) {
          //连接成功
          //执行在线游戏的绘制循环逻辑
          gameInstance.onlineGameLoopId = setInterval(() => {
            onlineGameLoop(gameInstance);
          }, 20);
        }
      } else if (gameMode == LOCAL_GAME) {
        //本地游戏模式执行游戏循环
        clearGameLoop()
        gameInstance.localGameLoopId = setInterval(() => {
          localGameLoop(gameInstance);
        }, 20);
      }
    }

    onMounted(() => {
      //初始化游戏参数
      initGame(route.query);
      //事件总线挂载
      eventsOn();
      //初始化视窗
      initScreen(gameInstance);
      //初始化对象
      initObject(gameInstance);
      //开始游戏
      startGame(gameInstance.gameMode, gameInstance);
      //键盘事件监听
      keyEventListener(gameInstance, KEYBOARD);
    });

    onBeforeUnmount(() => {
      clearInterval(gameInstance.localGameLoopId);
      eventsOff();
      removeKeyEventListener();
    });
    /* 
    watch多个数据: 
      使用数组来指定
      如果是ref对象, 直接指定
      如果是reactive对象中的属性,  必须通过函数来指定
    */
    // watch(
    //   () => gameInstance.level,
    //   (values) => {
    //     console.log("gameInstance.level变化", values);
    //   }
    // );
    return {
      gameInstance,
      client,
    };
  },
};
</script>
  
<style>
#canvasDiv canvas {
  position: absolute;
}
</style>
  
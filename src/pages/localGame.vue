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
  //全局参数引入
  import { STATE, KEYBOARD, GAME_MODE } from "@/hook/globalParams";
  const { GAME_STATE_MENU ,GAME_STATE_WAIT} = STATE;
  const { LOCAL_GAME, ONLINE_GAME } = GAME_MODE;
  //类引入
  
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
  import{onlineGameLoop}from "@/gameLogic/online/onlineGameLoop"
  
  //hook，事件总线引入
  import { eventBus } from "@/hook/eventBus";
  //socket参数引入
  import { KEY_EVENT_TYPE } from "@/socket/socketMessage";
  const { KEY_EVENT_DOWN, KEY_EVENT_UP } = KEY_EVENT_TYPE;
  export default {
    name: "localGame",
    setup() {
      //客户端信息
      const name = "test"; //连接用户名
      const wsUrl = "ws://127.0.0.1:1024/ws/?name=" + name; //连接地址
      let wsSocket = {}; //连接对象
      //游戏全局对象
      const gameInstance = reactive({
        //客户端名称
        clientName: name,
        //游戏模式
        gameMode: ONLINE_GAME,
        //本地游戏循环计时器id
        localGameLoopId: null,
        onlineGameLoopId:null,
        ctx: {}, //2d画布
        wallCtx: {}, //地图画布
        grassCtx: {}, //草地画布
        tankCtx: {}, //坦克画布
        overCtx: {}, //结束画布
        menu: null, //菜单
        stage: null, //舞台
        map: null, //地图
        player1: null, //玩家1
        player2: null, //玩家2
        prop: null,
        enemyArray: [], //敌方坦克
        bulletArray: [], //子弹数组
        keys: [], //记录按下的按键
        crackArray: [], //爆炸数组
        gameState: GAME_STATE_MENU, //默认菜单状态
        level: 1, //默认关卡等级
        maxEnemy: 20, //敌方坦克总数
        maxAppearEnemy: 5, //屏幕上一起出现的最大数
        appearEnemy: 0, //已出现的敌方坦克
        mainframe: 0,
        isGameOver: false, //游戏结束标识
        overX: 176,
        overY: 384,
        emenyStopTime: 0, //敌方坦克停止时间
        homeProtectedTime: -1,
        propTime: 300,
      });
      //事件监听
      function eventsOn() {
        //线上游戏事件监听
        if (gameInstance.gameMode == ONLINE_GAME) {
          //接收重连消息
          eventBus.on("reconnect", () => {
            reconnectWebSocket(wsSocket);
          });
          //发送数据到服务器
          eventBus.on("sendtoserver", (data) => {
            wsSocket.sendMsg(data);
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
      function keyEventListener(gameInstance, KEYBOARD) {
        //键盘按下事件
        document.addEventListener("keydown", (e) => {
          if (gameInstance.gameMode == ONLINE_GAME) {
            //联网游戏模式
            onlineKeyEventHandler(e, KEY_EVENT_DOWN, name);
          } else if (gameInstance.gameMode == LOCAL_GAME) {
            //单机游戏模式
            localkeydownEventHandler(e, gameInstance, KEYBOARD);
          }
        });
        //键盘回上事件
        document.addEventListener("keyup", (e) => {
          if (gameInstance.gameMode == ONLINE_GAME) {
            //联网游戏模式
            onlineKeyEventHandler(e, KEY_EVENT_UP, name);
          } else if (gameInstance.gameMode == LOCAL_GAME) {
            //单机游戏模式
            localKeyupEventHandler(e, gameInstance);
          }
        });
      }
      //清除游戏循环
      function clearGameLoop(){
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
          wsSocket = connectWebSocket(wsSocket, wsUrl, gameInstance);
          if (wsSocket) {
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
      };
    },
  };
  </script>
  
  <style>
  #canvasDiv canvas {
    position: absolute;
  }
  </style>
  
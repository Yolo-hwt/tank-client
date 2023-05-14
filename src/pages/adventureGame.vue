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
import { onMounted, onBeforeUnmount } from "vue";
// import { useRoute } from 'vue-router';
//全局参数引入
import { GAME_MODE, STATE } from "@/hook/globalParams";
const { GAME_STATE_WAIT } = STATE;
//socketMessage类引入
import { MultiMsg, SocketMessage, MSG_TYPE_CLIENT, MULTI_CLIENT_TYPE } from "@/socket/socketMessage"
//本地游戏逻辑方法引入
import {
    initObject,
    initScreen,
} from "@/gameLogic/local/localGameLogic";
//在线游戏逻辑方法引入
import {
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
    name: "adventureGame",
    setup() {
        // let route = useRoute();
        //连接对象
        let wsSocket = null;
        //游戏全局对象
        let gameInstance = {};
        //事件监听
        function eventsOn() {
            //线上游戏事件监听
            //接收重连消息
            eventBus.on("reconnect", () => {
                reconnectWebSocket(wsSocket);
            });
            //发送数据到服务器
            eventBus.on("sendtoserver", (data) => {
                wsSocket.sendMsg(data);
            });
            //接收app的wsclient
            eventBus.on("adventureViewGetWsClient", (data) => {
                wsSocket = data;
                // console.log(wsSocket);
            });
        }
        //事件卸载
        function eventsOff() {
            eventBus.off("reconnect");
            eventBus.off("sendtoserver");
            eventBus.off("adventureViewGetWsClient");
        }
        //键盘事件监听器
        const keyDownHandler = (e, gameInstance) => {
            //联网游戏模式
            onlineKeyEventHandler(e, KEY_EVENT_DOWN, gameInstance.clientName);
        }
        const keyUpHandler = (e, gameInstance) => {
            //联网游戏模式
            onlineKeyEventHandler(e, KEY_EVENT_UP, gameInstance.clientName);
        }
        function keyEventListener(gameInstance) {
            //键盘按下事件
            document.addEventListener("keydown", (e) => keyDownHandler(e, gameInstance));
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
            clearInterval(gameInstance.onlineGameLoopId);
            gameInstance.onlineGameLoopId = null;
        }
        function initData() {
            //获取app中的wsclient连接
            eventBus.emit("sendAppWsClient", "adventure");
            gameInstance = wsSocket.gameInstance;
            //初始化视窗
            initScreen(gameInstance);
            //初始化对象
            initObject(gameInstance);
            gameInstance.map.playNum = 2;
            //在matchView中请求服务器连接时候已经生成了gameInstance
        }
        //开始游戏
        //线上游戏连接服务器，本地游戏开启游戏循环
        function startGame(gameInstance) {
            clearGameLoop()
            //游戏状态改为wait，权限交由服务器控制
            gameInstance.gameState = GAME_STATE_WAIT;
            //连接成功
            if (wsSocket) {
                //执行在线游戏的绘制循环逻辑
                gameInstance.onlineGameLoopId = setInterval(() => {
                    onlineGameLoop(gameInstance);
                }, 20);
            }
        }
        function clientIsReady() {
            const content = new SocketMessage(
                "client",
                gameInstance.clientName,
                MSG_TYPE_CLIENT.MSG_MULTI,
                new MultiMsg(
                    "adventure_clientisready",
                    GAME_MODE.ADVENTURE_GAME,
                    MULTI_CLIENT_TYPE.ADVENTURE_CLIENT_READY
                )
            );
            //发送到服务器
            eventBus.emit('sendtoserver', content);
        }
        onMounted(() => {
            //事件总线挂载
            eventsOn();
            //初始化数据
            initData();
            //通知服务器客户端adventure游戏准备就绪
            clientIsReady();
            // 开始游戏
            startGame(gameInstance);
            //键盘事件监听
            keyEventListener(gameInstance);
        });

        onBeforeUnmount(() => {
            eventsOff();
            removeKeyEventListener();
        });
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
    
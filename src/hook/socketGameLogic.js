//全局参数引入
import { NecessarykeyCode } from "@/hook/globalParams";
//socketMessage参数引入
import {
    SocketMessage,
    KeyEventMsg,
    OPERA_DRAW_TYPE,
    MSG_TYPE_SERVER,
    MSG_TYPE_CLIENT
} from "@/socket/socketMessage";
const { MSG_OPERA_DRAW } = MSG_TYPE_SERVER
const { MENU_DRAW, STAGE_DRAW } = OPERA_DRAW_TYPE
const { MSG_KEY } = MSG_TYPE_CLIENT
//类引入
import { MyWebSocket } from "@/socket/socketClient";
//eventBus
//hook，事件总线引入
import { eventBus } from "./eventBus";


//连接服务器
export const connectWebSocket = function (wsSocket, wsUrl, gameInstance) {
    wsSocket = new MyWebSocket(wsUrl, gameInstance);
    wsSocket.init(
        {
            //time：心跳时间间隔 timeout：心跳超时间隔 reconnect：断线重连时
            //取消心跳
            time: false,
            timeout: false,
            reconnect: false,
        },
        false
    );
    return wsSocket
}
//断线重连
export const reconnectWebSocket = function (wsSocket) {
    if (!wsSocket) {
        //第一次执行，初始化
        connectWebSocket();
    }
    if (wsSocket && wsSocket.reconnectTimer) {
        //防止多个websocket同时执行
        clearTimeout(wsSocket.reconnectTimer);
        wsSocket.reconnectTimer = null;
        connectWebSocket();
    }
}
//键盘事件过滤
export const keyCodeFilter = function (keyCode) {
    return NecessarykeyCode.contain(keyCode);
}
//键盘事件处理器
export const onlineKeyEventHandler = function (e, keyType, name) {
    const code = e.keyCode;
    if (keyCodeFilter(code)) {
        //提取状态变量生成消息体
        const msg = new KeyEventMsg("", code, keyType);
        //包装消息体为客户端消息
        const content = new SocketMessage("client", name, MSG_KEY, msg);
        //console.log(code, content);
        //发送到服务器
        // wsSocket.sendMsg(content);
        eventBus.emit('sendtoserver', content)
    } else {
        //console.log(code);
    }
}
//绘制操作处理器
const operaDrawHandler = function (obj, gameInstance) {
    const type = obj.drawType ?? "";
    switch (type) {
        case "":
            break;
        case MENU_DRAW: {
            gameInstance.menu.draw();
            break;
        }
        case STAGE_DRAW: {
            gameInstance.stage.draw();
            break;
        }

        default:
            break;
    }

}
//接收服务器端操作类消息
export const socketMsgHandler = function (msg, gameInstance) {
    const data = msg.data;
    switch (msg.type) {
        case MSG_OPERA_DRAW: {//绘制指令
            operaDrawHandler(data, gameInstance)
            break;
        }
        default:
            break;
    }
}

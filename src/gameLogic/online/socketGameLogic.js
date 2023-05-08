//全局参数引入
import { NecessarykeyCode, DIRECT, STATE, CRACK_TYPE } from "@/hook/globalParams";
const { DOWN } = DIRECT
const {
    GAME_STATE_INIT,
} = STATE;
//socketMessage参数引入
import {
    SocketMessage,
    KeyEventMsg,
    MSG_TYPE_CLIENT,

} from "@/socket/socketMessage";
const { MSG_KEY } = MSG_TYPE_CLIENT

//类引入
import { MyWebSocket } from "@/socket/socketClient";
import { EnemyOne, EnemyTwo, EnemyThree } from "@/gameClass/tank";
//eventBus
//hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
//local本地方法引入/外部类引入
import { initObject } from "../local/localGameLogic"
import { Bullet } from "@/gameClass/bullet";
import { CrackAnimation } from "@/utils/crackAnimation";


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

/***********同步数据操作辅助函数 */
//根据数据层次同步服务器数据
export const syncBasicDataByServerData = function (dataobj, gameInstance) {
    const { level, target, value } = dataobj;
    if (level == 1) {
        gameInstance[target[0]] = value;
    } else if (level == 2) {
        gameInstance[target[0]][target[1]] = value;
    }
}
//根据服务器数据添加ai坦克
export const addEnemyTankByServerData = function (enemyobj, gameInstance) {
    //console.log(enemyobj);
    //随机生成三种类型坦克
    var tankType = parseInt(enemyobj.tankType);
    let obj = {};
    if (tankType == 0) {
        obj = new EnemyOne(gameInstance);
    } else if (tankType == 1) {
        obj = new EnemyTwo(gameInstance);
    } else if (tankType == 2) {
        obj = new EnemyThree(gameInstance);
    }
    // console.log(obj);
    //根据obj填充数据
    obj.x = enemyobj.x;
    obj.y = gameInstance.map.offsetY;
    obj.dir = DOWN;
    //添加坦克对象到坦克数组中
    gameInstance.enemyArray[gameInstance.enemyArray.length] = obj;
    //更新地图右侧坦克数
    //gameInstance.map.clearEnemyNum(gameInstance.maxEnemy, gameInstance.appearEnemy);
}
//根据服务器数据移除数组中的ai坦克对象
export const removeEnemyTankByServerData = function (removeArr, gameInstance) {
    for (let index = 0; index < removeArr.length; index++) {
        const element = removeArr[index];
        gameInstance.enemyArray.removeByIndex(element);
    }
}
//根据服务器数据移除子弹数组项
export const removeBulletByServerData = function (removeArr, gameInstance) {
    for (let index = 0; index < removeArr.length; index++) {
        const element = removeArr[index];
        //将宿主标识改为未射击
        gameInstance.bulletArray[element].owner.isShooting = false;
        gameInstance.bulletArray.removeByIndex(element);
    }
}
//添加子弹
export const addBulletByServerData = function (gameInstance, tankIndex, type, dir, tempX, tempY) {
    let tankTarget = null;
    if (type == 2) {//ai坦克
        tankTarget = gameInstance.enemyArray[tankIndex]
    } else if (type == 1) {//player
        if (tankIndex == 1) {
            tankTarget = gameInstance.player1;
        } else if (tankIndex == 2) {
            tankTarget = gameInstance.player2
        }
    }

    //添加到子弹数组
    tankTarget.bullet = new Bullet(tankTarget, type, dir, gameInstance)
    tankTarget.bullet.x = tempX;
    tankTarget.bullet.y = tempY;
    gameInstance.bulletArray.push(tankTarget.bullet)
}
//添加销毁动画
export const addCrackByServerData = function (gameInstance, refers) {
    const { crackType } = refers;
    let item = {};
    if (crackType == CRACK_TYPE.CRACK_TYPE_BULLET) {
        const { bulletIndex } = refers;
        item == gameInstance.bulletArray[bulletIndex];
    } else if (crackType == CRACK_TYPE.CRACK_TYPE_TANK) {
        const { tankType, tankIndex } = refers;
        if (tankType == 2) {//ai坦克
            item = gameInstance.enemyArray[tankIndex]
        } else if (tankType == 1) {//player
            if (tankIndex == 1) {
                item = gameInstance.player1;
            } else if (tankIndex == 2) {
                item = gameInstance.player2
            }
        }
    }

    gameInstance.crackArray.push(new CrackAnimation(crackType, gameInstance.tankCtx, item))
}
//重置关卡
export const skipLevelByServerData = function (gameInstance, level) {
    gameInstance.level = level;
    if (gameInstance.level == 22) {
        gameInstance.level = 1;
    }
    initObject(gameInstance);
    //只有一个玩家
    if (gameInstance.menu.playNum == 1) {
        gameInstance.player2.lives = 0;
    }
    gameInstance.stage.init(gameInstance.level);
    gameInstance.gameState = GAME_STATE_INIT;
}




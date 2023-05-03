//全局参数引入
import { NecessarykeyCode, SCREEN, DIRECT, SOUNDS, POS, PICTURES } from "@/hook/globalParams";
const { SCREEN_HEIGHT, SCREEN_WIDTH } = SCREEN
const { DOWN } = DIRECT
const { ATTACK_AUDIO, TANK_DESTROY_AUDIO, PLAYER_DESTROY_AUDIO, BULLET_DESTROY_AUDIO, PROP_AUDIO } = SOUNDS
const { RESOURCE_IMAGE } = PICTURES()
//socketMessage参数引入
import {
    SocketMessage,
    KeyEventMsg,
    OPERA_DRAW_TYPE,
    MSG_TYPE_SERVER,
    MSG_TYPE_CLIENT,
    SYNC_SERVER_TYPE,
    OPERA_AUDIO_TYPE,
    OPERA_CLEAR_TYPE
} from "@/socket/socketMessage";
const { MSG_KEY } = MSG_TYPE_CLIENT

//类引入
import { MyWebSocket } from "@/socket/socketClient";
import { EnemyOne, EnemyTwo, EnemyThree } from "@/gameClass/tank";
//eventBus
//hook，事件总线引入
import { eventBus } from "./eventBus";
//local本地方法引入/外部类引入
import { drawLives } from "./localGameLogic"
import { Bullet } from "@/gameClass/bullet";
import { Prop } from "@/gameClass/prop"
import { CrackAnimation } from "@/utils/crackAnimation";

//接收服务器端操作类消息
export const socketMsgHandler = function (msg, gameInstance) {
    const data = msg.data;
    const type = msg.type;
    switch (type) {
        case MSG_TYPE_SERVER.MSG_OPERA_DRAW: {//服务器绘制指令
            // console.log(data);
            operaDrawHandler(data, gameInstance)
            break;
        }
        case MSG_TYPE_SERVER.MSG_SYNC_SERVER: {//服务器同步数据指令
            operaSyncHandler(data, gameInstance);
            break;
        }
        case MSG_TYPE_SERVER.MSG_OPERA_AUDIO: {//音频控制
            operaAudioHandler(data);
            break;
        }
        case MSG_TYPE_SERVER.MSG_OPERA_CLEAR: {//清除画布
            operaClearHandler(data, gameInstance)
            break;
        }
        default:
            break;
    }
}
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

/*****************服务器操作处理器 *******************************/
//绘制操作处理器
const operaDrawHandler = function (obj, gameInstance) {
    const type = obj?.drawType;
    const refers = obj?.refers;
    switch (type) {
        case "":
            break;
        case OPERA_DRAW_TYPE.MENU_DRAW: {
            gameInstance.menu.draw();
            break;
        }
        case OPERA_DRAW_TYPE.STAGE_DRAW: {
            //refers中参数提供给内部调用的initMap函数使用
            //level, maxEnemy, p1Lives, p2Lives
            gameInstance.stage.draw(refers);
            break;
        }
        case OPERA_DRAW_TYPE.PLAYER1_DRAW: {
            gameInstance.player1.draw(refers);
            break;
        }
        case OPERA_DRAW_TYPE.PLAYER2_DRAW: {
            gameInstance.player2.draw(refers);
            break;
        }
        case OPERA_DRAW_TYPE.LIVES_DRAW: {
            drawLives(gameInstance, refers);
            break;
        }
        case OPERA_DRAW_TYPE.ENEMYNUM_CLEAR: {
            gameInstance.map.clearEnemyNum(refers.maxEnemy, refers.appearEnemy);
            break;
        }
        case OPERA_DRAW_TYPE.TANKBEFORE_DRAW: {
            const { tankIndex, temp, x, y } = refers
            gameInstance.enemyArray[tankIndex].drawAppearBefore(temp, x, y);
            break;
        }
        case OPERA_DRAW_TYPE.TANKAFTER_DRAW: {
            const { tankIndex, x, y, dir, aiTankType } = refers
            gameInstance.enemyArray[tankIndex].drawAppearAfter(x, y, dir, aiTankType);
            break;
        }
        case OPERA_DRAW_TYPE.BULLET_DRAW: {
            const { dir, x, y, bulletIndex } = refers
            gameInstance.bulletArray[bulletIndex].drawByServerData(dir, x, y)
            break
        }
        case OPERA_DRAW_TYPE.CRACK_DRAW: {
            const { posName, x, y, temp, crackIndex } = refers;
            gameInstance.crackArray[crackIndex].drawByServerData(posName, x, y, temp)
            break
        }
        case OPERA_DRAW_TYPE.PROP_DRAW: {
            const { type, x, y } = refers;
            gameInstance.prop.drawByServerData(type, x, y)
            break
        }
        case OPERA_DRAW_TYPE.OVER_DRAW: {
            const { overX, overY, mapOffsetX, mapOffsetY } = refers;
            gameInstance.overCtx.drawImage(RESOURCE_IMAGE, POS["over"][0], POS["over"][1], 64, 32, overX + mapOffsetX, overY + mapOffsetY, 64, 32);
            break
        }
        case OPERA_DRAW_TYPE.HOMEHIT_DRAW: {
            const { homeSize, tileSize, offsetX, offsetY } = refers;
            gameInstance.wallCtx.drawImage(RESOURCE_IMAGE, POS["home"][0] + homeSize, POS["home"][1], homeSize, homeSize, 12 * tileSize + offsetX, 24 * tileSize + offsetY, homeSize, homeSize);
            break;
        }
        default:
            break;
    }

}
//清除操作处理器
const operaClearHandler = function (obj, gameInstance) {
    //console.log(obj);
    const type = obj?.drawType;
    // console.log(type);
    switch (type) {
        case OPERA_CLEAR_TYPE.TANKCTX_CLEAR: {
            // console.log('clear tank');
            gameInstance.tankCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            break;
        }
        case OPERA_CLEAR_TYPE.OVERCTX_CLEAR: {
            gameInstance.overCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            break;
        }
        default:
            break;
    }
}
//服务器同步数据操作处理器
const operaSyncHandler = function (obj, gameInstance) {
    const type = obj.syncType ?? "";
    const refers = obj?.refers;
    switch (type) {
        // case PLAYER1_ISPROTECTED: {
        //     gameInstance.player1.isProtected = refers.isProtected
        //     gameInstance.player1.protectedTime = refers.protectedTime
        //     break;
        // }
        // case PLAYER2_ISPROTECTED: {
        //     gameInstance.player2.isProtected = refers.isProtected
        //     gameInstance.player2.protectedTime = refers.protectedTime
        //     break;
        // }
        case SYNC_SERVER_TYPE.ENEMYTANK_ADD: {
            const enemyobj = refers;
            addEnemyTankByServerData(enemyobj, gameInstance);
            break
        }
        case SYNC_SERVER_TYPE.ENEMYTANK_REMOVE: {
            const removeArr = refers.removeArr;
            removeEnemyTankByServerData(removeArr, gameInstance);
            break
        }
        case SYNC_SERVER_TYPE.BULLET_REMOVE: {
            const removeArr = refers.removeArr;
            removeBulletByServerData(removeArr, gameInstance);
            break
        }
        case SYNC_SERVER_TYPE.BULLET_CREATE: {
            const { tankIndex, type, dir } = refers;
            addBulletByServerData(gameInstance, tankIndex, type, dir)
            break
        }
        case SYNC_SERVER_TYPE.MAP_UPDATE: {
            const { indexArr, target } = refers;
            gameInstance.map.updateMap(indexArr, target);
            break
        }
        case SYNC_SERVER_TYPE.CRACK_ADD: {
            const { crackType, bulletIndex } = refers;
            let bulletItem = gameInstance.bulletArray[bulletIndex];
            gameInstance.crackArray.push(new CrackAnimation(crackType, gameInstance.tankCtx, bulletItem.owner))
            break
        }
        case SYNC_SERVER_TYPE.PROP_ADD: {
            gameInstance.prop = new Prop(gameInstance);
            break;
        }
        default:
            break;
    }
}
//音频控制
const operaAudioHandler = function (obj) {
    const { audioType, audioMode } = obj;
    switch (audioType) {
        case OPERA_AUDIO_TYPE.AUDIO_ATTACK: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                ATTACK_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_TANK_DESTROY: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                TANK_DESTROY_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_PLAYER_DESTORY: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                PLAYER_DESTROY_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_BULLET_DESTORY: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                BULLET_DESTROY_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_PROP: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                PROP_AUDIO.play()
            }
            break;
        }
        default:
            break;
    }
}
/***********同步数据操作辅助函数 */
//根据服务器数据添加ai坦克
const addEnemyTankByServerData = function (enemyobj, gameInstance) {
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
    console.log(obj);
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
const removeEnemyTankByServerData = function (removeArr, gameInstance) {
    for (let index = 0; index < removeArr.length; index++) {
        const element = removeArr[index];
        gameInstance.enemyArray.removeByIndex(element);
    }
}
//根据服务器数据移除子弹数组项
const removeBulletByServerData = function (removeArr, gameInstance) {
    for (let index = 0; index < removeArr.length; index++) {
        const element = removeArr[index];
        gameInstance.bulletArray.removeByIndex(element);
    }
}
//添加子弹
const addBulletByServerData = function (gameInstance, tankIndex, type, dir) {
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
    tankTarget.bullet = new Bullet(tankTarget, type, dir)
    gameInstance.bulletArray.push(tankTarget.bullet)
}

// //绘制敌方坦克，所有逻辑已经在服务器处理，此处只需绘制即可
// const drawEnemyTanksByServerOpera = function (gameInstance) {
//     for (let i = 0; i < gameInstance.enemyArray.length; i++) {
//         let enemyObj = gameInstance.enemyArray[i];
//         enemyObj.draw();
//     }
// }
// //绘制子弹
// const drawBulletsByServerOpera = function (gameInstance) {
//     for (let i = 0; i < gameInstance.bulletArray.length; i++) {
//         let bulletObj = gameInstance.bulletArray[i];
//         bulletObj.drawByServerData();
//     }
// }
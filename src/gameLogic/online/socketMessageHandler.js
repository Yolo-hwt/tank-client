//全局参数引入
import { SOUNDS } from "@/hook/globalParams";
//类引入
import { Prop } from "@/gameClass/prop";
//socketMessage参数引入
import {
    MSG_TYPE_SERVER,
    SYNC_SERVER_TYPE,
    OPERA_AUDIO_TYPE,
    OPERA_CLEAR_TYPE
} from "@/socket/socketMessage";
//线上gameLogic方法引入
import {
    syncBasicDataByServerData,
    addEnemyTankByServerData,
    removeEnemyTankByServerData,
    removeBulletByServerData,
    addBulletByServerData,
    addCrackByServerData,
    skipLevelByServerData
} from "./socketGameLogic"


/****************接收服务器端操作类消息******************** */
export const socketMsgHandler = function (msg, gameInstance) {
    const data = msg.data;
    const type = msg.type;
    switch (type) {
        case MSG_TYPE_SERVER.MSG_OPERA_DRAW: {//服务器绘制指令
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
/*****************服务器操作处理器 *******************************/
//绘制操作处理器
const operaDrawHandler = function (obj) {
    const type = obj?.drawType;
    switch (type) {
        case "":
            break;

        default:
            break;
    }

}
//清除操作处理器
const operaClearHandler = function (obj, gameInstance) {
    // console.log(obj);
    const type = obj?.drawType;
    const refers = obj?.refers;
    // console.log(type);
    switch (type) {
        case OPERA_CLEAR_TYPE.ENEMYNUM_CLEAR: {
            // console.log(refers);
            gameInstance.map.clearEnemyNum(refers.maxEnemy, refers.appearEnemy);
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
        case SYNC_SERVER_TYPE.BASIC_DATA_SERVER: {
            syncBasicDataByServerData(refers, gameInstance)
            break;
        }
        //添加或创建消息
        case SYNC_SERVER_TYPE.ENEMYTANK_ADD: {
            const enemyobj = refers;
            addEnemyTankByServerData(enemyobj, gameInstance);
            break
        }
        case SYNC_SERVER_TYPE.CRACK_ADD: {
            addCrackByServerData(gameInstance, refers)
            break
        }
        case SYNC_SERVER_TYPE.PROP_ADD: {
            gameInstance.prop = new Prop(gameInstance);
            break;
        }
        case SYNC_SERVER_TYPE.BULLET_ADD: {
            const { tankIndex, type, dir, tempX, tempY } = refers;
            addBulletByServerData(gameInstance, tankIndex, type, dir, tempX, tempY)
            break
        }
        //移除删除消息
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
        //数据更新消息
        case SYNC_SERVER_TYPE.MAP_UPDATE: {
            const { indexArr, target } = refers;
            gameInstance.map.updateMap(indexArr, target);
            break
        }
        case SYNC_SERVER_TYPE.PLAYER_MOVE: {
            const { index, dir, x, y } = refers;
            gameInstance["player" + index].dir = dir;
            gameInstance["player" + index].x = x;
            gameInstance["player" + index].y = y;
            // console.log(index, dir, x, y);
            break;
        }
        case SYNC_SERVER_TYPE.BULLET_MOVE: {
            const { bulletIndex, x, y } = refers
            if (bulletIndex != undefined || bulletIndex != null) {
                gameInstance.bulletArray[bulletIndex].x = x;
                gameInstance.bulletArray[bulletIndex].y = y;
            }
            break
        }
        case SYNC_SERVER_TYPE.AITANK_MOVE: {
            const { index, dir, x, y } = refers;
            gameInstance.enemyArray[index].x = x;
            gameInstance.enemyArray[index].y = y;
            gameInstance.enemyArray[index].dir = dir;
            break;
        }
        case SYNC_SERVER_TYPE.PLAYER_RENASCENC: {
            const { tankIndex } = refers;
            gameInstance["player" + tankIndex].renascenc(tankIndex);
            // console.log(gameInstance["player" + tankIndex].x);
            break;
        }
        case SYNC_SERVER_TYPE.SKIP_LEVEL: {
            const { level } = refers;
            skipLevelByServerData(gameInstance, level)
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
                SOUNDS.ATTACK_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_TANK_DESTROY: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                SOUNDS.TANK_DESTROY_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_PLAYER_DESTORY: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                SOUNDS.PLAYER_DESTROY_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_BULLET_DESTORY: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                SOUNDS.BULLET_DESTROY_AUDIO.play()
            }
            break;
        }
        case OPERA_AUDIO_TYPE.AUDIO_PROP: {
            if (audioMode == OPERA_AUDIO_TYPE.AUDIO_PLAY) {
                SOUNDS.PROP_AUDIO.play()
            }
            break;
        }
        default:
            break;
    }
}
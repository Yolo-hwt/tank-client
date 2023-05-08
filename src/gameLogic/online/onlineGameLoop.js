//全局参数引入
import { SCREEN, SOUNDS, POS, PICTURES, STATE } from "@/hook/globalParams";
//本地gameLogic方法引入
import { drawLives, initObject, nextLevel } from "../local/localGameLogic"
//socketMessage参数引入
import {
    SocketMessage,
    SyncMsg,
    MSG_TYPE_CLIENT,
    SYNC_CLIENT_TYPE,
} from "@/socket/socketMessage";
//hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
//pictures资源取用
const { RESOURCE_IMAGE } = PICTURES()
/**
 * 
 **********************线上游戏循环控制
 */
export const onlineGameLoop = function (gameInstance) {
    switch (gameInstance.gameState) {
        case STATE.GAME_STATE_WAIT:
            break;
        case STATE.GAME_STATE_MENU:
            gameInstance.menu.draw();
            break;
        case STATE.GAME_STATE_INIT:
            gameInstance.stage.draw();
            // if (gameInstance.stage.isReady == true) {
            //     gameInstance.gameState = GAME_STATE_START;
            // }
            break;
        case STATE.GAME_STATE_START:
            onlineDrawAll(gameInstance);
            if (
                gameInstance.isGameOver ||
                (gameInstance.player1.lives <= 0 && gameInstance.player2.lives <= 0)
            ) {
                gameInstance.gameState = STATE.GAME_STATE_OVER;
                gameInstance.map.homeHit();
                SOUNDS.PLAYER_DESTROY_AUDIO.play();
            }
            break;
        case STATE.GAME_STATE_WIN:
            nextLevel(gameInstance);
            break;
        case STATE.GAME_STATE_OVER:
            onlineGameOver(gameInstance);
            break;
    }
}
//绘制所有界面
const onlineDrawAll = function (gameInstance) {
    gameInstance.tankCtx.clearRect(0, 0, SCREEN.SCREEN_WIDTH, SCREEN.SCREEN_HEIGHT);
    onlineDrawPlayer(gameInstance);
    drawLives(gameInstance);
    //实际绘制敌方坦克
    onlineDrawEnemyTanks(gameInstance);
    //
    onlineDrawBullet(gameInstance);
    onlineDrawCrack(gameInstance);
    // if (gameInstance.propTime <= 0) {
    //     drawProp(gameInstance);
    // } else {
    //     gameInstance.propTime--;
    // }
    // if (gameInstance.homeProtectedTime > 0) {
    //     gameInstance.homeProtectedTime--;
    // } else if (gameInstance.homeProtectedTime == 0) {
    //     gameInstance.homeProtectedTime = -1;
    //     homeNoProtected(gameInstance);
    // }
}
const onlineDrawPlayer = function (gameInstance) {
    if (gameInstance.player1.lives > 0) {
        gameInstance.player1.draw(1);
    }
    if (gameInstance.player2.lives > 0) {
        gameInstance.player2.draw(2);
    }
}
const onlineDrawEnemyTanks = function (gameInstance) {
    //边界条件判断
    if (gameInstance.enemyArray != null || gameInstance.enemyArray.length > 0) {
        for (let i = 0; i < gameInstance.enemyArray.length; i++) {
            let enemyObj = gameInstance.enemyArray[i];
            if (enemyObj.isDestroyed) {
                gameInstance.enemyArray.removeByIndex(i);
                i--;
            } else {
                enemyObj.onlineDraw(i);
            }
        }
    }
}
const onlineDrawBullet = function (gameInstance) {
    if (gameInstance.bulletArray != null && gameInstance.bulletArray.length > 0) {
        for (let i = 0; i < gameInstance.bulletArray.length; i++) {
            let bulletObj = gameInstance.bulletArray[i];
            if (bulletObj.isDestroyed) {
                //bulletObj.owner.isShooting = false;
                gameInstance.bulletArray.removeByIndex(i);
                i--;
            } else {
                // console.log(bulletObj.x, bulletObj.y);
                bulletObj.drawByServerOpera();
            }
        }
    }
}
const onlineDrawCrack = function (gameInstance) {
    if (gameInstance.crackArray != null && gameInstance.crackArray.length > 0) {
        for (let i = 0; i < gameInstance.crackArray.length; i++) {
            let crackObj = gameInstance.crackArray[i];
            if (crackObj.isOver) {
                gameInstance.crackArray.removeByIndex(i);
                i--;
            } else {
                crackObj.draw();
            }
        }
    }
}
const onlineGameOver = function (gameInstance) {
    gameInstance.overCtx.clearRect(0, 0, SCREEN.SCREEN_WIDTH, SCREEN.SCREEN_HEIGHT);
    gameInstance.overCtx.drawImage(RESOURCE_IMAGE, POS["over"][0], POS["over"][1], 64, 32, gameInstance.overX + gameInstance.map.offsetX, gameInstance.overY + gameInstance.map.offsetY, 64, 32);
    gameInstance.overY -= 2;
    if (gameInstance.overY <= parseInt(gameInstance.map.mapHeight / 2)) {
        //通知服务器结束动画绘制完毕
        const content = new SocketMessage(
            "client",
            gameInstance.clientName,
            MSG_TYPE_CLIENT.MSG_SYNC,
            new SyncMsg("over_animation_is_ok", SYNC_CLIENT_TYPE.OVERANIMATE_ISOK)
        );
        //发送到服务器
        eventBus.emit('sendtoserver', content)
        gameInstance.level = 1;
        initObject(gameInstance);
        // //只有一个玩家
        // if (gameInstance.menu.playNum == 1) {
        //     gameInstance.player2.lives = 0;
        // }
        //等待服务器控制转为MENU状态
        gameInstance.gameState = STATE.GAME_STATE_WAIT;
    }
}
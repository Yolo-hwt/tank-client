import { Keyboard } from "@/gameClass/keyboard";
/***************服务器接口数据 */
export const host = "127.0.0.1";
export const port = "1024";
/***************游戏模式 */
export const GAME_MODE = {
    LOCAL_GAME: 'local_game',
    ONLINE_GAME: 'online_game',
    ADVENTURE_GAME: 'adventure_game',
    MULTIPLAER_GAME: "multiplayer_game",
}
/*****************键盘类******************* */
const getKeyBoard = () => {
    return new Keyboard()
}
export const KEYBOARD = getKeyBoard()
//上下左右 wasd
//enter space
//n p
/*********当前所需的键盘参数********/
export const NecessarykeyCode = [
    37, 38, 39, 40, 65, 68, 83, 87, 13, 32, 78, 80
]

/**************屏幕参数*****************/
export const SCREEN = {
    SCREEN_WIDTH: 512, //屏幕宽
    SCREEN_HEIGHT: 448, //屏幕高
}

/**************各个图块在图片中的位置*****************/
const initPos = () => {
    let POS = new Array();
    POS["selectTank"] = [128, 96];
    POS["stageLevel"] = [396, 96];
    POS["num"] = [256, 96];
    POS["map"] = [0, 96];
    POS["home"] = [256, 0];
    POS["score"] = [0, 112];
    POS["player"] = [0, 0];
    POS["protected"] = [160, 96];
    POS["enemyBefore"] = [256, 32];
    POS["enemy1"] = [0, 32];
    POS["enemy2"] = [128, 32];
    POS["enemy3"] = [0, 64];
    POS["bullet"] = [80, 96];
    POS["tankBomb"] = [0, 160];
    POS["bulletBomb"] = [320, 0];
    POS["over"] = [384, 64];
    POS["prop"] = [256, 110];
    return POS;
}
export const POS = initPos();

/**************声音资源*****************/
export const SOUNDS = {
    START_AUDIO: new Audio(require("@/assets/audio/start.mp3")),
    BULLET_DESTROY_AUDIO: new Audio(
        require("@/assets/audio/bulletCrack.mp3")
    ),
    TANK_DESTROY_AUDIO: new Audio(require("@/assets/audio/tankCrack.mp3")),
    PLAYER_DESTROY_AUDIO: new Audio(
        require("@/assets/audio/playerCrack.mp3")
    ),
    MOVE_AUDIO: new Audio(require("@/assets/audio/move.mp3")),
    ATTACK_AUDIO: new Audio(require("@/assets/audio/attack.mp3")),
    PROP_AUDIO: new Audio(require("@/assets/audio/prop.mp3")),
}

/**************图片资源*****************/
export const PICTURES = () => {
    let MENU_IMAGE = new Image();
    MENU_IMAGE.src = require("@/assets/images/menu.gif")
    let RESOURCE_IMAGE = new Image();
    RESOURCE_IMAGE.src = require("@/assets/images/tankAll.gif")
    return {
        MENU_IMAGE,
        RESOURCE_IMAGE
    }
}

/**************游戏状态*****************/
export const STATE = {
    GAME_STATE_WAIT: -1,
    GAME_STATE_MENU: 0,
    GAME_STATE_INIT: 1,
    GAME_STATE_START: 2,
    GAME_STATE_OVER: 3,
    GAME_STATE_WIN: 4,
}

/**************地图块*****************/
export const TAGS = {
    WALL: 1,
    GRID: 2,
    GRASS: 3,
    WATER: 4,
    ICE: 5,
    HOME: 9,
    ANOTHREHOME: 8,
}

/**************坦克及子弹的四个方向*****************/
export const DIRECT = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
}

/**************坦克重生点*****************/
export const ENEMY_LOCATION = [192, 0, 384] //相对与主游戏区

/**************子弹类型*****************/
export const BULLET_TYPE = {
    BULLET_TYPE_PLAYER: 1,
    BULLET_TYPE_ENEMY: 2,
}

/**************爆炸类型****************/
export const CRACK_TYPE = {
    CRACK_TYPE_TANK: "tank",
    CRACK_TYPE_BULLET: "bullet",
}


//全局参数引入
import { STATE, GAME_MODE } from "@/hook/globalParams";
const { GAME_STATE_MENU } = STATE;
const { LOCAL_GAME } = GAME_MODE;
export const generateGameInstance = function () {
    return {
        //客户端名称
        clientName: "test",
        //游戏模式
        gameMode: LOCAL_GAME,
        //本地游戏循环计时器id
        localGameLoopId: null,
        onlineGameLoopId: null,
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
        player3: null, //玩家3
        player4: null, //玩家4
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
    }
}
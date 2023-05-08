/**************客户端消息类型******************/
export const MSG_TYPE_CLIENT = {
    MSG_NORMAL: 'normal',   //普通消息
    MSG_SYNC: 'syncdata',   //同步客户端数据到服务器
    MSG_BEAT: 'heartbeat',  //心跳包
    MSG_KEY: 'keyevent'     //键盘事件
}
//keyEvent键盘事件类型，按下或回上
export const KEY_EVENT_TYPE = {
    KEY_EVENT_DOWN: 'keydown',
    KEY_EVENT_UP: 'keyup',
}
//syncdata同步数据类型
export const SYNC_CLIENT_TYPE = {
    STAGE_ISREADY: 'stage.isReady',
    PLAYER_READY_DRAW: "player_draw",
    BASIC_DATA_CLIENT: "basic_data_client",
    PLAYER_PROTECTED: "player_protected",
    OVERANIMATE_ISOK: "over_animation_is_ok",
    ENEMY_ISAPPEAR: "enemy_isappear",
}

/************服务器消息类型*************************/
export const MSG_TYPE_SERVER = {
    MSG_OPERA_DRAW: "opera_draw",
    MSG_SYNC_SERVER: "sync_server_data",    //同步服务器端数据
    MSG_OPERA_AUDIO: "opera_audio",
    MSG_OPERA_CLEAR: "opera_clear"
}
export const OPERA_CLEAR_TYPE = {
    TANKCTX_CLEAR: 'tanctx_clear',
    OVERCTX_CLEAR: "overctx_clear"
}
//绘制操作类型，以绘制目标作为区分
//对应drawMsg中的drawType
export const OPERA_DRAW_TYPE = {
    MENU_DRAW: 'menu_draw',
    STAGE_DRAW: 'stage_draw',
    PLAYER1_DRAW: 'player1_draw',
    PLAYER2_DRAW: 'player2_draw',
    LIVES_DRAW: 'lives_draw',
    ENEMYNUM_CLEAR: 'enemynum_clear',
    ENEMYTANK_DRAW: 'enemytank_draw',
    TANK_BULLET_DRAW: 'tank_bullet_draw',
    PLAYER_BULLET_DRAW: 'player_bullet_draw',
    TANKBEFORE_DRAW: 'tankbefore_draw',
    TANKAFTER_DRAW: 'tankafter_draw',
    CRACK_DRAW: "crackanimation_draw",
    BULLET_DRAW: "bullet_draw",
    PROP_DRAW: "prop_draw",
    OVER_DRAW: "over_draw",
    HOMEHIT_DRAW: "homehit_draw"
}
//数据同步操作
//对应SyncMsg中的syncType
export const SYNC_SERVER_TYPE = {
    BASIC_DATA_SERVER: "basic_data_server",
    PLAYER_MOVE: "player_move",
    BULLET_MOVE: 'bullet_move',
    AITANK_MOVE: "aitank_move",
    PLAYER_RENASCENC: "player_renascenc",
    SKIP_LEVEL: "skip_level",
    GAME_STATE: "game_state",
    PLAYER1_ISPROTECTED: 'player1_isprotected',
    PLAYER2_ISPROTECTED: 'player2_isprotected',
    ENEMYTANK_ADD: 'add_enemyTank',
    ENEMYTANK_REMOVE: 'remove_enemyTank',
    BULLET_REMOVE: 'remove_bullet',
    BULLET_CREATE: 'bullet_create',
    MAP_UPDATE: "map_update",
    CRACK_ADD_TANK: "add_crack_tank",
    CRACK_ADD_PLAYER: "add_crack_player",
    CRACK_ADD_BULLET: "add_crack_bullet",
    CRACK_ADD: "crack_add",
    PROP_ADD: "prop_add",
    KEYS_MANAGE: "keys_manage"
}
//音频播放操作
//对应audioType/Mode
export const OPERA_AUDIO_TYPE = {
    //Mode
    AUDIO_PLAY: 'audio_play',
    AUDIO_STOP: "audio_stop",
    //audioType
    AUDIO_ATTACK: "audio_attack",
    AUDIO_TANK_DESTROY: "audio_tankdestory",
    AUDIO_PLAYER_DESTORY: "audio_playerdestory",
    AUDIO_BULLET_DESTORY: 'audio_bulletdestory',
    AUDIO_PROP: "audio_prop"
}
/*************消息实体**************************************/
//与设备交互的消息主体，通用类
export const SocketMessage = function (from = "", name = "", type = "", data = {}) {
    this.from = (from == undefined || from == null) ? '' : from;     //发送方为
    this.name = name;          //发送消息的设备名称
    this.type = type;         //消息类型
    this.data = data           //消息体
}

//普通消息
export const NormalMsg = function (msg) {
    this.msg = msg ?? '';
}
//心跳包
export const HeartbeatMsg = function (msg) {
    NormalMsg.call(this, msg);
    this.date = new Date();
}
//同步数据消息
export const SyncMsg = function (msg, syncType, refers = {}) {
    NormalMsg.call(this, msg);
    this.syncType = syncType;
    this.refers = refers;
}
//键盘事件
//refers为附带到服务器的参考数据，提供游戏逻辑判断用
export const KeyEventMsg = function (msg, code, keyType, refers = {}) {
    NormalMsg.call(this, msg);
    this.code = code;
    this.keyType = keyType
    this.refers = refers
}
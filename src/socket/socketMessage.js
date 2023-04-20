/**************客户端消息类型**/
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
export const SYNC_DATA_TYPE = {
    STAGE_ISREADY: 'stage.isReady',
}

/************服务器消息类型***/
export const MSG_TYPE_SERVER = {
    MSG_OPERA_DRAW: "opera_draw"
}
//绘制操作类型，以绘制目标作为区分
//对应drawMsg中的drawType
export const OPERA_DRAW_TYPE = {
    MENU_DRAW: 'menu_draw',
    STAGE_DRAW: 'stage_draw',
    TANKCTX_CLEAR: 'tanctx_clear',
    PLAYER1_DRAW: 'player1_draw',
    PLAYER2_DRAW: 'player2_draw'
}

//消息实体
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
export const SyncDataMsg = function (msg, syncType, refers = {}) {
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
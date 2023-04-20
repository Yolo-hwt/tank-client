//全局变量引入
import { POS, PICTURES, SOUNDS } from "../hook/globalParams";
const { RESOURCE_IMAGE } = PICTURES();
const { START_AUDIO } = SOUNDS
//hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
//游戏逻辑函数引入
import { initMap } from "@/hook/localGameLogic";
//外部类引入
import { Num } from "./num"
//socket类引入
import { SyncDataMsg, SocketMessage, MSG_TYPE_CLIENT, SYNC_DATA_TYPE } from "@/socket/socketMessage"
const { MSG_SYNC } = MSG_TYPE_CLIENT;
const { STAGE_ISREADY } = SYNC_DATA_TYPE

export const Stage = function (gameInstance) {
	this.gameInstance = gameInstance;
	this.ctx = gameInstance.ctx;
	this.ctx.fillStyle = "#7f7f7f";
	this.drawHeigth = 15;
	this.level = gameInstance.level;
	this.temp = 0;
	this.dir = 1; //中间切换的方向，1：合上，2：展开
	this.isReady = false;//标识地图是否已经画好
	this.levelNum = new Num(gameInstance.ctx);

	this.init = function (level) {
		this.dir = 1;
		this.isReady = false;
		this.level = level;
		this.temp = 0;
	};

	this.draw = function () {
		if (this.dir == 1) {

			//temp = 15*15 灰色屏幕已经画完
			if (this.temp == 225) {
				//78,14为STAGE字样在图片资源中的宽和高，194,208为canvas中的位置
				this.ctx.drawImage(RESOURCE_IMAGE, POS["stageLevel"][0], POS["stageLevel"][1], 78, 14, 194, 208, 78, 14);
				//14为数字的宽和高，308, 208为canvas中的位置
				this.levelNum.draw(this.level, 308, 208);
				//this.ctx.drawImage(RESOURCE_IMAGE,POS["num"][0]+this.level*14,POS["num"][1],14, 14,308, 208,14, 14);
				//绘制地图
				initMap(this.gameInstance)
			} else if (this.temp == 225 + 600) {
				//600即调用了600/15次，主要用来停顿
				this.temp = 225;
				this.dir = -1;
				START_AUDIO.play();
			} else {
				this.ctx.fillRect(0, this.temp, 512, this.drawHeigth);
				this.ctx.fillRect(0, 448 - this.temp - this.drawHeigth, 512, this.drawHeigth);
			}
		} else {
			if (this.temp >= 0) {
				//判断若temp>=0则还有未清除的灰屏
				this.ctx.clearRect(0, this.temp, 512, this.drawHeigth);
				this.ctx.clearRect(0, 448 - this.temp - this.drawHeigth, 512, this.drawHeigth);
			} else {
				//全部清除标识切换为true
				this.isReady = true;
				//联网模式还需要同步服务端
				if (this.gameInstance.gameMode) {
					//提取状态变量生成消息体
					const msg = new SyncDataMsg("sync_stage_isready", STAGE_ISREADY, { isReady: this.isReady })
					//包装消息体为客户端消息
					const content = new SocketMessage("client", this.gameInstance.clientName, MSG_SYNC, msg);
					//console.log(code, content);
					//发送到服务器
					// wsSocket.sendMsg(content);
					eventBus.emit('sendtoserver', content)
				}
			}
		}
		//根据dir来控制
		this.temp += this.drawHeigth * this.dir;
	};
};
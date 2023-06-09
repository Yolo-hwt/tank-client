//全局变量引入
import { POS, PICTURES, SOUNDS, GAME_MODE } from "../hook/globalParams";
const { ONLINE_GAME, ADVENTURE_GAME, MULTIPLAER_GAME } = GAME_MODE
const { RESOURCE_IMAGE } = PICTURES();
const { START_AUDIO } = SOUNDS
//hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
//游戏逻辑函数引入
import { initMap } from "@/gameLogic/local/localGameLogic";
//外部类引入
import { Num } from "./num"
//socket类引入
import {
	SyncMsg, SocketMessage, MultiMsg,
	MSG_TYPE_CLIENT, SYNC_CLIENT_TYPE, MULTI_CLIENT_TYPE
} from "@/socket/socketMessage"
const { MSG_SYNC } = MSG_TYPE_CLIENT;
const { STAGE_ISREADY } = SYNC_CLIENT_TYPE

export const Stage = function (gameInstance) {
	this.gameInstance = gameInstance;
	this.ctx = gameInstance.ctx;
	this.ctx.fillStyle = "#7f7f7f";
	this.drawHeigth = 15;
	this.level = 1;
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

	this.draw = function (refers) {
		let level, maxEnemy, p1Lives, p2Lives;
		if (refers) {
			level = refers.level;
			maxEnemy = refers.maxEnemy;
			p1Lives = refers.p1Lives;
			p2Lives = refers.p2Lives;
		}

		if (this.dir == 1) {
			//temp = 15*15 灰色屏幕已经画完
			if (this.temp == 225) {
				//78,14为STAGE字样在图片资源中的宽和高，194,208为canvas中的位置
				this.ctx.drawImage(RESOURCE_IMAGE, POS["stageLevel"][0], POS["stageLevel"][1], 78, 14, 194, 208, 78, 14);
				//14为数字的宽和高，308, 208为canvas中的位置
				this.levelNum.draw(this.level, 308, 208);
				//this.ctx.drawImage(RESOURCE_IMAGE,POS["num"][0]+this.level*14,POS["num"][1],14, 14,308, 208,14, 14);
				//绘制地图
				if (this.gameInstance.gameMode == MULTIPLAER_GAME) {
					initMap(this.gameInstance, level, maxEnemy, p1Lives, p2Lives, true)
				} else {
					initMap(this.gameInstance, level, maxEnemy, p1Lives, p2Lives, false)
				}
			} else if (this.temp == 225 + 600) {
				//600即调用了600/15次，主要用来停顿
				this.temp = 225;
				this.dir = -1;//切换方向，灰屏退出
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
				//ready标识切换为true
				this.isReady = true;
				//联网模式还需要同步服务端
				if (this.gameInstance.gameMode == ONLINE_GAME) {
					//提取状态变量生成消息体
					//包装消息体为客户端消息
					const content = new SocketMessage(
						"client",
						this.gameInstance.clientName,
						MSG_SYNC,
						new SyncMsg("sync_stage_isready", STAGE_ISREADY, { isReady: this.isReady })
					);
					//发送到服务器
					eventBus.emit('sendtoserver', content)
				}
				if (this.gameInstance.gameMode == ADVENTURE_GAME) {
					// console.log("adventure stage ok");
					const content = new SocketMessage(
						"client",
						this.gameInstance.clientName,
						MSG_TYPE_CLIENT.MSG_MULTI,
						new MultiMsg("adventure_stage_ok", GAME_MODE.ADVENTURE_GAME, MULTI_CLIENT_TYPE.ADVENTURE_CLIENT_STAGEISREADY)
					);
					//发送到服务器
					eventBus.emit('sendtoserver', content)
				}
				if (this.gameInstance.gameMode == MULTIPLAER_GAME) {
					// console.log("adventure stage ok");
					const content = new SocketMessage(
						"client",
						this.gameInstance.clientName,
						MSG_TYPE_CLIENT.MSG_MULTI,
						new MultiMsg("multi_stage_ok", GAME_MODE.MULTIPLAER_GAME, MULTI_CLIENT_TYPE.MULTI_CLIENT_STAGEISREADY)
					);
					//发送到服务器
					eventBus.emit('sendtoserver', content)
				}
			}
		}
		//根据dir来控制
		this.temp += this.drawHeigth * this.dir;
	};
};
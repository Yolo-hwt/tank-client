//全局变量引入
import { POS, DIRECT, PICTURES, SOUNDS, CRACK_TYPE } from "@/hook/globalParams";
const { UP, DOWN, LEFT, RIGHT } = DIRECT;
const { RESOURCE_IMAGE } = PICTURES();
const { PLAYER_DESTROY_AUDIO, ATTACK_AUDIO, TANK_DESTROY_AUDIO } = SOUNDS
const { CRACK_TYPE_TANK } = CRACK_TYPE;
//工具函数引入
import { CrackAnimation } from "@/utils/crackAnimation"
import { tankMapCollision } from "@/utils/Collision"
//外部类引入
import { Bullet } from "@/gameClass/bullet"
//socket类引入
import { SyncMsg, SocketMessage, MSG_TYPE_CLIENT, SYNC_CLIENT_TYPE } from "@/socket/socketMessage"
//hook，事件总线引入
import { eventBus } from "@/hook/eventBus";
/**
 * 坦克基类
 * @returns
 */
export const Tank = function (gameInstance) {
	// this.ctx = gameInstance.tankCtx;
	this.x = 0;
	this.y = 0;
	this.size = 32;//坦克的大小
	this.dir = UP;//方向0：上 1：下 2：左3：右
	this.speed = 1;//坦克的速度
	this.frame = 0;//控制敌方坦克切换方向的时间
	this.hit = false; //是否碰到墙或者坦克
	this.isAI = false; //是否自动
	this.isShooting = false;//子弹是否在运行中
	this.bullet = null;//子弹
	this.shootRate = 0.6;//射击的概率
	this.isDestroyed = false;
	this.tempX = 0;
	this.tempY = 0;
	this.gameCtx = gameInstance
	this.move = function (ctx) {
		if (ctx) {
			this.gameCtx = ctx;
		}
		//如果是AI坦克，在一定时间或者碰撞之后切换方法

		if (this.isAI && this.gameCtx.emenyStopTime > 0) {
			return;
		}

		this.tempX = this.x;
		this.tempY = this.y;

		if (this.isAI) {
			this.frame++;
			if (this.frame % 100 == 0 || this.hit) {
				this.dir = parseInt(Math.random() * 4);//随机一个方向
				this.hit = false;
				this.frame = 0;
			}
		}
		if (this.dir == UP) {
			this.tempY -= this.speed;
		} else if (this.dir == DOWN) {
			this.tempY += this.speed;
		} else if (this.dir == RIGHT) {
			this.tempX += this.speed;
		} else if (this.dir == LEFT) {
			this.tempX -= this.speed;
		}
		this.isHit(this.gameCtx);
		if (!this.hit) {
			this.x = this.tempX;
			this.y = this.tempY;
		}
	};

	/**
	 * 碰撞检测
	 */
	this.isHit = function (ctx) {
		if (ctx) {
			this.gameCtx = ctx;
		}
		//临界检测
		if (this.dir == LEFT) {
			if (this.x <= this.gameCtx.map.offsetX) {
				this.x = this.gameCtx.map.offsetX;
				this.hit = true;
			}
		} else if (this.dir == RIGHT) {
			if (this.x >= this.gameCtx.map.offsetX + this.gameCtx.map.mapWidth - this.size) {
				this.x = this.gameCtx.map.offsetX + this.gameCtx.map.mapWidth - this.size;
				this.hit = true;
			}
		} else if (this.dir == UP) {
			if (this.y <= this.gameCtx.map.offsetY) {
				this.y = this.gameCtx.map.offsetY;
				this.hit = true;
			}
		} else if (this.dir == DOWN) {
			if (this.y >= this.gameCtx.map.offsetY + this.gameCtx.map.mapHeight - this.size) {
				this.y = this.gameCtx.map.offsetY + this.gameCtx.map.mapHeight - this.size;
				this.hit = true;
			}
		}
		if (!this.hit) {
			//地图检测
			if (tankMapCollision(this, this.gameCtx)) {
				this.hit = true;
			}
		}
		//坦克检测
		/*if(enemyArray != null && enemyArray.length >0){
			var enemySize = enemyArray.length;
			for(var i=0;i<enemySize;i++){
				if(enemyArray[i] != this && CheckIntersect(enemyArray[i],this,0)){
					this.hit = true;
					break;
				}
			}
		}*/
	};

	/**
	 * 是否被击中
	 */
	this.isShot = function () {

	};
	/**
	 * 射击
	 */
	this.shoot = function (type, ctx) {
		if (ctx) {
			this.gameCtx = ctx;
		}
		if (this.isAI && this.gameCtx.emenyStopTime > 0) {
			return;
		}
		if (this.isShooting) {
			return;
		} else {
			var tempX = this.x;
			var tempY = this.y;
			this.bullet = new Bullet(this, type, this.dir, this.gameCtx);
			if (this.dir == UP) {
				tempX = this.x + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
				tempY = this.y - this.bullet.size;
			} else if (this.dir == DOWN) {
				tempX = this.x + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
				tempY = this.y + this.size;
			} else if (this.dir == LEFT) {
				tempX = this.x - this.bullet.size;
				tempY = this.y + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
			} else if (this.dir == RIGHT) {
				tempX = this.x + this.size;
				tempY = this.y + parseInt(this.size / 2) - parseInt(this.bullet.size / 2);
			}
			this.bullet.x = tempX;
			this.bullet.y = tempY;
			if (!this.isAI) {
				ATTACK_AUDIO.play();
			}
			//将子弹加入的子弹数组中
			this.gameCtx.bulletArray.push(this.bullet);
			this.bullet.draw();
			this.isShooting = true;
		}
	};

	/**
	 * 坦克被击毁
	 */
	this.distroy = function () {
		this.isDestroyed = true;
		this.gameCtx.crackArray.push(new CrackAnimation(CRACK_TYPE_TANK, this.ctx, this));
		TANK_DESTROY_AUDIO.play();
	};
};

/**
 * 菜单选择坦克
 * @returns
 */
export const SelectTank = function () {
	this.ys = [250, 281];//两个Y坐标，分别对应1p和2p
	this.x = 140;
	this.size = 27;
};

SelectTank.prototype = new Tank();

/**
 * 玩家坦克
 * @param context 画坦克的画布
 * @returns
 */

export const PlayTank = function (gameInstance) {
	this.gameInstance = gameInstance;
	this.ctx = gameInstance.tankCtx;
	this.lives = 3;//生命值
	this.isProtected = true;//是否受保护
	this.protectedTime = 500;//保护时间
	this.offsetX = 0;//坦克2与坦克1的距离
	this.speed = 2;//坦克的速度
	this.gameCtx = gameInstance;
	//坦克绘制方法
	//根据服务器发送的数据来绘制
	//联网模式下使用dataobj数据同步本地，并绘制
	//tankIndex:1/2/...用于发送给服务器区分
	this.draw = function (tankIndex, dataobj) {
		if (this.lives <= 0) {
			return;
		}
		if (dataobj !== undefined && dataobj !== null) {
			const { dir, x, y, isProtected, protectedTime } = dataobj;
			this.dir = dir;
			this.x = x;
			this.y = y;
			this.isProtected = isProtected;
			this.protectedTime = protectedTime;
		}
		this.hit = false;
		this.ctx.drawImage(RESOURCE_IMAGE, POS["player"][0] + this.offsetX + this.dir * this.size, POS["player"][1], this.size, this.size, this.x, this.y, this.size, this.size);
		if (this.isProtected) {
			let temp = parseInt((500 - this.protectedTime) / 5) % 2;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["protected"][0], POS["protected"][1] + 32 * temp, 32, 32, this.x, this.y, 32, 32);
			// if (!(this.gameInstance.gameMode == ONLINE_GAME)) {
			this.protectedTime--;
			if (this.protectedTime == 0) {
				this.isProtected = false;
				//通知服务器变更玩家状态
				const content = new SocketMessage(
					"client",
					this.gameInstance.clientName,
					MSG_TYPE_CLIENT.MSG_SYNC,
					new SyncMsg("player_protected_change", SYNC_CLIENT_TYPE.PLAYER_PROTECTED, { index: tankIndex, value: this.isProtected })
				);
				//发送到服务器
				eventBus.emit('sendtoserver', content)
			}
			//}
		}
	};


	this.distroy = function () {
		this.isDestroyed = true;
		this.gameCtx.crackArray.push(new CrackAnimation(CRACK_TYPE_TANK, this.ctx, this));
		PLAYER_DESTROY_AUDIO.play();
	};

	this.renascenc = function (player) {
		this.lives--;
		this.dir = UP;
		this.isProtected = true;
		this.protectedTime = 500;
		this.isDestroyed = false;
		var temp = 0;
		if (player == 1) {
			temp = 129;
		} else {
			temp = 256;
		}
		// console.log('mapOffsetx', this.gameCtx.map.offsetX, 'temp', temp);
		this.x = temp + this.gameCtx.map.offsetX;
		this.y = 385 + this.gameCtx.map.offsetY;
	};

};
PlayTank.prototype = new Tank();

/**
 * 敌方坦克1
 * @param context 画坦克的画布
 * @returns
 */
export const EnemyOne = function (gameInstance) {
	this.ctx = gameInstance.tankCtx;
	this.gameCtx = gameInstance
	this.isAppear = false;
	this.times = 0;
	this.lives = 1;
	this.isAI = true;
	this.speed = 1.5;

	this.draw = function () {
		this.times++;
		if (!this.isAppear) {
			var temp = parseInt(this.times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if (this.times == 34) {
				this.isAppear = true;
				this.times = 0;
				this.shoot(2, this.gameCtx);
			}
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy1"][0] + this.dir * this.size, POS["enemy1"][1], 32, 32, this.x, this.y, 32, 32);

			//以一定的概率射击
			if (this.times % 50 == 0) {
				var ra = Math.random();
				if (ra < this.shootRate) {
					this.shoot(2, this.gameCtx);
				}
				this.times = 0;
			}
			this.move(this.gameCtx);
		}
	};

	this.onlineDraw = function (tankIndex) {
		if (!this.isAppear) {
			this.times++;
			var temp = parseInt(this.times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if (this.times == 34) {
				this.isAppear = true;
				this.times = 0;
				//通知服务器坦克已经appear
				const content = new SocketMessage(
					"client",
					this.gameCtx.clientName,
					MSG_TYPE_CLIENT.MSG_SYNC,
					new SyncMsg("enemy_isappear_change", SYNC_CLIENT_TYPE.ENEMY_ISAPPEAR, { index: tankIndex, value: this.isAppear })
				);
				//发送到服务器
				eventBus.emit('sendtoserver', content)
			}
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy1"][0] + this.dir * this.size, POS["enemy1"][1], 32, 32, this.x, this.y, 32, 32);
		}
	}

};
EnemyOne.prototype = new Tank();


/**
 * 敌方坦克2
 * @param context 画坦克的画布
 * @returns
 */
export const EnemyTwo = function (gameInstance) {
	this.ctx = gameInstance.tankCtx;
	this.gameCtx = gameInstance
	this.isAppear = false;
	this.times = 0;
	this.lives = 2;
	this.isAI = true;
	this.speed = 1;

	this.draw = function () {
		this.times++;
		if (!this.isAppear) {
			var temp = parseInt(this.times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if (this.times == 35) {
				this.isAppear = true;
				this.times = 0;
				this.shoot(2, this.gameCtx);
			}
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy2"][0] + this.dir * this.size, POS["enemy2"][1], 32, 32, this.x, this.y, 32, 32);
			//以一定的概率射击
			if (this.times % 50 == 0) {
				var ra = Math.random();
				if (ra < this.shootRate) {
					this.shoot(2, this.gameCtx);
				}
				this.times = 0;
			}
			this.move(this.gameCtx);
		}
	};
	//根据服务器返回数据来绘制
	this.drawByServerData = function (times, isAppear, x, y, dir) {
		if (!isAppear) {
			let temp = parseInt(times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, x, y, 32, 32);
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy2"][0] + dir * this.size, POS["enemy2"][1], 32, 32, x, y, 32, 32);
		}
	}

	this.onlineDraw = function (tankIndex) {
		if (!this.isAppear) {
			this.times++;
			var temp = parseInt(this.times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if (this.times == 34) {
				this.isAppear = true;
				this.times = 0;
				//通知服务器坦克已经appear
				const content = new SocketMessage(
					"client",
					this.gameCtx.clientName,
					MSG_TYPE_CLIENT.MSG_SYNC,
					new SyncMsg("enemy_isappear_change", SYNC_CLIENT_TYPE.ENEMY_ISAPPEAR, { index: tankIndex, value: this.isAppear })
				);
				//发送到服务器
				eventBus.emit('sendtoserver', content)
			}
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy2"][0] + this.dir * this.size, POS["enemy2"][1], 32, 32, this.x, this.y, 32, 32);
		}
	}

};
EnemyTwo.prototype = new Tank();



/**
 * 敌方坦克3
 * @param context 画坦克的画布
 * @returns
 */
export const EnemyThree = function (gameInstance) {
	this.ctx = gameInstance.tankCtx;
	this.gameCtx = gameInstance
	this.isAppear = false;
	this.times = 0;
	this.lives = 3;
	this.isAI = true;
	this.speed = 0.5;

	this.draw = function () {
		this.times++;
		if (!this.isAppear) {
			var temp = parseInt(this.times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if (this.times == 35) {
				this.isAppear = true;
				this.times = 0;
				this.shoot(2, this.gameCtx);
			}
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy3"][0] + this.dir * this.size + (3 - this.lives) * this.size * 4, POS["enemy3"][1], 32, 32, this.x, this.y, 32, 32);
			//以一定的概率射击
			if (this.times % 50 == 0) {
				var ra = Math.random();
				if (ra < this.shootRate) {
					this.shoot(2, this.gameCtx);
				}
				this.times = 0;
			}
			this.move(this.gameCtx);
		}

	};
	//根据服务器返回数据来绘制
	this.drawByServerData = function (times, isAppear, x, y, dir) {
		if (!isAppear) {
			let temp = parseInt(times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, x, y, 32, 32);
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy3"][0] + dir * this.size, POS["enemy3"][1], 32, 32, x, y, 32, 32);
		}
	}
	this.onlineDraw = function (tankIndex) {
		if (!this.isAppear) {
			this.times++;
			var temp = parseInt(this.times / 5) % 7;
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemyBefore"][0] + temp * 32, POS["enemyBefore"][1], 32, 32, this.x, this.y, 32, 32);
			if (this.times == 34) {
				this.isAppear = true;
				this.times = 0;
				//通知服务器坦克已经appear
				const content = new SocketMessage(
					"client",
					this.gameCtx.clientName,
					MSG_TYPE_CLIENT.MSG_SYNC,
					new SyncMsg("enemy_isappear_change", SYNC_CLIENT_TYPE.ENEMY_ISAPPEAR, { index: tankIndex, value: this.isAppear })
				);
				//发送到服务器
				eventBus.emit('sendtoserver', content)
			}
		} else {
			this.ctx.drawImage(RESOURCE_IMAGE, POS["enemy3"][0] + this.dir * this.size, POS["enemy3"][1], 32, 32, this.x, this.y, 32, 32);
		}
	}

};
EnemyThree.prototype = new Tank();






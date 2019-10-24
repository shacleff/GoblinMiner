import BossData from "./data/BossData";
import Logic from "./Logic";
import GameWorld from "./GameWorld";
import { EventConstant } from "./EventConstant";
import AudioPlayer from "./utils/AudioPlayer";
import Random from "./utils/Random";
import TileData from "./data/TileData";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Boss extends cc.Component {
    static readonly BOSS000 = 'boss000';
    static readonly BOSS001 = 'boss001';
    data:BossData;
    sprite:cc.Sprite;
    isDied = false;
    anim:cc.Animation;
    isHurt = false;
    gameWorld:GameWorld;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.on(EventConstant.BOSS_HURT, (event) => {
            this.takeDamge(event.detail.damage);
        })
    }

    start () {
    }
    onEnable(){
       let health = Math.floor(Logic.currentLevel*10);
        if(health<1){
            health = 5;
        }
        this.isHurt = false;
        this.isDied = false;
        this.data = new BossData(0,'boss000',cc.v2(4,1),3,3,cc.v2(health,health));
        this.showBoss();
    }
    takeDamge(damage:number){
        if(this.isDied){
            return;
        }
        this.isHurt = true;
        if(!this.anim){
            this.anim = this.getComponent(cc.Animation);
        }
        this.anim.play('BossHurt');
        this.data.health.x-=damage;
        if(this.data.health.x<=0){
            this.isDied = true;
            this.hideBoss();
            this.clearBossTile();
            this.enabled = false;

        }
        cc.director.emit(EventConstant.HUD_UPDATE_HEATH_BAR, { detail: { health: this.data.health } });
    }
    hideBoss(){
       this.node.position = GameWorld.getPosInMap(cc.v2(this.data.posIndex.x,this.data.posIndex.y-8));
    }
    showAttackAnim(){
        if(!this.anim){
            this.anim = this.getComponent(cc.Animation);
        }
        this.anim.play('BossAttack');
    }
    showBoss(){
        this.node.position = GameWorld.getPosInMap(this.data.posIndex);
        this.node.zIndex = 3000;
        this.changeRes();
        this.scheduleOnce(()=>{
            cc.director.emit(EventConstant.HUD_UPDATE_HEATH_BAR, { detail: { health: this.data.health } });
        },0.1);
    }
    changeRes(){
        if(!this.data){
            return;
        }
        if(!this.sprite){
            this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        }
        let suffix = '';
        this.sprite.node.width = GameWorld.TILE_SIZE*this.data.width;
        this.sprite.node.height = GameWorld.TILE_SIZE*this.data.height;
        this.sprite.spriteFrame = Logic.spriteFrames[this.data.resName+suffix];
        this.sprite.node.opacity = 200;
    }
    bossAction(){
        switch(this.data.resName){
            case Boss.BOSS000:this.addObstacle();break;
            case Boss.BOSS001:this.addObstacle();break;
        }
    }
    private addObstacle() {
        if (this.isDied||!this.enabled||!this.gameWorld) {
            return;
        }
        
        let obstacleLevel = 0;
        if(Logic.currentLevel>2){
            obstacleLevel = 1;
        }
        if(Logic.currentLevel>4){
            obstacleLevel = 2;
        }
        cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.FALL_TILE } });
        if(this.isHurt){
            this.isHurt = false;
            return;
        }
        this.showAttackAnim();
        let arr: cc.Vec2[] = new Array();
        for (let i = 0; i < this.gameWorld.map.length; i++) {
            for (let j = 0; j < this.gameWorld.map[0].length; j++) {
                if (!this.gameWorld.map[i][j].data.isBoss && !this.gameWorld.map[i][j].data.isObstacle && !this.gameWorld.map[i][j].data.isEmpty) {
                    arr.push(cc.v2(i, j));
                }
            }
        }
        if (arr.length > 0) {
            let count = 1+Logic.currentLevel;
            if(count>4){
                count = 4;
            }
            for(let i = 0;i <count;i++){
                let rand = Random.getRandomNum(0, arr.length);
                let pos = arr[rand];
                if(arr.length>1){
                    arr.splice(rand,1);
                }
                this.gameWorld.map[pos.x][pos.y].initTile(TileData.getObstacleTileData(pos.x, pos.y, Random.getRandomNum(0,obstacleLevel)));
            }
        }
    }
    clearBossTile() {
        for (let i = 0; i < this.gameWorld.map.length; i++) {
            for (let j = 0; j < this.gameWorld.map[0].length; j++) {
                if (this.gameWorld.map[i][j].data.isBoss) {
                    this.gameWorld.map[i][j].node.opacity = 0;
                    this.gameWorld.map[i][j].initTile(TileData.getEmptyTileData(i, j));
                }
            }
        }
    }
}

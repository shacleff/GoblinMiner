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
    static RES_NAMES = ['boss000','boss000','boss000','boss000','boss001','boss001','boss001','boss001'];
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
        let res = `boss00${Logic.currentLevel}`;
        if(Logic.currentLevel<Boss.RES_NAMES.length){
            res = Boss.RES_NAMES[Logic.currentLevel];
        }
        this.data = new BossData(Logic.currentLevel,res,cc.v2(4,1),3,3,cc.v2(health,health));
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
            Logic.step += 3;

        }
        cc.director.emit(EventConstant.HUD_UPDATE_HEATH_BAR, { detail: { health: this.data.health } });
    }
    hideBoss(){
       this.node.setPosition(GameWorld.getPosInMap(cc.v2(this.data.posIndex.x,this.data.posIndex.y-8)));
    }
    showAttackAnim(){
        if(!this.anim){
            this.anim = this.getComponent(cc.Animation);
        }
        this.anim.play('BossAttack');
    }
    showBoss(){
        this.node.setPosition(GameWorld.getPosInMap(this.data.posIndex));
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
        if (this.isDied||!this.enabled||!this.gameWorld) {
            return;
        }
        if(this.isHurt){
            this.isHurt = false;
            return;
        }
        this.showAttackAnim();
        switch(this.data.id){
            case 0:this.addObstacle(0,1);break;
            case 1:this.addObstacle(1,1);break;
            case 2:this.addObstacle(0,2);break;
            case 3:this.addObstacle(1,2);break;
            case 4:this.addFrozen(1,1);break;
            case 5:this.addFrozen(2,1);break;
            case 6:this.addFrozen(3,1);break;
            case 7:this.addFrozen(3,2);break;
            default:this.addFrozen(3,3);break;
        }
    }
    private getValidArr(frozenAllowed:boolean): cc.Vec2[]{
        let arr: cc.Vec2[] = new Array();
        for (let i = 0; i < this.gameWorld.map.length; i++) {
            for (let j = 0; j < this.gameWorld.map[0].length; j++) {
                if(frozenAllowed){
                    if (!this.gameWorld.isOBETile(cc.v2(i,j))) {
                        arr.push(cc.v2(i, j));
                    }
                }else{
                    if (!this.gameWorld.isOBEFTile(cc.v2(i,j))) {
                        arr.push(cc.v2(i, j));
                    }
                }
            }
        }
        return arr;
    }
    private addFrozen(frozenLevel:number,sum:number) {
        cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.FALL_TILE } });
        let arr: cc.Vec2[] = this.getValidArr(false);
        if (arr.length > 0) {
            for(let i = 0;i <sum;i++){
                let rand = Random.getRandomNum(0, arr.length);
                let pos = arr[rand];
                if(arr.length>1){
                    arr.splice(rand,1);
                }
                this.gameWorld.map[pos.x][pos.y].data.frozenLevel = frozenLevel;
                if(frozenLevel>0){
                    this.gameWorld.map[pos.x][pos.y].data.isFrozen = true; 
                }
                this.gameWorld.map[pos.x][pos.y].updateTile();
            }
        }
    }
    private addObstacle(obstacleLevel:number,obstacleSum:number) {
        cc.director.emit(EventConstant.PLAY_AUDIO, { detail: { name: AudioPlayer.FALL_TILE } });
        let arr: cc.Vec2[] = this.getValidArr(true);
        if (arr.length > 0) {
            for(let i = 0;i <obstacleSum;i++){
                let rand = Random.getRandomNum(0, arr.length);
                let pos = arr[rand];
                if(arr.length>1){
                    arr.splice(rand,1);
                }
                this.gameWorld.map[pos.x][pos.y].initTile(TileData.getObstacleTileData(pos.x, pos.y, obstacleLevel,0));
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

import BossData from "./data/BossData";
import Logic from "./Logic";
import GameWorld from "./GameWorld";
import { EventConstant } from "./EventConstant";

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

    data:BossData;
    sprite:cc.Sprite;
    isDied = false;
    anim:cc.Animation;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.on(EventConstant.BOSS_HURT, (event) => {
            this.takeDamge(event.detail.damage);
        })
    }

    start () {
    }
    onEnable(){
       let health = Math.floor(Logic.level/3*2);
        if(health<1){
            health = 1;
        }
        this.isDied = false;
        this.data = new BossData(0,'boss000',cc.v2(4,1),3,3,cc.v2(health,health));
        this.init();
    }
    takeDamge(damage:number){
        if(this.isDied){
            return;
        }
        if(!this.anim){
            this.anim = this.getComponent(cc.Animation);
        }
        this.anim.play('BossHurt');
        this.data.health.x-=damage;
        if(this.data.health.x<=0){
            this.isDied = true;
            this.kill();
        }
        cc.director.emit(EventConstant.HUD_UPDATE_HEATH_BAR, { detail: { health: this.data.health } });
    }
    kill(){
       this.node.position = GameWorld.getPosInMap(cc.v2(this.data.posIndex.x,this.data.posIndex.y-8));
    }
    attack(){
        if(!this.anim){
            this.anim = this.getComponent(cc.Animation);
        }
        this.anim.play('BossAttack');
    }
    init(){
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
    // update (dt) {}
}

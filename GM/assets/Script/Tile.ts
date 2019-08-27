import TileData from "./data/TileData";
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
export default class Tile extends cc.Component {

    data:TileData;
    sprite:cc.Sprite;
    glow:cc.Node;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        this.glow = this.node.getChildByName('glow');
        this.glow.opacity = 0;
        this.node.on(cc.Node.EventType.TOUCH_START,()=>{
            this.glow.opacity = 80;
        },this);
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{
            cc.director.emit(EventConstant.TILE_CLICK,{detail:{posIndex:this.data.posIndex}});
            this.glow.opacity = 0;
        },this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,()=>{
            this.glow.opacity = 0;
        },this);
    }

    initTile(data:TileData){
        this.data =data;
        if(!this.sprite){
            this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        }
        this.sprite.spriteFrame = Logic.spriteFrames[data.resName];
        if(data.isGround&&Logic.spriteFrames[data.resName+'ground']){
            this.sprite.spriteFrame = Logic.spriteFrames[data.resName+'ground'];
        }
        this.node.position = GameWorld.getPosInMap(data.posIndex);
    }
    updateTile(){
        if(!this.sprite){
            this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        }
        this.sprite.spriteFrame = this.data.isGround?Logic.spriteFrames[this.data.resName+'ground']:Logic.spriteFrames[this.data.resName];
        this.node.position = GameWorld.getPosInMap(this.data.posIndex);
    }
    start () {

    }
    changeTile(){

    }

    // update (dt) {}
}

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

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        this.node.on(cc.Node.EventType.TOUCH_START,()=>{
            cc.director.emit(EventConstant.TILE_CLICK,{detail:{tileData:this.data}});
        },this);
        this.node.on(cc.Node.EventType.TOUCH_END,()=>{},this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,()=>{},this);
    }

    initTile(data:TileData){
        this.data =data;
        if(!this.sprite){
            this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        }
        this.sprite.spriteFrame = data.isGround?Logic.spriteFrames[data.resName+'ground']:Logic.spriteFrames[data.resName];
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

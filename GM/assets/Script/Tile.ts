import TileData from "./data/TileData";
import Logic from "./Logic";
import GameWorld from "./GameWorld";
import { EventConstant } from "./EventConstant";
import Utils from "./utils/Utils";

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
            if(!Logic.isPaused){
                this.glow.opacity = 80;
            }
        },this);
        this.node.on(cc.Node.EventType.TOUCH_END,(event:cc.Event.EventTouch)=>{
            this.glow.opacity = 0;
        },this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,(event:cc.Event.EventTouch)=>{
            if(Logic.isProcessing||Logic.isPaused){
                this.glow.opacity = 0;
                return;
            }
            let end = this.node.convertToNodeSpace(event.getLocation());
            let pos = this.data.posIndex.clone();
            if(Utils.getDistance(cc.v2(0,0),end)<32){
                return;
            }
            if(Math.abs(end.x)>Math.abs(end.y)){
                pos.x = end.x>0?pos.x+1:pos.x-1;
            }else{
                pos.y = end.y>0?pos.y+1:pos.y-1;
            }
            cc.director.emit(EventConstant.TILE_SWITCH,{detail:{tapPos:this.data.posIndex,targetPos:pos}});
            
            this.glow.opacity = 0;
        },this);
    }

    initTile(data:TileData){
        this.data =data;
        this.changeRes();
        this.node.position = GameWorld.getPosInMap(data.posIndex);
    }
    updateTile(){
        this.changeRes();
        this.node.position = GameWorld.getPosInMap(this.data.posIndex);
    }
    changeRes(){
        if(!this.sprite){
            this.sprite = this.node.getChildByName('sprite').getComponent(cc.Sprite);
        }
        let suffix = '';
        switch(this.data.tileSpecial){
            case 0:suffix='';break;
            case 1:suffix='four1';break;
            case 2:suffix='four2';break;
            case 3:suffix='cross';break;
            case 4:suffix='five';break;
        }
        this.sprite.spriteFrame = Logic.spriteFrames[this.data.resName+suffix];
    }
    start () {

    }
    changeTile(){

    }

    // update (dt) {}
}

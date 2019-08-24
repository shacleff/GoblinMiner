import GameWorld from "./GameWorld";
import { EventConstant } from "./EventConstant";
import Utils from "./utils/Utils";

// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraControl extends cc.Component {

    @property(GameWorld)
    world: GameWorld = null;

    camera:cc.Camera;
    isZoomUp = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.camera = this.getComponent(cc.Camera);
        cc.director.on(EventConstant.ZOOM_UP, (event) => {
             this.isZoomUp=event.detail.isUp;
            });
    }
    onEnable(){
    }
    onDisable(){
    }

    start () {

    }
    lateUpdate(){
        if(this.world&&this.world.player){
            let targetPos = this.world.player.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
            this.node.position = Utils.lerp(this.node.position,this.node.parent.convertToNodeSpaceAR(targetPos),0.1);
            if(this.isZoomUp){
                this.zoomUp();
            }else{
                this.zoomDown();
            }
        }
    }
    zoomUp(){
        this.camera.zoomRatio = Utils.lerpnum(this.camera.zoomRatio,0.5,0.05);
    }
    zoomDown(){
        this.camera.zoomRatio = Utils.lerpnum(this.camera.zoomRatio,1,0.05);
    }
    // update (dt) {}
}

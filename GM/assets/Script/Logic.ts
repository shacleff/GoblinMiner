// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Logic extends cc.Component {
    static isPaused = false;
    static isProcessing = false;
    static score = 0;
    static target = 10000;
    static step =20;
    static maxstep = 20;
    //图片资源
    static spriteFrames: { [key: string]: cc.SpriteFrame } = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.setFrameRate(45);
        cc.game.addPersistRootNode(this.node);
        cc.view.enableAntiAlias(false);
        // cc.director.setDisplayStats(false);
        // cc.game.setFrameRate(60);
        // cc.game.addPersistRootNode(this.node);
        // cc.view.enableAntiAlias(false);
        // cc.macro.DOWNLOAD_MAX_CONCURRENT = 10;
        // let manager = cc.director.getCollisionManager();
        // manager.enabled = true;
        // cc.director.getPhysicsManager().enabled = true;
        // manager.enabledDebugDraw = true;
        //     cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        // cc.PhysicsManager.DrawBits.e_pairBit |
        // cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        // cc.PhysicsManager.DrawBits.e_jointBit |
        // cc.PhysicsManager.DrawBits.e_shapeBit;
    }
    static reset(target:number,step:number){
        Logic.isProcessing = false;
        Logic.score = 0;
        Logic.step = step;
        Logic.maxstep = step;
        Logic.target = target;
    }

    start() {

    }

    // update (dt) {}
}

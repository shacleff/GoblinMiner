import Logic from "./Logic";

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
export default class Loading extends cc.Component {

    @property(cc.Node)
    ui: cc.Node = null;
    private timeDelay = 0;
    private isSpriteFramesLoaded = false;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.loadSpriteFrames();
    }
    loadSpriteFrames() {
        if (Logic.spriteFrames) {
            this.isSpriteFramesLoaded = true;
            return;
        }
        cc.loader.loadResDir('Texture', cc.SpriteFrame, (err: Error, assert: cc.SpriteFrame[]) => {
            Logic.spriteFrames = {};
            for (let frame of assert) {
                Logic.spriteFrames[frame.name] = frame;
            }
            this.isSpriteFramesLoaded = true;
            cc.log('texture loaded');
        })
    }
    update(dt) {
        this.timeDelay += dt;
        if (this.timeDelay > 0.16 && this.isSpriteFramesLoaded) {
            this.timeDelay = 0;
            this.isSpriteFramesLoaded = false;
            cc.director.preloadScene('game',()=>{},()=>{
                this.ui.runAction(cc.fadeOut(0.1));
                this.scheduleOnce(()=>{cc.director.loadScene('game');},0.1);
            })
        }

    }
}

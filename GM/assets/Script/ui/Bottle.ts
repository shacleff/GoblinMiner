// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bottle extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    water: cc.Node = null;
    @property(cc.Node)
    wave:cc.Node = null;
    @property(cc.Node)
    bubble:cc.Node = null;
    // LIFE-CYCLE CALLBACKS:
    private index = 0;
    private isReverse = false;
    progress = 0;
    onLoad() {
    }
    drawWater(percent: number) {
        this.water.height = this.node.height*percent;
        this.wave.y = this.water.height;
    }

    start() {

    }
    checkTimeDelay = 0;
    isCheckTimeDelay(dt: number): boolean {
        this.checkTimeDelay += dt;
        if (this.checkTimeDelay > 0.15) {
            this.checkTimeDelay = 0;
            return true;
        }
        return false;
    }
    update(dt: number) {
        this.drawWater(this.progress);
        if (this.isCheckTimeDelay(dt)) {
            this.bubble.opacity = this.progress>0.5?255:0;
            this.wave.opacity = this.progress>0?255:0;
        }

    }
}

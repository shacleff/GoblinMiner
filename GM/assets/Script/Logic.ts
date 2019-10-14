import ProfileManager from "./manager/ProfileManager";

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
    static level = 0;
    static coin = 0;
    static oil = 0;
    static target = 100000000;
    static step =15;
    static maxstep = 15;
    //图片资源
    static spriteFrames: { [key: string]: cc.SpriteFrame } = null;
    static redpower = 0;
    static bluepower = 0;
    static purplepower = 0;
    static greenpower = 0;
    static maxredpower = 20;
    static maxbluepower = 20;
    static maxpurplepower = 20;
    static maxgreenpower = 20;
    static maxoilpower = 50;
    static profile:ProfileManager = new ProfileManager();
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        cc.game.setFrameRate(60);
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
    static updateElements(arr:number[],needChange:boolean):boolean{
        let r = Logic.getElementNumber(Logic.redpower,Logic.maxredpower,arr[0]);
        let b = Logic.getElementNumber(Logic.bluepower,Logic.maxbluepower,arr[1]);
        let p = Logic.getElementNumber(Logic.purplepower,Logic.maxpurplepower,arr[2]);
        let g = Logic.getElementNumber(Logic.greenpower,Logic.maxgreenpower,arr[3]);
        let o = Logic.getElementNumber(Logic.oil,Logic.maxoilpower,arr[4]);
        let c = Logic.getElementNumber(Logic.coin,-1,arr[5]);
        if(r.y<1||b.y<1||p.y<1||g.y<1||o.y<1||c.y<1){
            return false;
        }
        if(needChange){
            Logic.redpower = r.x;
            Logic.bluepower = b.x;
            Logic.greenpower = g.x;
            Logic.purplepower = p.x;
            Logic.oil = o.x;
            Logic.coin = c.x;
        }
        return true;
    }
    /**参数一是数值，参数二代表赋值是否成功 0：失败 1：成功 */
    static getElementNumber(value:number,max:number,offset:number):cc.Vec2{
        if(value-offset<0){
            return cc.v2(value,0);
        }
        if(max!=-1&&value-offset>max){
            value = max;
        }
        return cc.v2(value-offset,1);
    }
    static reset(target:number,step:number){
        Logic.isProcessing = false;
        Logic.level = Logic.profile.data.level;
        Logic.coin = Logic.profile.data.coins;
        Logic.oil = 0;
        Logic.redpower = 0;
        Logic.bluepower = 0;
        Logic.greenpower = 0;
        Logic.purplepower = 0;
        Logic.step = step;
        Logic.maxstep = step;
        Logic.target = target;
    }

    start() {

    }

    // update (dt) {}
}

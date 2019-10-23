import ProfileManager from "./manager/ProfileManager";
import SkillData from "./data/SkillData";
import Elements from "./manager/Elements";

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
    static readonly METRE_LENGTH = 10;
    static readonly MAX_STEP = 15;
    static isPaused = false;
    static isProcessing = false;
    static level = 0;//整体关卡等级
    static currentMeter = 0;//当前关卡的深度，每次下沉增加4米，在第20米遇到boss
    static currentLevel = 0;//当前关卡的等级,每次开局设置选择的关卡等级
    static step = 15;
    static coin = 0;
    //图片资源
    static spriteFrames: { [key: string]: cc.SpriteFrame } = null;
    //技能
    static skills: { [key: string]: SkillData } = null;
    static elements = new Elements();
    static profile: ProfileManager = new ProfileManager();
    static isUseSkillSwipe = false;//是否使用滑动技能
    static isUseSkillChoose = false;//是否使用选择技能
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
    static updateElements(arr: number[], needChange: boolean): boolean {
        return Logic.elements.updateElements(arr, needChange);
    }

    static reset() {
        Logic.isProcessing = false;
        Logic.isUseSkillSwipe = false;
        Logic.isUseSkillChoose = false;
        Logic.level = Logic.profile.data.level;
        Logic.coin = Logic.profile.data.coins;
        Logic.currentLevel = 0;
        Logic.elements = new Elements();
        Logic.elements.coin = Logic.coin;
        Logic.step = Logic.MAX_STEP;
        Logic.currentMeter = 0;
    }
    static needBoss(): boolean {
        if (Logic.currentMeter >= Logic.METRE_LENGTH) {
            return true;
        }
        return false;
    }
    static saveData() {
        if(Logic.currentLevel+1>Logic.level){
            Logic.level = Logic.currentLevel+1;
        }
        Logic.profile.data.level = Logic.level;
        Logic.profile.data.coins = Logic.coin;
        Logic.profile.saveData();
    }
    static loadGame(selectLevel:number){
        Logic.reset();
        Logic.currentLevel = selectLevel;
        cc.director.loadScene('loading');
    }
    start() {

    }

    // update (dt) {}
}

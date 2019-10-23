import Logic from "./Logic";
import { EventConstant } from "./EventConstant";
import Utils from "./utils/Utils";
import AudioPlayer from "./utils/AudioPlayer";
import SkillManager from "./manager/SkillManager";
import SkillIcon from "./SkillIcon";
import GameWorld from "./GameWorld";

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
export default class NewClass extends cc.Component {

    @property(cc.Label)
    steplabel: cc.Label = null;
    @property(cc.Label)
    levellabel: cc.Label = null;
    @property(cc.Label)
    coinlabel: cc.Label = null;
    @property(cc.Node)
    againDialog:cc.Node = null;
    @property(cc.Sprite)
    dialogPlayer:cc.Sprite = null;
    @property(cc.Prefab)
    skillPrefab:cc.Prefab = null;
    @property(GameWorld)
    gameWorld:GameWorld = null;
    healthBar:cc.ProgressBar = null;
    healthLabel:cc.Label = null;    
    redbar:cc.ProgressBar = null;
    bluebar:cc.ProgressBar = null;
    purplebar:cc.ProgressBar = null;
    greenbar:cc.ProgressBar = null;
    oilbar:cc.ProgressBar = null;
    redlabel:cc.Label = null;
    bluelabel:cc.Label = null;
    purplelabel:cc.Label = null;
    greenlabel:cc.Label = null;
    oillabel:cc.Label = null;
    
    skillNode:cc.Node = null;
    skillList:SkillIcon[] = [];
    skillManager:SkillManager = new SkillManager();
    skillTipsNode:cc.Node = null;

    bossHealth:cc.Vec2 = cc.v2(0,0);

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.on(EventConstant.GAME_OVER, (event) => {
            this.gameOver(event.detail.over);
        })
        cc.director.on(EventConstant.HUD_UPDATE_HEATH_BAR, (event) => {
            this.bossHealth = cc.v2(event.detail.health.x,event.detail.health.y);
        })
        this.healthBar = this.node.getChildByName('healthBar').getComponent(cc.ProgressBar);
        this.healthLabel = this.node.getChildByName('healthBar').getChildByName('label').getComponent(cc.Label);
        this.redbar = this.node.getChildByName('bar').getChildByName('redbar').getComponent(cc.ProgressBar);
        this.bluebar = this.node.getChildByName('bar').getChildByName('bluebar').getComponent(cc.ProgressBar);
        this.purplebar = this.node.getChildByName('bar').getChildByName('purplebar').getComponent(cc.ProgressBar);
        this.greenbar = this.node.getChildByName('bar').getChildByName('greenbar').getComponent(cc.ProgressBar);
        this.oilbar = this.node.getChildByName('bar').getChildByName('oilbar').getComponent(cc.ProgressBar);
        this.redlabel = this.node.getChildByName('bar').getChildByName('redbar').getChildByName('label').getComponent(cc.Label);
        this.bluelabel = this.node.getChildByName('bar').getChildByName('bluebar').getChildByName('label').getComponent(cc.Label);
        this.purplelabel = this.node.getChildByName('bar').getChildByName('purplebar').getChildByName('label').getComponent(cc.Label);
        this.greenlabel = this.node.getChildByName('bar').getChildByName('greenbar').getChildByName('label').getComponent(cc.Label);
        this.oillabel = this.node.getChildByName('bar').getChildByName('oilbar').getChildByName('label').getComponent(cc.Label);
        this.skillTipsNode = this.node.getChildByName('skillTips');
        this.skillNode = this.node.getChildByName('skill');
        this.skillNode.removeAllChildren();
        this.skillManager.gameWorld = this.gameWorld;
        for(let key in Logic.skills){
            let pb = cc.instantiate(this.skillPrefab);
            let icon = pb.getComponent(SkillIcon);
            this.skillList.push(icon);
            this.skillNode.addChild(pb);
            icon.data.valueCopy(Logic.skills[key]);
            icon.init(this.skillManager,this.skillTipsNode);
        }
    }
    //button
    playAgain(){
        this.againDialog.active = false;
        Logic.isPaused = false;
        cc.director.emit(EventConstant.INIT_MAP);
        if(Logic.target<=Logic.level){
            Logic.reset(Logic.target+100,Logic.maxstep+5);
        }else{
            Logic.reset(Logic.target,Logic.maxstep);
        }
    }
    goHome(){
        Logic.reset(Logic.target,Logic.maxstep);
        cc.director.loadScene('main');
    }
    gameOver(over:boolean){
        this.dialogPlayer.spriteFrame = Logic.spriteFrames[over?'player4':'player']
        this.againDialog.active = true;
        Logic.isPaused = true;
        
    }

    start () {

    }
  
    checkTimeDelay = 0;
    isCheckTimeDelay(dt: number): boolean {
        this.checkTimeDelay += dt;
        if (this.checkTimeDelay > 0.5) {
            this.checkTimeDelay = 0;
            return true;
        }
        return false;
    }
    update (dt) {
        
        this.steplabel.string = `${Logic.step}`;
        this.levellabel.string = `Lv：${Logic.level}`;
        this.coinlabel.string = `：${Logic.coin}`;
        this.redlabel.string = `${Logic.redpower}/${Logic.maxredpower}`
        this.bluelabel.string = `${Logic.bluepower}/${Logic.maxbluepower}`
        this.purplelabel.string = `${Logic.purplepower}/${Logic.maxpurplepower}`
        this.greenlabel.string = `${Logic.greenpower}/${Logic.maxgreenpower}`
        this.oillabel.string = `${Logic.oil}/${Logic.maxoilpower}`
        this.redbar.progress = Utils.lerpnum(this.redbar.progress,Logic.redpower/Logic.maxredpower,dt*5);
        this.bluebar.progress = Utils.lerpnum(this.bluebar.progress,Logic.bluepower/Logic.maxbluepower,dt*5);
        this.purplebar.progress = Utils.lerpnum(this.purplebar.progress,Logic.purplepower/Logic.maxpurplepower,dt*5);
        this.greenbar.progress = Utils.lerpnum(this.greenbar.progress,Logic.greenpower/Logic.maxgreenpower,dt*5);
        this.oilbar.progress = Utils.lerpnum(this.oilbar.progress,Logic.oil/Logic.maxoilpower,dt*5);
        this.healthBar.progress = Utils.lerpnum(this.healthBar.progress,this.bossHealth.x/this.bossHealth.y,dt*5);
        this.healthLabel.string = `${this.bossHealth.x}/${this.bossHealth.y}`;
        this.healthBar.node.opacity = this.bossHealth.x<=0?0:255;
        
    }
}

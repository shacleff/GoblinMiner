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
    @property(cc.Node)
    homeDialog:cc.Node = null;
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
        Logic.reset();
        cc.director.emit(EventConstant.INIT_MAP);

    }
    goHome(){
        Logic.reset();
        cc.director.loadScene('main');
    }
    cheat(){
        this.gameOver(false);
    }
    gameOver(over:boolean){
        if(!over){
            Logic.saveData();
            Logic.reset();
            cc.director.loadScene('mine');
            return;
        }
        this.dialogPlayer.spriteFrame = Logic.spriteFrames['player4']
        this.againDialog.active = true;
        Logic.isPaused = true;
        
    }
    showHomeDialog(){
        this.homeDialog.active = !this.homeDialog.active;
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
        this.levellabel.string = `深度：${Logic.currentLevel*Logic.METRE_LENGTH+Logic.currentMeter}米`;
        this.coinlabel.string = `：${Logic.coin}`;
        this.redlabel.string = `${Logic.elements.red}/${Logic.elements.redmax}`
        this.bluelabel.string = `${Logic.elements.blue}/${Logic.elements.bluemax}`
        this.purplelabel.string = `${Logic.elements.purple}/${Logic.elements.purplemax}`
        this.greenlabel.string = `${Logic.elements.green}/${Logic.elements.greenmax}`
        this.oillabel.string = `${Logic.elements.oil}/${Logic.elements.oilmax}`
        this.redbar.progress = Utils.lerpnum(this.redbar.progress,Logic.elements.red/Logic.elements.redmax,dt*5);
        this.bluebar.progress = Utils.lerpnum(this.bluebar.progress,Logic.elements.blue/Logic.elements.bluemax,dt*5);
        this.purplebar.progress = Utils.lerpnum(this.purplebar.progress,Logic.elements.purple/Logic.elements.purplemax,dt*5);
        this.greenbar.progress = Utils.lerpnum(this.greenbar.progress,Logic.elements.green/Logic.elements.greenmax,dt*5);
        this.oilbar.progress = Utils.lerpnum(this.oilbar.progress,Logic.elements.oil/Logic.elements.oilmax,dt*5);
        if(this.bossHealth.y != 0){
            this.healthBar.progress = Utils.lerpnum(this.healthBar.progress,this.bossHealth.x/this.bossHealth.y,dt*5);
        }
        this.healthLabel.string = `${this.bossHealth.x}/${this.bossHealth.y}`;
        this.healthBar.node.opacity = this.bossHealth.x<=0?0:255;
        
    }
}
